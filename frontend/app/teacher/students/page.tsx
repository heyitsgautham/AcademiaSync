"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Menu, X, Search } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { Input } from "@/components/ui/input"
import { StudentsByCourse } from "@/components/students-by-course"
import { StudentDetailModal } from "@/components/student-detail-modal"
import { Skeleton } from "@/components/ui/skeleton"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function StudentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentModalOpen, setStudentModalOpen] = useState(false)

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
            <h2 className="text-lg font-semibold text-foreground lg:hidden">Students</h2>
          </div>
          <DashboardTopbar />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Students</h1>
              <p className="text-sm text-muted-foreground mt-1">View and manage students across all courses</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
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
            ) : (
              <StudentsByCourse
                studentsByCourse={studentsByCourse}
                searchQuery={searchQuery}
                onStudentClick={handleStudentClick}
              />
            )}
          </div>
        </main>
      </div>

      <StudentDetailModal open={studentModalOpen} onOpenChange={setStudentModalOpen} student={selectedStudent} />
    </div>
  )
}
