/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Increase timeouts for AI generation
  serverActions: {
    bodySizeLimit: '2mb',
  },
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}

export default nextConfig 