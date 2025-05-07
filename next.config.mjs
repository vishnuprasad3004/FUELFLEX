/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // If you use Firebase Storage for images
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // serverActions: true, // Already enabled by default in newer Next.js versions
  },
};

export default nextConfig;
