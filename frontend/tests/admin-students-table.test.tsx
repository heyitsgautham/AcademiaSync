import { describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

import { AdminStudentsTable } from "@/components/admin-students-table"

type Student = Parameters<typeof AdminStudentsTable>[0]["students"][number]

const student = (id: number, firstName: string, avgScore: string | null, enrolledCourses = 1): Student =>
  ({
    id,
    firstName,
    lastName: "Tester",
    email: `${firstName.toLowerCase()}@example.com`,
    avgScore,
    enrolledCourses,
  }) as unknown as Student

const renderTable = (students: Student[]) =>
  render(
    <AdminStudentsTable students={students} isLoading={false} onUpdate={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
  )

const namesInOrder = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[1].textContent)

describe("AdminStudentsTable", () => {
  it("sorts by name by default", () => {
    renderTable([student(1, "Zoe", "70.00"), student(2, "Amy", "90.00")])
    expect(namesInOrder()).toEqual(["Amy Tester", "Zoe Tester"])
  })

  it("sorts average scores numerically even though the API sends strings", async () => {
    renderTable([student(1, "Ann", "80.00"), student(2, "Ben", "100.00"), student(3, "Cal", "9.50")])

    await userEvent.click(screen.getByRole("button", { name: /avg score/i }))
    expect(namesInOrder()).toEqual(["Cal Tester", "Ann Tester", "Ben Tester"])

    await userEvent.click(screen.getByRole("button", { name: /avg score/i }))
    expect(namesInOrder()).toEqual(["Ben Tester", "Ann Tester", "Cal Tester"])
  })

  it("filters by name or email as you type", async () => {
    renderTable([student(1, "Ann", null), student(2, "Ben", null)])

    await userEvent.type(screen.getByPlaceholderText("Search students..."), "ben@")

    expect(namesInOrder()).toEqual(["Ben Tester"])
  })

  it("shows an empty state when nothing matches", async () => {
    renderTable([student(1, "Ann", null)])
    await userEvent.type(screen.getByPlaceholderText("Search students..."), "zzz")
    expect(screen.getByText("No students found")).toBeInTheDocument()
  })

  it("pages ten students at a time", async () => {
    const many = Array.from({ length: 12 }, (_, i) => student(i + 1, `S${String(i + 1).padStart(2, "0")}`, null))
    renderTable(many)

    expect(screen.getByText("Showing 1 to 10 of 12 students")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Next page" }))
    expect(screen.getByText("Showing 11 to 12 of 12 students")).toBeInTheDocument()
    expect(namesInOrder()).toEqual(["S11 Tester", "S12 Tester"])
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled()
  })
})
