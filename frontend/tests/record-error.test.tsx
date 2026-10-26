import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { RecordError } from "@/components/record-error"
import { HttpError } from "@/lib/http"

describe("RecordError", () => {
  it("says the record does not exist for a 404 and links back to the list", () => {
    render(<RecordError noun="course" error={new HttpError(404, "Failed")} backHref="/admin/courses" backLabel="Back to Courses" />)

    expect(screen.getByRole("heading", { name: "This course does not exist" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Back to Courses" })).toHaveAttribute("href", "/admin/courses")
  })

  it("treats a malformed id (400) as a missing record", () => {
    render(<RecordError noun="student" error={new HttpError(400, "Failed")} backHref="/admin/students" backLabel="Back" />)
    expect(screen.getByRole("heading", { name: "This student does not exist" })).toBeInTheDocument()
  })

  it("says the record could not be loaded for any other failure", () => {
    render(<RecordError noun="student" error={new HttpError(500, "Failed")} backHref="/admin/students" backLabel="Back" />)
    expect(screen.getByRole("heading", { name: "Could not load this student" })).toBeInTheDocument()

    render(<RecordError noun="teacher" error={new TypeError("fetch failed")} backHref="/admin/teachers" backLabel="Back" />)
    expect(screen.getByRole("heading", { name: "Could not load this teacher" })).toBeInTheDocument()
  })
})
