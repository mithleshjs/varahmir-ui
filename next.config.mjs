/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'images.unsplash.com' }],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.VARAHMIR_API_URL || 'http://localhost:3001'}/:path*`,
      },
    ]
  },
}

export default nextConfig
