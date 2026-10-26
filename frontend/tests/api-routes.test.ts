import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getServerSession = vi.fn()
vi.mock("next-auth", () => ({ getServerSession: (...args: unknown[]) => getServerSession(...args) }))
vi.mock("@/lib/auth", () => ({ authOptions: {} }))

/**
 * Every /api route handler and the backend call it makes.
 * Three routes the pages called did not exist until 35ac945, so this table pins the mapping,
 * and the last test fails when a route file is added without a row here.
 */

type Method = "GET" | "POST" | "PUT" | "DELETE"
type Handler = (request: Request, context: { params: Promise<Record<string, string>> }) => Promise<Response>
type RouteModule = Partial<Record<Method, Handler>>

const modules = import.meta.glob<RouteModule>("../app/api/**/route.ts")

const USER = "http://users:5000"
const COURSE = "http://courses:5001"

interface Row {
  file: string
  method: Method
  params?: Record<string, string>
  query?: string
  body?: unknown
  url: string
  backendMethod?: Method
}

const ROUTES: Row[] = [
  { file: "admin/analytics", method: "GET", url: `${USER}/admin/analytics?apiKey=test-key` },
  { file: "admin/change-role", method: "POST", body: { userId: 2, newRole: "Student" }, url: `${USER}/admin/change-role` },
  { file: "admin/courses/[id]/students", method: "GET", params: { id: "7" }, url: `${COURSE}/admin/courses/7/students/grades` },
  { file: "admin/courses", method: "GET", url: `${COURSE}/admin/courses` },
  { file: "admin/dashboard-analytics", method: "GET", url: `${USER}/admin/dashboard-analytics` },
  { file: "admin/profile", method: "GET", url: `${USER}/admin/profile` },
  { file: "admin/profile", method: "PUT", body: { first_name: "Ada" }, url: `${USER}/admin/profile` },
  { file: "admin/promote-role", method: "POST", body: { userId: 2, newRole: "Admin" }, url: `${USER}/admin/promote-role` },
  { file: "admin/recent-activity", method: "GET", url: `${COURSE}/admin/recent-activity` },
  { file: "admin/stats", method: "GET", url: `${USER}/admin/stats` },
  { file: "admin/students/[id]/courses", method: "GET", params: { id: "37" }, url: `${COURSE}/admin/students/37/courses` },
  { file: "admin/students/[id]", method: "PUT", params: { id: "37" }, body: { firstName: "S" }, url: `${USER}/admin/students/37` },
  { file: "admin/students/[id]", method: "DELETE", params: { id: "37" }, url: `${USER}/admin/students/37` },
  { file: "admin/students", method: "GET", url: `${USER}/admin/students` },
  { file: "admin/students", method: "POST", body: { firstName: "S" }, url: `${USER}/admin/students` },
  {
    file: "admin/teachers/[id]/courses/[courseId]/students",
    method: "GET",
    params: { id: "11", courseId: "3" },
    url: `${COURSE}/admin/courses/3/students/grades`,
  },
  { file: "admin/teachers/[id]/courses", method: "GET", params: { id: "11" }, url: `${COURSE}/admin/teachers/11/courses` },
  { file: "admin/teachers/[id]", method: "PUT", params: { id: "11" }, body: { firstName: "T" }, url: `${USER}/admin/teachers/11` },
  { file: "admin/teachers/[id]", method: "DELETE", params: { id: "11" }, url: `${USER}/admin/teachers/11` },
  { file: "admin/teachers", method: "GET", url: `${USER}/admin/teachers` },
  { file: "admin/teachers", method: "POST", body: { firstName: "T" }, url: `${USER}/admin/teachers` },
  { file: "student/analytics", method: "GET", query: "?filter=monthly", url: `${COURSE}/api/student/analytics?filter=monthly` },
  { file: "student/assignments/[assignmentId]", method: "GET", params: { assignmentId: "5" }, url: `${COURSE}/api/student/assignments/5` },
  { file: "student/assignments", method: "GET", url: `${COURSE}/api/student/assignments` },
  { file: "student/available-courses", method: "GET", url: `${COURSE}/api/student/available-courses` },
  { file: "student/courses", method: "GET", url: `${COURSE}/api/student/courses` },
  { file: "student/dashboard", method: "GET", url: `${COURSE}/api/student/dashboard` },
  { file: "student/enroll", method: "POST", body: { courseId: 4 }, url: `${COURSE}/api/student/enroll` },
  { file: "student/profile", method: "GET", url: `${USER}/api/users/profile` },
  { file: "student/submit-assignment", method: "POST", body: { assignmentId: 5, submission: "x" }, url: `${COURSE}/api/student/submit-assignment` },
  { file: "teacher/analytics", method: "GET", url: `${COURSE}/api/teacher/analytics` },
  {
    file: "teacher/assignments-with-status",
    method: "GET",
    query: "?status=graded",
    url: `${COURSE}/api/teacher/assignments-with-status?status=graded`,
  },
  {
    file: "teacher/assignments/[assignmentId]/bulk-grade",
    method: "POST",
    params: { assignmentId: "9" },
    body: { submissions: [] },
    url: `${COURSE}/api/teacher/assignments/9/submissions/bulk-grade`,
  },
  {
    file: "teacher/assignments/[assignmentId]/submissions",
    method: "GET",
    params: { assignmentId: "9" },
    query: "?page=2",
    url: `${COURSE}/api/teacher/assignments/9/submissions?page=2`,
  },
  { file: "teacher/detailed-analytics", method: "GET", url: `${COURSE}/api/teacher/analytics/detailed` },
  { file: "teacher/profile", method: "GET", url: `${USER}/api/users/profile` },
  { file: "teacher/recent-submissions", method: "GET", url: `${COURSE}/api/teacher/recent-submissions?limit=5` },
  { file: "teacher/stats", method: "GET", url: `${COURSE}/api/teacher/stats` },
  {
    file: "teacher/student-details",
    method: "GET",
    query: "?id=37&courseId=1",
    url: `${COURSE}/api/teacher/recent-submissions?limit=100`,
  },
  { file: "teacher/students-by-course", method: "GET", url: `${COURSE}/api/teacher/students-by-course` },
  { file: "teacher/submissions/[submissionId]", method: "PUT", params: { submissionId: "168" }, body: { grade: 90 }, url: `${COURSE}/api/teacher/submissions/168` },
]

