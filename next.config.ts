import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	webpack: (config) => {
		config.resolve.alias = {
			...config.resolve.alias,
			"pdfjs-dist": "pdfjs-dist/legacy/build/pdf",
		};
		return config;
	},
};

export default nextConfig;
