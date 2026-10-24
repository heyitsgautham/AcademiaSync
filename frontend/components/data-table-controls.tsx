"use client"

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { SortOrder } from "@/lib/table"

const PAGE_SIZES = [5, 10, 20, 50]

interface TableToolbarProps {
  searchPlaceholder: string
  searchQuery: string
  onSearchChange: (value: string) => void
  perPage: number
  onPerPageChange: (value: number) => void
}

/** Search box and page-size picker shown above the admin tables. */
export function TableToolbar({ searchPlaceholder, searchQuery, onSearchChange, perPage, onPerPageChange }: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Items per page:</span>
        <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface SortableHeaderProps<F extends string> {
  label: string
  field: F
  sortField: F
  sortOrder: SortOrder
  onSort: (field: F) => void
  centered?: boolean
}

/** Column header button that shows and toggles the sort direction. */
export function SortableHeader<F extends string>({ label, field, sortField, sortOrder, onSort, centered }: SortableHeaderProps<F>) {
  const Icon = sortField !== field ? ArrowUpDown : sortOrder === "asc" ? ArrowUp : ArrowDown
  return (
    <Button
      variant="ghost"
      className={cn("flex items-center p-0 hover:bg-accent hover:text-accent-foreground", centered && "mx-auto")}
      onClick={() => onSort(field)}
    >
      {label}
      <Icon className="ml-2 h-4 w-4" aria-hidden="true" />
    </Button>
  )
}

interface TablePaginationProps {
  page: number
  totalPages: number
  startIndex: number
  endIndex: number
  total: number
  noun: string
  onPageChange: (page: number) => void
}

/** "Showing X to Y of Z" summary with first, previous, next and last page buttons. */
export function TablePagination({ page, totalPages, startIndex, endIndex, total, noun, onPageChange }: TablePaginationProps) {
  if (total === 0) return null
  return (
    <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1} to {endIndex} of {total} {noun}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" aria-label="First page" onClick={() => onPageChange(1)} disabled={page === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" aria-label="Previous page" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" aria-label="Next page" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" aria-label="Last page" onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
