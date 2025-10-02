"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Menu, X, Plus, Search } from "lucide-react"
import { TeacherDashboardSidebar } from "@/components/teacher-dashboard-sidebar"
import { TeacherDashboardTopbar } from "@/components/teacher-dashboard-topbar"
import { TeacherDashboardLogo } from "@/components/teacher-dashboard-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TeacherCourseCard } from "@/components/teacher-course-card"
import { TeacherCourseModal } from "@/components/teacher-course-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { courseApi } from "@/lib/api-client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function CoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: courseApi.getCourses,
  })

  // Safe access with fallback
  const coursesArray = Array.isArray(courses) ? courses : []

  const filteredCourses = coursesArray.filter((course: any) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateCourse = () => {
    setSelectedCourse(null)
    setCourseModalOpen(true)
  }

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course)
    setCourseModalOpen(true)
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
            <h2 className="text-lg font-semibold text-foreground lg:hidden">Courses</h2>
          </div>
          <TeacherDashboardTopbar />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Courses</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your courses and track student progress</p>
              </div>
              <Button onClick={handleCreateCourse} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : filteredCourses && filteredCourses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses?.map((course: any) => (
                  <TeacherCourseCard key={course.id} course={course} onEdit={handleEditCourse} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No courses found. Create your first course to get started!</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <TeacherCourseModal open={courseModalOpen} onOpenChange={setCourseModalOpen} course={selectedCourse} />
    </div>
  )
}
