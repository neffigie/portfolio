/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: { appDir: true }, 
  exportPathMap: function() {
    return {
      '': { page: '/' }, 
      '/posts': { page: '/posts' }, 
      '/projects': { page: '/projects' }
    };
  }
}

module.exports = nextConfig
