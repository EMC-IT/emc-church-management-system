/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/dashboard/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
