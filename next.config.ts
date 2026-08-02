import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
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
