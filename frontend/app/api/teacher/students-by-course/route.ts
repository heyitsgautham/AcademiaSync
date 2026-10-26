import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "course",
    path: "/api/teacher/students-by-course",
    error: { fallback: "Failed to fetch students" },
    action: "fetching students by course",
  })
}
