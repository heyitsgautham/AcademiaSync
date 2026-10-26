import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "user",
    path: "/admin/dashboard-analytics",
    error: { fallback: "Failed to fetch dashboard analytics" },
    action: "fetching admin dashboard analytics",
  })
}
