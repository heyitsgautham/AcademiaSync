"use client"

import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { StudentAssignmentsTable } from "@/components/student-assignments-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Assignment {
  id: string
  name: string
  course: string
  dueDate: string
  question?: string
  status: "Pending" | "Submitted" | "Graded"
  submission?: string
  grade?: number
  feedback?: string
  submittedAt?: string
}

interface AssignmentsData {
  student: {
    name: string
    email: string
  }
  assignments: Assignment[]
  courses: Array<{ id: string; title: string }>
}

export default function StudentAssignmentsPage() {
  const searchParams = useSearchParams()
  const courseFilter = searchParams.get("course")
  const [selectedCourse, setSelectedCourse] = useState<string>(courseFilter || "all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data, isLoading } = useQuery<AssignmentsData>({
    queryKey: ["student-assignments"],
    queryFn: async () => {
      const res = await fetch("/api/student/assignments")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!data) return null

  // Safe access to data with fallbacks
  const assignments = data.assignments || []
  const courses = data.courses || []

  const filteredAssignments = assignments.filter((assignment) => {
    const courseMatch =
      selectedCourse === "all" || assignment.course === courses.find((c) => c.id === selectedCourse)?.title
    const statusMatch = statusFilter === "all" || assignment.status === statusFilter
    return courseMatch && statusMatch
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground mt-1">Track and submit your course assignments</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Submitted">Submitted</TabsTrigger>
          <TabsTrigger value="Graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <StudentAssignmentsTable assignments={filteredAssignments} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
