import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "course",
    path: "/api/student/assignments",
    action: "fetching student assignments",
  })
}
