"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Menu, X, Plus, Search } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AssignmentsByCourse } from "@/components/assignments-by-course"
import { AssignmentModal } from "@/components/assignment-modal"
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

  // Fetch all courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: courseApi.getCourses,
  })

  // Fetch assignments for each course
  const { data: assignmentsByCourse, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["all-assignments", courses],
    queryFn: async () => {
      if (!courses || courses.length === 0) return []

      const assignmentsPromises = courses.map(async (course: any) => {
        try {
          const assignments = await courseApi.getAssignments(course.id)
          return {
            courseId: course.id,
            courseName: course.title,
            assignments: assignments || [],
          }
        } catch (error) {
          console.error(`Error fetching assignments for course ${course.id}:`, error)
          return {
            courseId: course.id,
            courseName: course.title,
            assignments: [],
          }
        }
      })

      return Promise.all(assignmentsPromises)
    },
    enabled: !!courses && courses.length > 0,
  })

  const handleCreateAssignment = () => {
    setSelectedAssignment(null)
    setAssignmentModalOpen(true)
  }

  const handleEditAssignment = (assignment: any) => {
    setSelectedAssignment(assignment)
    setSelectedCourseId(assignment.course_id)
    setAssignmentModalOpen(true)
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
          <h1 className="text-xl font-bold text-primary">AcademiaSync</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>
        <DashboardSidebar />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 lg:flex-none">
            <h2 className="text-lg font-semibold text-foreground lg:hidden">Assignments</h2>
          </div>
          <DashboardTopbar />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Assignments</h1>
                <p className="text-sm text-muted-foreground mt-1">Create and manage assignments across courses</p>
              </div>
              {courses && courses.length > 0 ? (
                <div className="flex gap-2">
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: any) => (
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

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : assignmentsByCourse && assignmentsByCourse.length > 0 ? (
              <AssignmentsByCourse
                assignmentsByCourse={assignmentsByCourse}
                searchQuery={searchQuery}
                onEdit={handleEditAssignment}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {courses && courses.length === 0
                    ? "Create a course first before adding assignments."
                    : "No assignments found. Create your first assignment!"}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedCourseId && (
        <AssignmentModal
          open={assignmentModalOpen}
          onOpenChange={setAssignmentModalOpen}
          assignment={selectedAssignment}
          courseId={selectedCourseId}
        />
      )}
    </div>
  )
}
