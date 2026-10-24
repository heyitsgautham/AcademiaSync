import { describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"

describe("Toaster", () => {
  it("shows a toast raised from anywhere in the app", async () => {
    render(<Toaster />)

    act(() => {
      toast({ title: "Student promoted", description: "Ann is now a Teacher" })
    })

    expect(await screen.findByText("Student promoted")).toBeInTheDocument()
    expect(screen.getByText("Ann is now a Teacher")).toBeInTheDocument()
  })
})
