export type SortOrder = "asc" | "desc"
export type SortValue = string | number | null | undefined

/**
 * Orders two cell values: numbers and numeric strings numerically, other strings case-insensitively.
 * Empty values sort first in ascending order, as an empty string would.
 * The API sends averages as strings such as "80.00", so comparing them as text put "100.00" before "80.00".
 */
export function compareValues(a: SortValue, b: SortValue): number {
  const toComparable = (value: SortValue) => {
    if (value === null || value === undefined || value === "") return { kind: 0, value: 0 }
    const asNumber = typeof value === "number" ? value : Number(value)
    if (!Number.isNaN(asNumber)) return { kind: 1, value: asNumber }
    return { kind: 2, value: String(value).toLowerCase() }
  }
  const left = toComparable(a)
  const right = toComparable(b)
  if (left.kind !== right.kind) return left.kind - right.kind
  if (left.value < right.value) return -1
  if (left.value > right.value) return 1
  return 0
}

/** Keeps rows where any of the given fields contains the query, ignoring case. */
export function filterRows<T>(rows: T[], query: string, fields: (row: T) => SortValue[]): T[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter((row) => fields(row).some((field) => String(field ?? "").toLowerCase().includes(needle)))
}

/** Returns a sorted copy and leaves the input untouched. */
export function sortRows<T>(rows: T[], value: (row: T) => SortValue, order: SortOrder): T[] {
  const direction = order === "asc" ? 1 : -1
  return [...rows].sort((a, b) => compareValues(value(a), value(b)) * direction)
}

export interface Page<T> {
  rows: T[]
  page: number
  totalPages: number
  /** Zero-based index of the first row on this page. */
  startIndex: number
  /** Exclusive index one past the last row on this page. */
  endIndex: number
}

/** Slices one page, clamping the page number into range so a shrinking list never shows an empty page. */
export function paginate<T>(rows: T[], page: number, perPage: number): Page<T> {
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage))
  const current = Math.min(Math.max(1, page), totalPages)
  const startIndex = (current - 1) * perPage
  const endIndex = Math.min(startIndex + perPage, rows.length)
  return { rows: rows.slice(startIndex, endIndex), page: current, totalPages, startIndex, endIndex }
}
