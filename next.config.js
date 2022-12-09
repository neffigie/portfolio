/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'https://pocketbase-docker.fly.dev/', 
        port: '', 
        pathname: 'api/**'
      }
    ]
  },
  experimental: { appDir: true }
}

module.exports = nextConfig
