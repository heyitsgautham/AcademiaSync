"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { Menu, X, Plus, Search } from "lucide-react"
import { TeacherDashboardSidebar } from "@/components/teacher-dashboard-sidebar"
import { TeacherDashboardTopbar } from "@/components/teacher-dashboard-topbar"
import { TeacherDashboardLogo } from "@/components/teacher-dashboard-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TeacherAssignmentsByCourse } from "@/components/teacher-assignments-by-course"
import { TeacherAssignmentModal } from "@/components/teacher-assignment-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { courseApi } from "@/lib/api-client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function AssignmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [courseFilterId, setCourseFilterId] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const router = useRouter()
  const searchParams = useSearchParams()

  // Get courseId and status from URL query params if present
  useEffect(() => {
    const courseIdParam = searchParams.get('courseId')
    const statusParam = searchParams.get('status')

    if (courseIdParam) {
      setCourseFilterId(courseIdParam)
      setSelectedCourseId(courseIdParam) // Also set for the create assignment dropdown
    }

    if (statusParam) {
      setStatusFilter(statusParam)
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

  // Fetch assignments with status information
  const { data: assignmentsWithStatus, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments-with-status", statusFilter],
    queryFn: async () => {
      const url = statusFilter
        ? `/api/teacher/assignments-with-status?status=${statusFilter}`
        : '/api/teacher/assignments-with-status'
      const res = await fetch(url)
      return res.json()
    },
  })

  // Group assignments by course for display
  const assignmentsByCourse = assignmentsWithStatus && coursesArray
    ? coursesArray.map((course: any) => ({
      courseId: course.id,
      courseName: course.title,
      assignments: Array.isArray(assignmentsWithStatus)
        ? assignmentsWithStatus.filter((a: any) => a.course_id === course.id)
        : [],
    })).filter((c: any) => c.assignments.length > 0)
    : []

  const handleCreateAssignment = () => {
    setSelectedAssignment(null)
    setAssignmentModalOpen(true)
  }

  const handleEditAssignment = (assignment: any) => {
    setSelectedAssignment(assignment)
    setSelectedCourseId(assignment.course_id)
    setAssignmentModalOpen(true)
  }

  const handleCourseFilterChange = (value: string) => {
    setCourseFilterId(value)
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('courseId', value)
    } else {
      params.delete('courseId')
    }
    router.push(`/teacher/assignments?${params.toString()}`, { scroll: false })
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('status', value)
    } else {
      params.delete('status')
    }
    router.push(`/teacher/assignments?${params.toString()}`, { scroll: false })
  }

  const handleClearFilter = () => {
    setCourseFilterId("")
    setSelectedCourseId("") // Also clear the selected course for assignment creation
    setStatusFilter("")
    router.push('/teacher/assignments', { scroll: false })
  }

  const isLoading = coursesLoading || assignmentsLoading

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
            <h2 className="text-lg font-semibold text-foreground lg:hidden">Assignments</h2>
          </div>
          <TeacherDashboardTopbar />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Assignments</h1>
                <p className="text-sm text-muted-foreground mt-1">Create and manage assignments across courses</p>
              </div>
              {coursesArray && coursesArray.length > 0 ? (
                <div className="flex gap-2">
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesArray.map((course: any) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleCreateAssignment}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!selectedCourseId}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {coursesArray && coursesArray.length > 0 && (
                <div className="flex gap-2">
                  <Select value={courseFilterId} onValueChange={handleCourseFilterChange}>
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
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="not-submitted">Not Submitted</SelectItem>
                      <SelectItem value="graded">Graded</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                  {(courseFilterId || statusFilter) && (
                    <Button variant="outline" onClick={handleClearFilter}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : assignmentsByCourse && assignmentsByCourse.length > 0 ? (
              <TeacherAssignmentsByCourse
                assignmentsByCourse={assignmentsByCourse}
                searchQuery={searchQuery}
                courseFilter={courseFilterId}
                onEdit={handleEditAssignment}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {coursesArray && coursesArray.length === 0
                    ? "Create a course first before adding assignments."
                    : "No assignments found. Create your first assignment!"}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedCourseId && (
        <TeacherAssignmentModal
          open={assignmentModalOpen}
          onOpenChange={setAssignmentModalOpen}
          assignment={selectedAssignment}
          courseId={selectedCourseId}
        />
      )}
    </div>
  )
}
