import { describe, expect, it, vi } from "vitest"
import type { NextRequest } from "next/server"

vi.mock("next-auth/middleware", () => ({ withAuth: (fn: unknown) => fn }))

import proxy, { config } from "@/proxy"

type GuardedRequest = NextRequest & { nextauth: { token: { role?: string } | null } }

const visit = (path: string, role?: string) => {
  const url = new URL(`http://localhost:3000${path}`)
  const req = { nextUrl: url, url: url.toString(), nextauth: { token: role ? { role } : {} } } as unknown as GuardedRequest
  return (proxy as unknown as (req: GuardedRequest) => Response)(req)
}

describe("proxy", () => {
  it("guards every role section and nothing else", () => {
    expect(config.matcher).toEqual(["/student/:path*", "/teacher/:path*", "/admin/:path*"])
  })

  it("lets a user stay in their own section", () => {
    const res = visit("/teacher/courses", "Teacher")
    expect(res.headers.get("location")).toBeNull()
  })

  it("sends a user from another role's section to their dashboard", () => {
    const res = visit("/admin/dashboard", "Student")
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe("http://localhost:3000/student/dashboard")
  })

  it("sends a token without a role to /login", () => {
    expect(visit("/student/dashboard").headers.get("location")).toBe("http://localhost:3000/login")
  })
})
