import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(_request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params
  return forwardToBackend({
    service: "course",
    path: `/api/student/assignments/${encodeURIComponent(assignmentId)}`,
    action: "fetching student assignment details",
  })
}
