"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Menu, X } from "lucide-react"
import { TeacherDashboardSidebar } from "@/components/teacher-dashboard-sidebar"
import { TeacherDashboardTopbar } from "@/components/teacher-dashboard-topbar"
import { TeacherDashboardLogo } from "@/components/teacher-dashboard-logo"
import { TeacherStatCards } from "@/components/teacher-stat-cards"
import { TeacherRecentActivity } from "@/components/teacher-recent-activity"
import { TeacherAnalyticsSection } from "@/components/teacher-analytics-section"
import { TeacherCreateCourseModal } from "@/components/teacher-create-course-modal"
import { Button } from "@/components/ui/button"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [createCourseOpen, setCreateCourseOpen] = useState(false)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["teacher-stats"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/stats")
      return res.json()
    },
  })

  const { data: recentSubmissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ["recent-submissions"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/recent-submissions")
      return res.json()
    },
  })

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["teacher-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/analytics")
      return res.json()
    },
  })

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border lg:justify-center">
          <TeacherDashboardLogo />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <TeacherDashboardSidebar />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground" aria-label="Open sidebar">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 lg:flex-none">
            <h2 className="text-lg font-semibold text-foreground lg:hidden">Dashboard</h2>
          </div>
          <TeacherDashboardTopbar />
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header with action button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome back! Here's what's happening with your courses.
                </p>
              </div>

            </div>

            {/* Stat cards */}
            <TeacherStatCards stats={stats} isLoading={statsLoading} />

            {/* Recent Activity and Analytics */}
            <div className="grid gap-6 lg:grid-cols-2">
              <TeacherRecentActivity submissions={recentSubmissions} isLoading={submissionsLoading} />
              <TeacherAnalyticsSection analytics={analytics} isLoading={analyticsLoading} />
            </div>
          </div>
        </main>
      </div>

      {/* Create Course Modal */}
      <TeacherCreateCourseModal open={createCourseOpen} onOpenChange={setCreateCourseOpen} />
    </div>
  )
}
