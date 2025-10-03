"use client"

import { useQuery } from "@tanstack/react-query"
import { StudentStatCards } from "@/components/student-stat-cards"
import { StudentRecentActivity } from "@/components/student-recent-activity"
import { StudentDashboardAnalytics } from "@/components/student-dashboard-analytics"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface DashboardData {
  student: {
    name: string
    email: string
  }
  stats: {
    totalCourses: number
    assignmentsDue: number
    averageGrade: number
    gradedAssignments: number
  }
  recentActivity: Array<{
    id: string
    assignmentId: number
    assignment: string
    courseId: number
    course: string
    submittedAt: string
    grade?: number
    status: "graded" | "submitted"
  }>
  analytics: {
    courseProgress: Array<{ course: string; progress: number }>
    submissionStatus: Array<{ name: string; value: number }>
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

  // Safe access to data with fallback values
  const studentName = data?.student?.name || "Student"
  const stats = {
    totalCourses: data?.stats?.totalCourses || 0,
    assignmentsDue: data?.stats?.assignmentsDue || 0,
    averageGrade: data?.stats?.averageGrade || 0,
    gradedAssignments: data?.stats?.gradedAssignments || 0,
  }
  const recentActivity = data?.recentActivity || []
  const analytics = {
    courseProgress: data?.analytics?.courseProgress || [],
    submissionStatus: data?.analytics?.submissionStatus || [],
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {studentName}! Here's what's happening with your courses.
          </p>
        </div>

        {/* Stat cards */}
        <StudentStatCards stats={stats} isLoading={isLoading} />

        {/* Recent Activity and Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
          <StudentRecentActivity activity={recentActivity} isLoading={isLoading} />
          <StudentDashboardAnalytics analytics={analytics} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

