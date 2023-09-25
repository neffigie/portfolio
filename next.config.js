/** The parsed `process.env.NEXT_PUBLIC_POCKETBASE_URL`. */
const pocketbaseUrl = new URL(process.env.NEXT_PUBLIC_POCKETBASE_URL);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        remotePatterns: [
            {
                protocol: pocketbaseUrl.protocol.split(":")[0],
                hostname: pocketbaseUrl.hostname,
                port: pocketbaseUrl.port,
                pathname: "/api/**",
            },
        ],
    },

    /* webpack(config) {
		// Fixes "Module not found: Can't resolve 'fs'" (https://stackoverflow.com/a/70995196/20697358)
		// webpack5 is now the default (https://nextjs.org/docs/messages/future-webpack5-moved-to-webpack5)
		config.resolve.fallback = { ...config.resolve.fallback, fs: false };

		return config;
	},*/
};

module.exports = nextConfig;
