import type { NextConfig } from "next";

const nextConfig = {
    
    async rewrites() {
        return [
            {
                source: '/api-proxy/:path*', 
                destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`, 
            },
        ]
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.has-law.com',
                port: '',
                pathname: '/uploads/**', 
            },
        ],
    },
};

export default nextConfig;
