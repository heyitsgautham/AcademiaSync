import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(_request: Request, { params }: { params: { assignmentId: string } }) {
  return forwardToBackend({
    service: "course",
    path: `/api/student/assignments/${encodeURIComponent(params.assignmentId)}`,
    action: "fetching student assignment details",
  })
}
