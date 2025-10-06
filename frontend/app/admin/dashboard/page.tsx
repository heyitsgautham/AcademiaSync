"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Menu, X } from "lucide-react"
import { AdminThemeWrapper } from "@/components/admin-theme-wrapper"
import { AdminDashboardSidebar } from "@/components/admin-dashboard-sidebar"
import { AdminDashboardTopbar } from "@/components/admin-dashboard-topbar"
import { AdminDashboardLogo } from "@/components/admin-dashboard-logo"
import { AdminStatCards } from "@/components/admin-stat-cards"
import { AdminRecentActivity } from "@/components/admin-recent-activity"
import { AdminAnalyticsSection } from "@/components/admin-analytics-section"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default function AdminDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const res = await fetch("/api/admin/stats")
            return res.json()
        },
    })

    const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
        queryKey: ["admin-recent-activity"],
        queryFn: async () => {
            const res = await fetch("/api/admin/recent-activity")
            return res.json()
        },
    })

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ["admin-dashboard-analytics"],
        queryFn: async () => {
            const res = await fetch("/api/admin/dashboard-analytics")
            return res.json()
        },
    })

    return (
        <AdminThemeWrapper>
            <div className="flex h-screen bg-background">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border lg:justify-center">
                        <AdminDashboardLogo />
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground" aria-label="Close sidebar">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <AdminDashboardSidebar />
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
                        <AdminDashboardTopbar />
                    </header>

                    {/* Main content area */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            {/* Header */}
                            <div>
                                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Admin Dashboard</h1>
                                <p className="text-sm text-muted-foreground mt-1">System overview and management</p>
                            </div>

                            {/* Stat cards */}
                            <AdminStatCards stats={stats} isLoading={statsLoading} />

                            {/* Recent Activity and Analytics */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                <AdminRecentActivity activities={recentActivities} isLoading={activitiesLoading} />
                                <AdminAnalyticsSection analytics={analytics} isLoading={analyticsLoading} />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </AdminThemeWrapper>
    )
}
