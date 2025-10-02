import type React from "react"
import { StudentDashboardSidebar } from "@/components/student-dashboard-sidebar"
import { StudentDashboardTopbar } from "@/components/student-dashboard-topbar"
import { StudentThemeWrapper } from "@/components/student-theme-wrapper"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentThemeWrapper>
      <StudentDashboardSidebar />
      <div className="md:pl-64">
        <StudentDashboardTopbar studentName="John Doe" studentEmail="john.doe@example.com" />
        <main className="min-h-[calc(100vh-4rem)] bg-background">{children}</main>
      </div>
    </StudentThemeWrapper>
  )
}
