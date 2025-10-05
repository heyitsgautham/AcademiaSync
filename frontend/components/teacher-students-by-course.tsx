"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"

interface StudentsByCourseProps {
  studentsByCourse: any[]
  searchQuery: string
  courseFilter?: string
  selectedCourseName?: string | null
  onStudentClick: (student: any) => void
  currentPage: number
  itemsPerPage: number
  sortBy: "name" | "grade"
  sortOrder: "asc" | "desc"
  onSortChange: (sortBy: "name" | "grade") => void
  onItemsPerPageChange: (value: string) => void
  onPreviousPage: () => void
  onNextPage: (totalPages: number) => void
}

export function TeacherStudentsByCourse({
  studentsByCourse,
  searchQuery,
  courseFilter,
  selectedCourseName,
  onStudentClick,
  currentPage,
  itemsPerPage,
  sortBy,
  sortOrder,
  onSortChange,
  onItemsPerPageChange,
  onPreviousPage,
  onNextPage
}: StudentsByCourseProps) {
  const [collapsedCourses, setCollapsedCourses] = useState<Set<string>>(new Set())

  // Safe access with fallback
  const coursesArray = Array.isArray(studentsByCourse) ? studentsByCourse : []

  const filteredData = coursesArray
    .filter((course) => !courseFilter || course.courseId.toString() === courseFilter)
    .map((course) => ({
      ...course,
      students: Array.isArray(course.students)
        ? course.students.filter(
          (student: any) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        : [],
    }))
    .filter((course) => course.students.length > 0)

  // Flatten all students for sorting and pagination
  const allStudents = filteredData.flatMap((course) =>
    course.students.map((student: any) => ({
      ...student,
      courseName: course.courseName,
      courseId: course.courseId
    }))
  )

  // Sort students
  const sortedStudents = [...allStudents].sort((a, b) => {
    if (sortBy === "name") {
      const comparison = a.name.localeCompare(b.name)
      return sortOrder === "asc" ? comparison : -comparison
    } else if (sortBy === "grade") {
      const gradeA = a.performance ?? -1
      const gradeB = b.performance ?? -1
      return sortOrder === "asc" ? gradeA - gradeB : gradeB - gradeA
    }
    return 0
  })

  // Calculate pagination
  const totalItems = sortedStudents.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = sortedStudents.slice(startIndex, endIndex)

  const toggleCourse = (courseId: string) => {
    setCollapsedCourses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-6">
      {/* Course Name Heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {selectedCourseName || "All Courses"}
        </h2>
        <span className="text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? "student" : "students"}
        </span>
      </div>

      {/* Sorting Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Button
          variant={sortBy === "name" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("name")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
          {sortBy === "name" && (
            <span className="ml-1 text-xs">
              {sortOrder === "asc" ? "↑" : "↓"}
            </span>
          )}
        </Button>
        <Button
          variant={sortBy === "grade" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("grade")}
        >
          Grade
          <ArrowUpDown className="ml-2 h-4 w-4" />
          {sortBy === "grade" && (
            <span className="ml-1 text-xs">
              {sortOrder === "asc" ? "↑" : "↓"}
            </span>
          )}
        </Button>
      </div>

      {/* Students List */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {paginatedStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            ) : (
              paginatedStudents.map((student: any) => (
                <div
                  key={`${student.courseId}-${student.id}`}
                  onClick={() => onStudentClick(student)}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      {student.avatar && (
                        <AvatarImage
                          src={student.avatar}
                          alt={student.name}
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Course: {student.courseName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-end">
                    <Badge
                      variant={
                        student.performance >= 80
                          ? "default"
                          : student.performance >= 60
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {student.performance >= 80
                        ? "Excellent"
                        : student.performance >= 60
                          ? "Good"
                          : "Needs Improvement"}
                    </Badge>
                    <div className="text-right w-20">
                      <p className="text-sm font-medium text-muted-foreground">Grade</p>
                      <p className="text-2xl font-bold text-primary">{student.performance}%</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} students
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
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
                onClick={onPreviousPage}
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
                onClick={() => onNextPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
