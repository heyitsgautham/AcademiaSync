"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Users, FileText, BarChart3, Settings } from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { name: "Courses", href: "/teacher/courses", icon: BookOpen },
  { name: "Students", href: "/teacher/students", icon: Users },
  { name: "Assignments", href: "/teacher/assignments", icon: FileText },
  { name: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
  { name: "Settings", href: "/teacher/settings", icon: Settings },
]

export function TeacherDashboardSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1 px-3 py-4" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
              }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
