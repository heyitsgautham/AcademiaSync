import { describe, expect, it } from "vitest"
import { roleRedirect } from "@/lib/role-routing"

describe("roleRedirect", () => {
  it.each([
    ["Student", "/student/dashboard"],
    ["teacher", "/teacher/courses/4"],
    ["Admin", "/admin"],
  ])("lets a %s stay in their own section (%s)", (role, path) => {
    expect(roleRedirect(role, path)).toBeNull()
  })

  it.each([
    ["Student", "/admin/teachers", "/student/dashboard"],
    ["Teacher", "/student/assignments", "/teacher/dashboard"],
    ["Admin", "/teacher/students", "/admin/dashboard"],
  ])("sends a %s who opens %s to %s", (role, path, target) => {
    expect(roleRedirect(role, path)).toBe(target)
  })

  it("sends a token without a role to the login page", () => {
    expect(roleRedirect(undefined, "/student/dashboard")).toBe("/login")
  })

  it("sends an unknown role to the login page", () => {
    expect(roleRedirect("Janitor", "/teacher/dashboard")).toBe("/login")
  })

  it("matches whole path segments, so /studentship is not the student section", () => {
    expect(roleRedirect("Teacher", "/studentship")).toBeNull()
  })
})
