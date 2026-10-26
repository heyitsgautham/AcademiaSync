import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getSession = vi.fn()
vi.mock("next-auth/react", () => ({ getSession: () => getSession() }))

import { courseApi } from "@/lib/api-client"

const jsonResponse = (status: number, body: unknown) =>
  new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

describe("courseApi", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock)
    getSession.mockResolvedValue({ backendAccessToken: "token-123" })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it("sends the backend token from the NextAuth session", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { courses: [] }))

    await courseApi.getCourses()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("http://localhost:5001/api/teacher/courses")
    expect(init.headers).toMatchObject({
      Authorization: "Bearer token-123",
      "Content-Type": "application/json",
    })
    expect(init.credentials).toBe("include")
  })

  it("omits the Authorization header without a session", async () => {
    getSession.mockResolvedValue(null)
    fetchMock.mockResolvedValue(jsonResponse(200, {}))

    await courseApi.getCourses()

    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("Authorization")
  })

  it("throws the server message on an error response", async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { message: "Course not found or access denied" }))

    await expect(courseApi.getCourses()).rejects.toThrow("Course not found or access denied")
  })

  it("falls back to a generic message when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>bad gateway</html>", { status: 502 }))

    await expect(courseApi.getCourses()).rejects.toThrow("Request failed")
  })

  it("returns an empty object for 204 No Content", async () => {
    fetchMock.mockResolvedValue(jsonResponse(204, null))

    await expect(courseApi.deleteCourse(4)).resolves.toEqual({})
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE")
  })

  it.each([
    ["getCourse", () => courseApi.getCourse(3), "GET", "/api/teacher/courses/3", undefined],
    ["createCourse", () => courseApi.createCourse({ title: "T", description: "D", weeks: 8 }), "POST", "/api/teacher/courses", { title: "T", description: "D", weeks: 8 }],
    ["updateCourse", () => courseApi.updateCourse(3, { title: "T", description: "D" }), "PUT", "/api/teacher/courses/3", { title: "T", description: "D" }],
    ["getAssignments", () => courseApi.getAssignments(3), "GET", "/api/teacher/courses/3/assignments", undefined],
    ["getAssignment", () => courseApi.getAssignment(9), "GET", "/api/teacher/assignments/9", undefined],
    ["createAssignment", () => courseApi.createAssignment(3, { title: "A", description: "D", due_date: "2026-11-01" }), "POST", "/api/teacher/courses/3/assignments", { title: "A", description: "D", due_date: "2026-11-01" }],
    ["updateAssignment", () => courseApi.updateAssignment(9, { title: "A", description: "D" }), "PUT", "/api/teacher/assignments/9", { title: "A", description: "D" }],
    ["deleteAssignment", () => courseApi.deleteAssignment(9), "DELETE", "/api/teacher/assignments/9", undefined],
  ] as const)("%s calls %s %s", async (_name, run, method, path, body) => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}))

    await run()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`http://localhost:5001${path}`)
    expect(init.method ?? "GET").toBe(method)
    expect(init.body === undefined ? undefined : JSON.parse(init.body)).toEqual(body)
  })
})
