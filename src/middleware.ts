import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const tokenExpiry = request.cookies.get('tokenExpiry')?.value;
    const userRole = request.cookies.get('userRole')?.value;
    
    const { pathname } = request.nextUrl;
    
    const protectedPaths = ['/news', '/members', '/career'];
    
    const superAdminPaths = ['/super-admin'];
    
    const isTokenExpired = tokenExpiry ? Date.now() > parseInt(tokenExpiry) : true;
    
    if (superAdminPaths.some(path => pathname.startsWith(path))) {
        if (!accessToken || (!refreshToken && isTokenExpired)) {
            console.log('Super admin: No valid tokens, redirecting to login');
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        if (userRole !== 'superadmin') {
            console.log('Access denied: User is not super admin');
            return NextResponse.redirect(new URL('/news', request.url));
        }
        
        if (isTokenExpired && refreshToken) {
            console.log('Super admin: Access token expired, will be refreshed on client side');
            return NextResponse.next();
        }
    }
    
    if (protectedPaths.some(path => pathname.startsWith(path))) {
        if (!accessToken || (!refreshToken && isTokenExpired)) {
            console.log('Admin: No valid tokens, redirecting to login');
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        if (isTokenExpired && refreshToken) {
            console.log('Admin: Access token expired, will be refreshed on client side');
            return NextResponse.next();
        }
    }
    
    if (pathname === '/' && accessToken && !isTokenExpired) {
        console.log('User already authenticated, redirecting based on role');
        if (userRole === 'superadmin') {
            return NextResponse.redirect(new URL('/super-admin', request.url));
        }
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
        '/super-admin/:path*',
    ],
};