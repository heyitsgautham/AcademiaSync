import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

type Context = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params
  const body = await readJson(request)
  if (!body) return invalidJson()
  return forwardToBackend({
    service: "user",
    path: `/admin/teachers/${encodeURIComponent(id)}`,
    method: "PUT",
    body,
    error: { fallback: "Failed to update teacher" },
    action: "updating teacher",
  })
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params
  return forwardToBackend({
    service: "user",
    path: `/admin/teachers/${encodeURIComponent(id)}`,
    method: "DELETE",
    error: { fallback: "Failed to delete teacher" },
    action: "deleting teacher",
  })
}
