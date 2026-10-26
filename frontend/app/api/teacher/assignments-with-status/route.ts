import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(request: Request) {
  return forwardToBackend({
    service: "course",
    path: "/api/teacher/assignments-with-status",
    query: { status: new URL(request.url).searchParams.get("status") || undefined },
    error: { fallback: "Failed to fetch assignments" },
    action: "fetching assignments with status",
  })
}
