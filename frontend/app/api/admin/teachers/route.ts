import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "user",
    path: "/admin/teachers",
    error: { fallback: "Failed to fetch teachers" },
    action: "fetching teachers",
  })
}

export async function POST(request: Request) {
  const body = await readJson(request)
  if (!body) return invalidJson()
  return forwardToBackend({
    service: "user",
    path: "/admin/teachers",
    method: "POST",
    body,
    successStatus: 201,
    error: { fallback: "Failed to create teacher" },
    action: "creating teacher",
  })
}
