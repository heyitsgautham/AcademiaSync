import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const toast = vi.fn()
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }))

import { AdminStudentModal } from "@/components/admin-student-modal"

describe("AdminStudentModal", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 99 }), { status: 201 }))
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    toast.mockReset()
  })

  const fillRequired = async () => {
    await userEvent.type(screen.getByLabelText(/First Name/), "Nia")
    await userEvent.type(screen.getByLabelText(/Last Name/), "Newton")
    await userEvent.type(screen.getByLabelText(/Email/), "nia@example.com")
    await userEvent.type(screen.getByLabelText(/Password/), "secret12")
  }

  it("creates a student when the optional age is left empty", async () => {
    const onSuccess = vi.fn()
    render(<AdminStudentModal open onOpenChange={vi.fn()} student={null} onSuccess={onSuccess} mode="create" />)

    await fillRequired()
    await userEvent.click(screen.getByRole("button", { name: /Create/ }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const [url, init] = fetchMock.mock.calls[0]
    expect([url, init.method]).toEqual(["/api/admin/students", "POST"])
    expect(JSON.parse(init.body)).toEqual({ firstName: "Nia", lastName: "Newton", email: "nia@example.com", age: null, password: "secret12" })
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it("rejects an age outside 10 to 100 before calling the API", async () => {
    render(<AdminStudentModal open onOpenChange={vi.fn()} student={null} onSuccess={vi.fn()} mode="create" />)

    await fillRequired()
    await userEvent.type(screen.getByLabelText(/Age/), "7")
    await userEvent.click(screen.getByRole("button", { name: /Create/ }))

    expect(await screen.findByText("Age must be between 10 and 100")).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
