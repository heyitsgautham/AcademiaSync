"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, BookOpen } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  title: string
  instructor: string
  description: string
  duration: string
}

interface EnrollCoursesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnrollCoursesModal({ open, onOpenChange }: EnrollCoursesModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["available-courses"],
    queryFn: async () => {
      const res = await fetch("/api/student/available-courses")
      return res.json()
    },
  })

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-courses"] })
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] })
      toast({
        title: "Enrolled successfully",
        description: "You have been enrolled in the course.",
      })
    },
  })

  // Safe access to courses with fallback - ensure it's always an array
  const coursesArray = Array.isArray(courses) ? courses : []
  const filteredCourses = coursesArray.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enroll in Courses</DialogTitle>
          <DialogDescription>Browse and enroll in available courses to start learning.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Courses List */}
          <div className="grid gap-4">
            {filteredCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {course.instructor} • {course.duration}
                      </CardDescription>
                    </div>
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                  <Button onClick={() => enrollMutation.mutate(course.id)} disabled={enrollMutation.isPending}>
                    {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
