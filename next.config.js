/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    loader: 'akamai',
    path: '/',
    domains: ['media-exp1.licdn.com', 'pocketbase-docker.fly.dev']
  },
  // experimental: { appDir: true }
}

module.exports = nextConfig
