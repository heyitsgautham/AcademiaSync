import { describe, expect, it } from "vitest"
import { compareValues, filterRows, paginate, sortRows } from "@/lib/table"

describe("compareValues", () => {
  it("compares numeric strings as numbers", () => {
    expect(compareValues("100.00", "80.00")).toBeGreaterThan(0)
    expect(compareValues("9", 10)).toBeLessThan(0)
  })

  it("compares text without case", () => {
    expect(compareValues("alice", "Bob")).toBeLessThan(0)
    expect(compareValues("ALICE", "alice")).toBe(0)
  })

  it("puts empty values first", () => {
    expect(compareValues(null, 0)).toBeLessThan(0)
    expect(compareValues(undefined, "a")).toBeLessThan(0)
  })
})

describe("filterRows", () => {
  const rows = [
    { name: "Ada Lovelace", subject: "Maths" },
    { name: "Alan Turing", subject: null },
  ]

  it("matches any field without case", () => {
    expect(filterRows(rows, "maths", (r) => [r.name, r.subject])).toEqual([rows[0]])
    expect(filterRows(rows, "TURING", (r) => [r.name, r.subject])).toEqual([rows[1]])
  })

  it("returns every row for a blank query", () => {
    expect(filterRows(rows, "   ", (r) => [r.name])).toBe(rows)
  })
})

describe("sortRows", () => {
  it("returns a sorted copy in either direction", () => {
    const rows = [{ v: 3 }, { v: 1 }, { v: 2 }]
    expect(sortRows(rows, (r) => r.v, "asc").map((r) => r.v)).toEqual([1, 2, 3])
    expect(sortRows(rows, (r) => r.v, "desc").map((r) => r.v)).toEqual([3, 2, 1])
    expect(rows.map((r) => r.v)).toEqual([3, 1, 2])
  })
})

describe("paginate", () => {
  const rows = Array.from({ length: 23 }, (_, i) => i)

  it("slices the requested page", () => {
    expect(paginate(rows, 3, 10)).toEqual({ rows: [20, 21, 22], page: 3, totalPages: 3, startIndex: 20, endIndex: 23 })
  })

  it("clamps a page past the end to the last page", () => {
    expect(paginate(rows, 9, 10).page).toBe(3)
  })

  it("reports one empty page for an empty list", () => {
    expect(paginate([], 1, 10)).toEqual({ rows: [], page: 1, totalPages: 1, startIndex: 0, endIndex: 0 })
  })
})
