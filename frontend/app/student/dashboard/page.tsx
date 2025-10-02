"use client"

import { useQuery } from "@tanstack/react-query"
import { StudentStatCards } from "@/components/student-stat-cards"
import { StudentAssignmentsTable } from "@/components/student-assignments-table"
import { StudentAnalyticsCharts } from "@/components/student-analytics-charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardData {
  student: {
    name: string
    email: string
  }
  stats: {
    totalCourses: number
    assignmentsDue: number
    assignmentsCompleted: number
    averageGrade: number
  }
  upcomingPendingAssignments: Array<{
    id: string
    name: string
    course: string
    dueDate: string
    status: "Pending" | "Submitted" | "Graded"
    grade?: number
    feedback?: string
    submittedAt?: string
  }>
  gradedAssignments: Array<{
    id: string
    name: string
    course: string
    dueDate: string
    status: "Pending" | "Submitted" | "Graded"
    grade?: number
    feedback?: string
    submittedAt?: string
  }>
  analytics: {
    gradesData: Array<{ week: string; grade: number }>
    courseProgressData: Array<{ course: string; progress: number; color: string }>
  }
}

export default function StudentDashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/student/dashboard")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  // Construct student name with fallback (similar to dashboard-topbar pattern)
  const studentName = data.student?.name || "Student"

  // Safe access to stats with fallback values
  const stats = {
    totalCourses: data.stats?.totalCourses || 0,
    assignmentsDue: data.stats?.assignmentsDue || 0,
    assignmentsCompleted: data.stats?.assignmentsCompleted || 0,
    averageGrade: data.stats?.averageGrade || 0,
  }

  // Safe access to assignments with fallback values
  const upcomingPendingAssignments = data.upcomingPendingAssignments || []
  const gradedAssignments = data.gradedAssignments || []

  // Safe access to analytics with fallback values
  const analytics = {
    gradesData: data.analytics?.gradesData || [],
    courseProgressData: data.analytics?.courseProgressData || [],
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {studentName}!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your courses today.</p>
      </div>

      {/* Stat Cards */}
      <StudentStatCards
        totalCourses={stats.totalCourses}
        assignmentsDue={stats.assignmentsDue}
        assignmentsCompleted={stats.assignmentsCompleted}
        averageGrade={stats.averageGrade}
      />

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Pending Assignments</CardTitle>
          <CardDescription>Assignments that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentAssignmentsTable assignments={upcomingPendingAssignments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Graded Assignments</CardTitle>
          <CardDescription>Recently graded assignments with feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentAssignmentsTable assignments={gradedAssignments} />
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Analytics</h2>
        <StudentAnalyticsCharts
          gradesData={analytics.gradesData}
          courseProgressData={analytics.courseProgressData}
        />
      </div>
    </div>
  )
}
