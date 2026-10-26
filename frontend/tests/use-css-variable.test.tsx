import { afterEach, describe, expect, it } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import { useCssVariable } from "@/hooks/use-css-variable"

describe("useCssVariable", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("style")
  })

  it("falls back when the variable is not set", () => {
    const { result } = renderHook(() => useCssVariable("--muted-foreground", "#9ca3af"))
    expect(result.current).toBe("#9ca3af")
  })

  it("reads the variable and follows a theme change on <html>", async () => {
    document.documentElement.style.setProperty("--muted-foreground", "#111111")
    const { result } = renderHook(() => useCssVariable("--muted-foreground", "#9ca3af"))
    expect(result.current).toBe("#111111")

    act(() => {
      document.documentElement.style.setProperty("--muted-foreground", "#eeeeee")
    })

    await waitFor(() => expect(result.current).toBe("#eeeeee"))
  })
})
