import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  experimental: {
    // Inline critical CSS and defer non-critical stylesheets
    // Eliminates the render-blocking CSS chunk flagged by Lighthouse
    optimizeCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Replace with your actual Supabase project hostname e.g. abcdefghijkl.supabase.co
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
