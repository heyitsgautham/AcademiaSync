import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockResolvedValue({ backendAccessToken: "tok", role: "Admin", user: { id: 1, email: "a@example.com", role: "Admin" } }),
}))
vi.mock("@/lib/auth", () => ({ authOptions: {} }))

import { POST as createStudent } from "@/app/api/admin/students/route"
import { DELETE as deleteStudent, PUT as updateStudent } from "@/app/api/admin/students/[id]/route"
import { POST as changeRole } from "@/app/api/admin/change-role/route"

const json = (body: unknown, method = "POST") =>
  new Request("http://localhost/api", { method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" } })

describe("admin student routes", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 9 }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    vi.stubEnv("INTERNAL_BACKEND_URL", "http://users:5000")
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it("creates a student on user-service and answers 201", async () => {
    const res = await createStudent(json({ firstName: "Nia", lastName: "New", email: "nia@example.com", password: "secret12" }))

    expect(res.status).toBe(201)
    expect(fetchMock.mock.calls[0][0]).toBe("http://users:5000/admin/students")
    expect(fetchMock.mock.calls[0][1].method).toBe("POST")
  })

  it("updates and deletes a student by id", async () => {
    await updateStudent(json({ firstName: "Sue", lastName: "S", email: "s@example.com" }, "PUT"), { params: { id: "40" } })
    await deleteStudent(new Request("http://localhost/api", { method: "DELETE" }), { params: { id: "40" } })

    expect(fetchMock.mock.calls.map(([url, init]) => [init.method, url])).toEqual([
      ["PUT", "http://users:5000/admin/students/40"],
      ["DELETE", "http://users:5000/admin/students/40"],
    ])
  })

  it("passes the backend's reason when a role change is refused", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: "This teacher still owns 2 course(s)." }), { status: 409 }))

    const res = await changeRole(json({ userId: 12, newRole: "Student" }))

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: "This teacher still owns 2 course(s)." })
  })
})
