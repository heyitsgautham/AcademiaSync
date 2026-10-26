import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getServerSession = vi.fn()
vi.mock("next-auth", () => ({ getServerSession: (...args: unknown[]) => getServerSession(...args) }))
vi.mock("@/lib/auth", () => ({ authOptions: {} }))

import { GET as recentSubmissions } from "@/app/api/teacher/recent-submissions/route"
import { GET as studentDetails } from "@/app/api/teacher/student-details/route"

const submission = (id: string, studentId: number, courseId: number) => ({
  id,
  studentId,
  studentName: "S",
  studentAvatar: null,
  course: "Algebra",
  courseId,
  assignment: `Quiz ${id}`,
  assignmentId: Number(id),
  status: "graded",
  submittedAt: "1 day ago",
  grade: "90.00",
})

describe("teacher dashboard routes", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    getServerSession.mockResolvedValue({ backendAccessToken: "tok", role: "Teacher", user: { id: 11, email: "t@example.com" } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe("GET /api/teacher/recent-submissions", () => {
    it("returns an empty list instead of an error, so the dashboard still renders", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {})
      fetchMock.mockResolvedValueOnce(new Response("{}", { status: 500 }))
      expect(await (await recentSubmissions()).json()).toEqual([])

      fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"))
      expect(await (await recentSubmissions()).json()).toEqual([])

      getServerSession.mockResolvedValueOnce(null)
      expect(await (await recentSubmissions()).json()).toEqual([])
    })
  })

  describe("GET /api/teacher/student-details", () => {
    const get = (query: string) => studentDetails(new Request(`http://localhost/api/teacher/student-details${query}`))

    it("keeps only the chosen student's submissions in the chosen course", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify([submission("1", 37, 1), submission("2", 37, 2), submission("3", 40, 1)]), { status: 200 }),
      )

      const body = await (await get("?id=37&courseId=1")).json()

      expect(body).toEqual({
        id: "37",
        assignments: [{ id: "1", title: "Quiz 1", course: "Algebra", status: "graded", grade: "90.00", submittedDate: "1 day ago" }],
      })
    })

    it("requires both ids", async () => {
      expect((await get("?courseId=1")).status).toBe(400)
      expect((await get("?id=37")).status).toBe(400)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it("shows an empty list when course-service fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {})
      fetchMock.mockResolvedValue(new Response("{}", { status: 503, statusText: "Service Unavailable" }))
      expect(await (await get("?id=37&courseId=1")).json()).toEqual({ id: "37", assignments: [] })
    })
  })
})
