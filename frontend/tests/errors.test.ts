import { describe, expect, it } from "vitest"
import { errorMessage } from "@/lib/errors"

describe("errorMessage", () => {
  it("uses an Error's message", () => {
    expect(errorMessage(new Error("Email already exists"))).toBe("Email already exists")
  })

  it("accepts a thrown string", () => {
    expect(errorMessage("Network down")).toBe("Network down")
  })

  it("falls back for anything else", () => {
    expect(errorMessage({ code: 1 })).toBe("Something went wrong")
    expect(errorMessage(new Error(""), "Failed to save student")).toBe("Failed to save student")
  })
})
