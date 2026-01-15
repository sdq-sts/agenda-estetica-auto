/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel deployment optimizations
  output: 'standalone',
  poweredByHeader: false,
}

export default nextConfig
