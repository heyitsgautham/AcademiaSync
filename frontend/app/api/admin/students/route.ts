import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "user",
    path: "/admin/students",
    error: { fallback: "Failed to fetch students" },
    action: "fetching students",
  })
}

export async function POST(request: Request) {
  const body = await readJson(request)
  if (!body) return invalidJson()
  return forwardToBackend({
    service: "user",
    path: "/admin/students",
    method: "POST",
    body,
    successStatus: 201,
    error: { fallback: "Failed to create student" },
    action: "creating student",
  })
}
