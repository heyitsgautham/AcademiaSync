import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

export async function PUT(request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params
  const body = await readJson(request)
  if (!body) return invalidJson()
  return forwardToBackend({
    service: "course",
    path: `/api/teacher/submissions/${encodeURIComponent(submissionId)}`,
    method: "PUT",
    body,
    action: "updating submission",
  })
}
