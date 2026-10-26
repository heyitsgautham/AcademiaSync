import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

export async function PUT(request: Request, { params }: { params: { submissionId: string } }) {
  const body = await readJson(request)
  if (!body) return invalidJson()
  return forwardToBackend({
    service: "course",
    path: `/api/teacher/submissions/${encodeURIComponent(params.submissionId)}`,
    method: "PUT",
    body,
    action: "updating submission",
  })
}
