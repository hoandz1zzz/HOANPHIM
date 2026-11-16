/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.nguonc.com',
      },
      {
        protocol: 'http',
        hostname: '**.nguonc.com',
      },
    ],
  },
};

export default nextConfig;
