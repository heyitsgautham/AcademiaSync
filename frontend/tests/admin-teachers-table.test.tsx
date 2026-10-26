import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
const toast = vi.fn()
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }))

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

  describe("actions", () => {
    afterEach(() => {
      vi.unstubAllGlobals()
      toast.mockReset()
    })

    const firstRow = () => screen.getAllByRole("row")[1]

    it("deletes a teacher and tells the page to refresh", async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "ok" }), { status: 200 }))
      vi.stubGlobal("fetch", fetchMock)
      const onDelete = vi.fn()
      render(<AdminTeachersTable teachers={teachers} isLoading={false} onEdit={vi.fn()} onDelete={onDelete} />)

      const buttons = within(firstRow()).getAllByRole("button")
      await userEvent.click(buttons[buttons.length - 1])
      await userEvent.click(screen.getByRole("button", { name: "Delete" }))

      await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1))
      expect(fetchMock).toHaveBeenCalledWith("/api/admin/teachers/1", { method: "DELETE" })
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Success" }))
    })

    it("shows the backend's reason when demoting a teacher is refused", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ error: "This teacher still owns 3 course(s)." }), { status: 409 }))
      vi.stubGlobal("fetch", fetchMock)
      const onDelete = vi.fn()
      render(<AdminTeachersTable teachers={teachers} isLoading={false} onEdit={vi.fn()} onDelete={onDelete} />)

      await userEvent.click(within(firstRow()).getByRole("button", { name: /Update/ }))
      await userEvent.click(screen.getByRole("button", { name: "Demote to Student" }))
      await userEvent.click(screen.getByRole("button", { name: "Confirm" }))

      await waitFor(() =>
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Error", description: "This teacher still owns 3 course(s)." })),
      )
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe("/api/admin/change-role")
      expect(JSON.parse(init.body)).toEqual({ userId: 1, newRole: "Student" })
      expect(onDelete).not.toHaveBeenCalled()
    })
  })
})
