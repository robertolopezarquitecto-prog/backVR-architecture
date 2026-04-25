/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // For 360 textures often served from external URLs
  },
};

export default nextConfig;
