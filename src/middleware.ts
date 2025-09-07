import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const tokenExpiry = request.cookies.get('tokenExpiry')?.value;
    
    const { pathname } = request.nextUrl;
    
    const protectedPaths = ['/news', '/members', '/career'];
    
    const isTokenExpired = tokenExpiry ? Date.now() > parseInt(tokenExpiry) : true;
    
    if (protectedPaths.some(path => pathname.startsWith(path))) {
        if (!accessToken || (!refreshToken && isTokenExpired)) {
            console.log('No valid tokens, redirecting to login');
            return NextResponse.redirect(new URL('/', request.url)); 
        }
        
        if (isTokenExpired && refreshToken) {
            console.log('Access token expired, will be refreshed on client side');
            return NextResponse.next();
        }
    }
    
    if (pathname === '/' && accessToken && !isTokenExpired) {
        console.log('User already authenticated, redirecting to news');
        return NextResponse.redirect(new URL('/news', request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/', 
        '/news/:path*',
        '/members/:path*',
        '/career/:path*',
    ],
};