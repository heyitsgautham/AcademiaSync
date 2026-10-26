import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "course",
    path: "/api/student/courses",
    action: "fetching student courses",
  })
}
