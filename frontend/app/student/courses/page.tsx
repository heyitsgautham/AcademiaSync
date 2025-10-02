"use client"

import { useQuery } from "@tanstack/react-query"
import { StudentCourseCard } from "@/components/student-course-card"
import { EnrollCoursesModal } from "@/components/enroll-courses-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search } from "lucide-react"
import { useState } from "react"

interface Course {
  id: string
  title: string
  instructor: string
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

  const filteredCourses = data?.courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground mt-1">Manage and track your enrolled courses</p>
          </div>
          <Button onClick={() => setEnrollModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Enroll in Course
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Courses Grid */}
        {filteredCourses && filteredCourses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <StudentCourseCard key={course.id} {...course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No courses found</p>
            <Button onClick={() => setEnrollModalOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Enroll in Your First Course
            </Button>
          </div>
        )}
      </div>

      <EnrollCoursesModal open={enrollModalOpen} onOpenChange={setEnrollModalOpen} />
    </>
  )
}
