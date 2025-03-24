import path from 'node:path';
import { type NextConfig } from 'next';

const nextConfig: NextConfig = {
	output: 'standalone',
	webpack: (config) => {
		// Fixes: jsonld.InvalidUrl: Dereferencing a URL did not result in a valid JSON-LD object. [...]
		// caused by top level await in the ky-universal package
		config.resolve.alias['ky-universal'] = path.resolve(
			__dirname,
			'./node_modules/ky',
		);

		return config;
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: true,
	},
	experimental: {
		// Fix build error caused by the @gaia-x/did-web-generator package:
		// `x await isn't allowed in non-async function`
		// see https://github.com/vercel/next.js/discussions/61018
		serverMinification: false,
	},
};

module.exports = nextConfig;
