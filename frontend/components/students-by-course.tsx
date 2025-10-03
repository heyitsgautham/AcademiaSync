"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface StudentsByCourseProps {
  studentsByCourse: any[]
  searchQuery: string
  onStudentClick: (student: any) => void
}

export function StudentsByCourse({ studentsByCourse, searchQuery, onStudentClick }: StudentsByCourseProps) {
  const [collapsedCourses, setCollapsedCourses] = useState<Set<string>>(new Set())

  const filteredData = studentsByCourse
    ?.map((course) => ({
      ...course,
      students: course.students.filter(
        (student: any) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((course) => course.students.length > 0)

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
      {filteredData?.map((course) => {
        const isCollapsed = collapsedCourses.has(course.courseId)

        return (
          <Card key={course.courseId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{course.courseName}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => toggleCourse(course.courseId)} className="h-8 w-8 p-0">
                  {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {!isCollapsed && (
              <CardContent>
                <div className="space-y-4">
                  {course.students.map((student: any) => (
                    <div
                      key={student.id}
                      onClick={() => onStudentClick(student)}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
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
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Performance</p>
                          <p className="text-2xl font-bold text-primary">{student.performance}%</p>
                        </div>
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
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
