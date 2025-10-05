"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { Menu, X, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { TeacherDashboardSidebar } from "@/components/teacher-dashboard-sidebar"
import { TeacherDashboardTopbar } from "@/components/teacher-dashboard-topbar"
import { TeacherDashboardLogo } from "@/components/teacher-dashboard-logo"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TeacherStudentsByCourse } from "@/components/teacher-students-by-course"
import { TeacherStudentDetailModal } from "@/components/teacher-student-detail-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { courseApi } from "@/lib/api-client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function StudentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<"name" | "grade">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const router = useRouter()
  const searchParams = useSearchParams()

  // Get courseId and pagination params from URL query params if present
  useEffect(() => {
    const courseIdParam = searchParams.get('courseId')
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const sortByParam = searchParams.get("sortBy")
    const sortOrderParam = searchParams.get("sortOrder")

    if (courseIdParam) {
      setSelectedCourseId(courseIdParam)
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

    if (sortByParam && (sortByParam === "name" || sortByParam === "grade")) {
      setSortBy(sortByParam)
    }

    if (sortOrderParam && (sortOrderParam === "asc" || sortOrderParam === "desc")) {
      setSortOrder(sortOrderParam)
    }
  }, [searchParams])

  // Fetch all courses
  const { data: coursesResponse, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: courseApi.getCourses,
  })

  // Safe access with fallback - handle HATEOAS response structure
  const courses = (coursesResponse as any)?.courses || coursesResponse || []
  const coursesArray = Array.isArray(courses) ? courses : []

  const { data: studentsByCourse, isLoading } = useQuery({
    queryKey: ["students-by-course"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/students-by-course")
      return res.json()
    },
  })

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student)
    setStudentModalOpen(true)
  }

  // Get selected course name
  const selectedCourseName = selectedCourseId && coursesArray
    ? coursesArray.find((course: any) => course.id.toString() === selectedCourseId)?.title
    : null

  // Helper function to update URL params
  const updateUrlParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value.toString())
      }
    })

    // Always include page, limit, sortBy, sortOrder
    if (!params.has('page')) {
      params.set('page', currentPage.toString())
    }
    if (!params.has('limit')) {
      params.set('limit', itemsPerPage.toString())
    }
    if (!params.has('sortBy')) {
      params.set('sortBy', sortBy)
    }
    if (!params.has('sortOrder')) {
      params.set('sortOrder', sortOrder)
    }

    // Remove params if they're at default values and no course filter
    const page = params.get('page')
    const limit = params.get('limit')
    const sortByParam = params.get('sortBy')
    const sortOrderParam = params.get('sortOrder')
    const hasCourseFilter = params.has('courseId')

    if (page === '1' && limit === '10' && sortByParam === 'name' && sortOrderParam === 'asc' && !hasCourseFilter) {
      params.delete('page')
      params.delete('limit')
      params.delete('sortBy')
      params.delete('sortOrder')
    }

    const queryString = params.toString()
    const url = queryString ? `/teacher/students?${queryString}` : '/teacher/students'
    router.push(url, { scroll: false })
  }

  const handleCourseFilterChange = (value: string) => {
    setSelectedCourseId(value)
    setCurrentPage(1)
    updateUrlParams({
      courseId: value || null,
      page: 1,
      limit: itemsPerPage,
      sortBy,
      sortOrder
    })
  }

  const handleClearFilter = () => {
    setSelectedCourseId("")
    setCurrentPage(1)
    router.push('/teacher/students', { scroll: false })
  }

  const handleItemsPerPageChange = (value: string) => {
    const newLimit = Number(value)
    setItemsPerPage(newLimit)
    setCurrentPage(1)
    updateUrlParams({
      courseId: selectedCourseId || null,
      page: 1,
      limit: newLimit,
      sortBy,
      sortOrder
    })
  }

  const handlePreviousPage = () => {
    const newPage = Math.max(currentPage - 1, 1)
    setCurrentPage(newPage)
    updateUrlParams({
      courseId: selectedCourseId || null,
      page: newPage,
      limit: itemsPerPage,
      sortBy,
      sortOrder
    })
  }

  const handleNextPage = (totalPages: number) => {
    const newPage = Math.min(currentPage + 1, totalPages)
    setCurrentPage(newPage)
    updateUrlParams({
      courseId: selectedCourseId || null,
      page: newPage,
      limit: itemsPerPage,
      sortBy,
      sortOrder
    })
  }

  const handleSortChange = (newSortBy: "name" | "grade") => {
    let newSortOrder: "asc" | "desc" = "asc"

    // Toggle sort order if clicking the same column
    if (sortBy === newSortBy) {
      newSortOrder = sortOrder === "asc" ? "desc" : "asc"
    }

    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1)
    updateUrlParams({
      courseId: selectedCourseId || null,
      page: 1,
      limit: itemsPerPage,
      sortBy: newSortBy,
      sortOrder: newSortOrder
    })
  }

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border lg:justify-center">
          <TeacherDashboardLogo />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>
        <TeacherDashboardSidebar />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 lg:flex-none">
            <h2 className="text-lg font-semibold text-foreground lg:hidden">Students</h2>
          </div>
          <TeacherDashboardTopbar />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Students</h1>
              <p className="text-sm text-muted-foreground mt-1">View and manage students across all courses</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {coursesArray && coursesArray.length > 0 && (
                <div className="flex gap-2">
                  <Select value={selectedCourseId} onValueChange={handleCourseFilterChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesArray.map((course: any) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCourseId && (
                    <Button variant="outline" onClick={handleClearFilter}>
                      Clear Filter
                    </Button>
                  )}
                </div>
              )}
            </div>

            {isLoading || coursesLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : (
              <TeacherStudentsByCourse
                studentsByCourse={studentsByCourse}
                searchQuery={searchQuery}
                courseFilter={selectedCourseId}
                selectedCourseName={selectedCourseName}
                onStudentClick={handleStudentClick}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
              />
            )}
          </div>
        </main>
      </div>

      <TeacherStudentDetailModal open={studentModalOpen} onOpenChange={setStudentModalOpen} student={selectedStudent} />
    </div>
  )
}
