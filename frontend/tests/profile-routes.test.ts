import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockResolvedValue({ backendAccessToken: "tok", role: "Student", user: { id: 1, email: "s@example.com" } }),
}))
vi.mock("@/lib/auth", () => ({ authOptions: {} }))

import { PUT as putStudentProfile } from "@/app/api/student/profile/route"
import { PUT as putTeacherProfile } from "@/app/api/teacher/profile/route"

const put = (body: unknown) =>
  new Request("http://localhost/api/student/profile", { method: "PUT", body: typeof body === "string" ? body : JSON.stringify(body) })

describe("profile update routes", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 1 }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => vi.unstubAllGlobals())

  it("requires a first name", async () => {
    const res = await putStudentProfile(put({ last_name: "Doe" }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: "First name is required" })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("checks age against each role's range", async () => {
    expect(await (await putStudentProfile(put({ first_name: "Ana", age: 9 }))).json()).toEqual({
      error: "Age must be between 10 and 100",
    })
    expect(await (await putTeacherProfile(put({ first_name: "Tia", age: 17 }))).json()).toEqual({
      error: "Age must be between 18 and 100",
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects a body that is not JSON", async () => {
    const res = await putStudentProfile(put("not json"))
    expect(res.status).toBe(400)
  })

  it("forwards only the profile fields to user-service", async () => {
    const res = await putTeacherProfile(put({ first_name: "Tia", age: null, specialization: "Math", role: "Admin" }))

    expect(res.status).toBe(200)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/api\/users\/profile$/)
    expect(JSON.parse(init.body)).toEqual({ first_name: "Tia", age: null, specialization: "Math" })
  })
})
