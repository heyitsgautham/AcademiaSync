import { describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

import { AdminTeachersTable } from "@/components/admin-teachers-table"

const teachers = [
  { id: 1, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", specialization: "Mathematics", courseCount: 3, studentCount: 40 },
  { id: 2, firstName: "Grace", lastName: "Hopper", email: "grace@example.com", specialization: "Compilers", courseCount: 12, studentCount: 9 },
]

const rowNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[1].textContent)

describe("AdminTeachersTable", () => {
  it("finds a teacher by specialization", async () => {
    render(<AdminTeachersTable teachers={teachers} isLoading={false} onEdit={vi.fn()} onDelete={vi.fn()} />)

    await userEvent.type(screen.getByPlaceholderText("Search teachers..."), "compil")

    expect(rowNames()).toEqual([expect.stringContaining("Grace Hopper")])
  })

  it("sorts course counts as numbers", async () => {
    render(<AdminTeachersTable teachers={teachers} isLoading={false} onEdit={vi.fn()} onDelete={vi.fn()} />)

    await userEvent.click(screen.getByRole("button", { name: /courses/i }))

    expect(rowNames()).toEqual([expect.stringContaining("Ada Lovelace"), expect.stringContaining("Grace Hopper")])
  })
})
