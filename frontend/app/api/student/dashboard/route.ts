import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "course",
    path: "/api/student/dashboard",
    action: "fetching student dashboard",
  })
}
