import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "user",
    path: "/admin/stats",
    error: { fallback: "Failed to fetch stats" },
    action: "fetching admin stats",
  })
}
