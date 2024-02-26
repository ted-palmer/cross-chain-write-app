/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets.relay.link'],
    unoptimized: true,
  },
}

export default nextConfig
