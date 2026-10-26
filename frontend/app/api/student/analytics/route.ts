import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(request: Request) {
  const filter = new URL(request.url).searchParams.get("filter") || "weekly"
  return forwardToBackend({
    service: "course",
    path: "/api/student/analytics",
    query: { filter },
    error: { fallback: "Failed to fetch student analytics", from: "none" },
    action: "fetching student analytics",
  })
}