/** Routes with no backend call: the API key check and NextAuth's own handler. */
const NOT_FORWARDED = ["admin/analytics/validate", "auth/[...nextauth]"]

const load = async (file: string) => {
  const loader = modules[`../app/api/${file}/route.ts`]
  if (!loader) throw new Error(`No route file for ${file}`)
  return loader()
}

const call = async (row: Row) => {
  const handler = (await load(row.file))[row.method]
  if (!handler) throw new Error(`${row.file} has no ${row.method} handler`)
  const request = new Request(`http://localhost/api/${row.file}${row.query ?? ""}`, {
    method: row.method,
    body: row.body === undefined ? undefined : JSON.stringify(row.body),
    headers: row.body === undefined ? undefined : { "Content-Type": "application/json" },
  })
  return handler(request, { params: Promise.resolve(row.params ?? {}) })
}

describe("/api route handlers", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation(async () => new Response("[]", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    vi.stubEnv("INTERNAL_BACKEND_URL", USER)
    vi.stubEnv("INTERNAL_COURSE_SERVICE_URL", COURSE)
    vi.stubEnv("ANALYTICS_API_KEY", "test-key")
    getServerSession.mockResolvedValue({ backendAccessToken: "tok-1", role: "Admin", user: { id: 1, email: "a@example.com", role: "Admin" } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    getServerSession.mockReset()
  })

  it.each(ROUTES.map((row) => [`${row.method} /api/${row.file}`, row] as const))(
    "%s calls the right backend endpoint with the user's token",
    async (_name, row) => {
      const res = await call(row)

      expect(res.status).toBeLessThan(400)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
      expect(url).toBe(row.url)
      expect(init.method ?? "GET").toBe(row.backendMethod ?? row.method)
      expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok-1")
    },
  )

  it.each(ROUTES.filter((row) => row.file !== "teacher/recent-submissions").map((row) => [`${row.method} /api/${row.file}`, row] as const))(
    "%s answers 401 without a backend session",
    async (_name, row) => {
      getServerSession.mockResolvedValue(null)

      const res = await call(row)

      expect(res.status).toBe(401)
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  it("has a row for every route file", () => {
    const files = Object.keys(modules).map((path) => path.replace("../app/api/", "").replace("/route.ts", ""))
    const covered = new Set([...ROUTES.map((row) => row.file), ...NOT_FORWARDED])
    expect(files.filter((file) => !covered.has(file))).toEqual([])
  })
})
