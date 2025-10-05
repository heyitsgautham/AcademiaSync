"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X as ClearIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { StudentAssignmentsTable } from "@/components/student-assignments-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Assignment {
  id: string
  name: string
  course: string
  course_id: string
  dueDate: string
  question?: string
  status: "Pending" | "Submitted" | "Graded"
  submission?: string
  grade?: number
  feedback?: string
  submittedAt?: string
}

interface AssignmentsData {
  student: {
    name: string
    email: string
  }
  assignments: Assignment[]
  courses: Array<{ id: string; title: string }>
}

export default function StudentAssignmentsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilterId, setCourseFilterId] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Get course, status, page, and limit from URL query params ONLY on initial load
  useEffect(() => {
    const courseParam = searchParams.get("course")
    const statusParam = searchParams.get("status")
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")

    if (courseParam) {
      setCourseFilterId(courseParam)
    }

    if (statusParam) {
      // Map status to match the tabs
      const statusMap: { [key: string]: string } = {
        'pending': 'Pending',
        'submitted': 'Submitted',
        'graded': 'Graded'
      }
      setStatusFilter(statusMap[statusParam.toLowerCase()] || "all")
    }

    if (pageParam) {
      const page = parseInt(pageParam)
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page)
      }
    }

    if (limitParam) {
      const limit = parseInt(limitParam)
      if (!isNaN(limit) && [5, 10, 25, 50].includes(limit)) {
        setItemsPerPage(limit)
      }
    }
  }, [searchParams])

  const { data, isLoading } = useQuery<AssignmentsData>({
    queryKey: ["student-assignments"],
    queryFn: async () => {
      const res = await fetch("/api/student/assignments")
      return res.json()
    },
  })

  // Safe access to data with fallbacks
  const assignments = data?.assignments || []
  const courses = data?.courses || []

  const filteredAssignments = assignments.filter((assignment) => {
    const courseMatch =
      !courseFilterId || assignment.course_id.toString() === courseFilterId
    const statusMatch = statusFilter === "all" || assignment.status === statusFilter
    const searchMatch =
      searchQuery === "" ||
      assignment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchQuery.toLowerCase())
    return courseMatch && statusMatch && searchMatch
  })

  // Calculate pagination
  const totalItems = filteredAssignments.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, courseFilterId, statusFilter, itemsPerPage])

  // Helper function to update URL params
  const updateUrlParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key)
      } else {
        params.set(key, value.toString())
      }
    })

    // Always include page and limit
    if (!params.has('page')) {
      params.set('page', currentPage.toString())
    }
    if (!params.has('limit')) {
      params.set('limit', itemsPerPage.toString())
    }

    // Remove page and limit if they're at default values (page=1, limit=10) and no other filters
    const page = params.get('page')
    const limit = params.get('limit')
    const hasCourseFilter = params.has('course')
    const hasStatusFilter = params.has('status')

    if (page === '1' && limit === '10' && !hasCourseFilter && !hasStatusFilter) {
      params.delete('page')
      params.delete('limit')
    }

    const queryString = params.toString()
    const url = queryString ? `/student/assignments?${queryString}` : '/student/assignments'
    router.push(url, { scroll: false })
  }

  const handleCourseFilterChange = (value: string) => {
    setCourseFilterId(value)
    setCurrentPage(1)
    updateUrlParams({
      course: value || null,
      page: 1,
      limit: itemsPerPage
    })
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
    updateUrlParams({
      status: value !== "all" ? value.toLowerCase() : null,
      page: 1,
      limit: itemsPerPage
    })
  }

  const handleClearFilters = () => {
    setCourseFilterId("")
    setStatusFilter("all")
    setSearchQuery("")
    setCurrentPage(1)
    router.push('/student/assignments', { scroll: false })
  }

  const handleItemsPerPageChange = (value: string) => {
    const newLimit = Number(value)
    setItemsPerPage(newLimit)
    setCurrentPage(1)
    updateUrlParams({
      page: 1,
      limit: newLimit
    })
  }

  const handlePreviousPage = () => {
    const newPage = Math.max(currentPage - 1, 1)
    setCurrentPage(newPage)
    updateUrlParams({
      page: newPage,
      limit: itemsPerPage
    })
  }

  const handleNextPage = () => {
    const newPage = Math.min(currentPage + 1, totalPages)
    setCurrentPage(newPage)
    updateUrlParams({
      page: newPage,
      limit: itemsPerPage
    })
  }

  const hasActiveFilters = courseFilterId !== "" || statusFilter !== "all" || searchQuery !== ""

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Assignments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and submit your course assignments</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {isLoading ? (
              <Skeleton className="h-10 w-full sm:w-[200px]" />
            ) : (
              <Select value={courseFilterId} onValueChange={handleCourseFilterChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(courses) && courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {hasActiveFilters && (
              <Button variant="outline" size="icon" onClick={handleClearFilters}>
                <ClearIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="Submitted">Submitted</TabsTrigger>
            <TabsTrigger value="Graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            {isLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <>
                <StudentAssignmentsTable assignments={paginatedAssignments} />

                {/* Pagination Controls */}
                {totalItems > 0 && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} assignments
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 per page</SelectItem>
                          <SelectItem value="10">10 per page</SelectItem>
                          <SelectItem value="25">25 per page</SelectItem>
                          <SelectItem value="50">50 per page</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Previous</span>
                        </Button>
                        <div className="px-3 py-1 text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                        >
                          <span className="hidden sm:inline mr-1">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
