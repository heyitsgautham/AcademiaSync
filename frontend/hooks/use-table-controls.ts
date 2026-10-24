"use client"

import { useMemo, useState } from "react"
import { filterRows, paginate, sortRows, type SortOrder, type SortValue } from "@/lib/table"

interface TableControlsOptions<T, F extends string> {
  /** Fields the search box matches against. */
  searchFields: (row: T) => SortValue[]
  /** How to read each sortable column from a row. */
  sortValues: Record<F, (row: T) => SortValue>
  initialSort: F
  initialPerPage?: number
}

/**
 * Search, column sorting and pagination state for a client-side table.
 * Changing the search text or the page size goes back to page 1.
 * Clicking the active column flips the order, and clicking a new column sorts it ascending.
 */
export function useTableControls<T, F extends string>(
  rows: T[] | undefined | null,
  { searchFields, sortValues, initialSort, initialPerPage = 10 }: TableControlsOptions<T, F>
) {
  const [searchQuery, setSearchQueryState] = useState("")
  const [sortField, setSortField] = useState<F>(initialSort)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPageState] = useState(initialPerPage)

  const filtered = useMemo(() => {
    const list = Array.isArray(rows) ? rows : []
    return sortRows(filterRows(list, searchQuery, searchFields), sortValues[sortField], sortOrder)
  }, [rows, searchQuery, searchFields, sortValues, sortField, sortOrder])

  const current = paginate(filtered, page, perPage)

  return {
    searchQuery,
    setSearchQuery: (value: string) => {
      setSearchQueryState(value)
      setPage(1)
    },
    sortField,
    sortOrder,
    toggleSort: (field: F) => {
      if (field === sortField) {
        setSortOrder((order) => (order === "asc" ? "desc" : "asc"))
      } else {
        setSortField(field)
        setSortOrder("asc")
      }
    },
    perPage,
    setPerPage: (value: number) => {
      setPerPageState(value)
      setPage(1)
    },
    setPage,
    filteredCount: filtered.length,
    ...current,
  }
}
