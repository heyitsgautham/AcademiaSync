import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "user",
    path: "/admin/students",
    error: { fallback: "Failed to fetch students" },
    action: "fetching students",
  })
}
