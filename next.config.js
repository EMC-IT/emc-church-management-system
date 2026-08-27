/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
