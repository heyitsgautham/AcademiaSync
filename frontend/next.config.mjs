import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The repo is an npm workspaces monorepo: dependencies are installed once in the root node_modules.
// Next.js traces files from the repo root so the standalone build carries them, which puts the
// server at .next/standalone/frontend/server.js with node_modules beside it.
const appRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(appRoot, '..')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  outputFileTracingRoot: repoRoot,
  turbopack: { root: repoRoot },
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
