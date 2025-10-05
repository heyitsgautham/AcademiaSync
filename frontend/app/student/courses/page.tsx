"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StudentCourseCard } from "@/components/student-course-card"
import { EnrollCoursesModal } from "@/components/enroll-courses-modal"
import { Skeleton } from "@/components/ui/skeleton"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Course {
  id: string
  title: string
  description?: string
  instructor: string
  instructorPicture?: string
  progress: number
}

interface CoursesData {
  student: {
    name: string
    email: string
  }
  courses: Course[]
}

export default function StudentCoursesPage() {
  const [enrollModalOpen, setEnrollModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { data, isLoading } = useQuery<CoursesData>({
    queryKey: ["student-courses"],
    queryFn: async () => {
      const res = await fetch("/api/student/courses")
      return res.json()
    },
  })

  // Safe access to courses with fallback
  const courses = data?.courses || []

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground lg:text-3xl">My Courses</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage and track your enrolled courses</p>
            </div>
            <Button onClick={() => setEnrollModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Enroll in Course
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
              {filteredCourses.map((course) => (
                <StudentCourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No courses found. Enroll in your first course to get started!</p>
            </div>
          )}
        </div>
      </main>

      <EnrollCoursesModal open={enrollModalOpen} onOpenChange={setEnrollModalOpen} />
    </>
  )
}
