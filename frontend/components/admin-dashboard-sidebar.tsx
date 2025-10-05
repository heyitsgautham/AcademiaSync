"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, GraduationCap, BarChart3, Settings, Shield } from "lucide-react"

const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Teachers", href: "/admin/teachers", icon: GraduationCap },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminDashboardSidebar() {
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
