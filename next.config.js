/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  /*images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'https://pocketbase-docker.fly.dev/', 
        port: '', 
        pathname: 'api/**'
      }
    ]
  },*/
  experimental: { appDir: true },

  // Fixes Module not found: Can't resolve 'fs' (https://stackoverflow.com/a/70995196/20697358)
  // webpack5 is now the default (https://nextjs.org/docs/messages/future-webpack5-moved-to-webpack5)
  webpack(config) {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false }
    return config;
  },
}

module.exports = nextConfig
