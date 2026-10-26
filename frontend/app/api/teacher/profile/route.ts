import { NextResponse } from "next/server"
import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"
import { firstIssue, teacherProfileUpdate } from "@/lib/schemas"

export async function GET() {
  return forwardToBackend({
    service: "user",
    path: "/api/users/profile",
    error: { fallback: "Failed to fetch profile", from: "message" },
    action: "fetching teacher profile",
  })
}

export async function PUT(request: Request) {
  const raw = await readJson(request)
  if (!raw) return invalidJson()

  const parsed = teacherProfileUpdate.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 })
  }

  const { first_name, last_name, age, specialization } = parsed.data
  return forwardToBackend({
    service: "user",
    path: "/api/users/profile",
    method: "PUT",
    body: { first_name, last_name, age, specialization },
    error: { fallback: "Failed to update profile", from: "message" },
    action: "updating teacher profile",
  })
}
