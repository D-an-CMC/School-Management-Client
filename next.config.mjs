/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/ai/:path*',
        destination: 'http://127.0.0.1:8001/api/ai/:path*',
      },
    ]
  },
}

export default nextConfig
