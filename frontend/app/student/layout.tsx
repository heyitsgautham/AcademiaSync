import type React from "react"
import { BookOpen, Menu, X } from "lucide-react"
import Link from "next/link"
import { StudentDashboardSidebar } from "@/components/student-dashboard-sidebar"
import { StudentDashboardTopbar } from "@/components/student-dashboard-topbar"
import { StudentThemeWrapper } from "@/components/student-theme-wrapper"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentThemeWrapper>
      <div className="flex h-screen bg-background">
        {/* Sidebar - hidden on mobile by default */}
        <aside className="hidden md:flex md:w-64 md:flex-col bg-sidebar border-r border-sidebar-border">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <Link href="/student/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">AcademiaSync</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <StudentDashboardSidebar />
          
          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <p className="text-xs text-muted-foreground">© AcademiaSync 2025</p>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top navbar */}
          <StudentDashboardTopbar />
          
          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-background">{children}</main>
        </div>
      </div>
    </StudentThemeWrapper>
  )
}

