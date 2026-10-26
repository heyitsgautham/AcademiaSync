import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The repo root has its own package-lock.json for the root scripts, so name this app's root explicitly.
// Without it Next.js traces from the repo root and nests server.js under .next/standalone/frontend/.
const appRoot = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  outputFileTracingRoot: appRoot,
  turbopack: { root: appRoot },
  // The teacher detail page already lists their courses. Redirecting before rendering
  // answers with a 307 instead of streaming a page that the client then navigates away from.
  async redirects() {
    return [{ source: '/admin/teachers/:id/courses', destination: '/admin/teachers/:id', permanent: false }]
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
