/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! UYARI !!
    // Projenizde tip hataları olsa bile yayına alınmasına izin verir.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Build sırasında ESLint hatalarını görmezden gelir.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;