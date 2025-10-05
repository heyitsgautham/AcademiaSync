"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Menu, X } from "lucide-react"
import { AdminThemeWrapper } from "@/components/admin-theme-wrapper"
import { AdminDashboardSidebar } from "@/components/admin-dashboard-sidebar"
import { AdminDashboardTopbar } from "@/components/admin-dashboard-topbar"
import { AdminDashboardLogo } from "@/components/admin-dashboard-logo"
import { AdminAnalyticsCharts } from "@/components/admin-analytics-charts"
import { ApiKeyModal } from "@/components/api-key-modal"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default function AdminAnalyticsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showApiKeyModal, setShowApiKeyModal] = useState(false)

    // Check API key validation on mount
    useEffect(() => {
        const isValidated = sessionStorage.getItem("analytics_api_key_valid") === "true"
        const timestamp = sessionStorage.getItem("analytics_api_key_timestamp")

        // Check if validation is still valid (within last 24 hours)
        if (isValidated && timestamp) {
            const age = Date.now() - parseInt(timestamp)
            const oneDay = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

            if (age < oneDay) {
                setShowApiKeyModal(false)
                return
            }
        }

        // Show modal if not validated or validation expired
        setShowApiKeyModal(true)
    }, [])

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: async () => {
            const res = await fetch("/api/admin/analytics")
            return res.json()
        },
        enabled: !showApiKeyModal, // Only fetch when API key is validated
    })

    const validateApiKey = async (apiKey: string): Promise<boolean> => {
        try {
            // Test the API key by making a request to the analytics endpoint
            const response = await fetch(`/api/admin/analytics/validate?apiKey=${encodeURIComponent(apiKey)}`)
            return response.ok
        } catch (error) {
            console.error("API key validation error:", error)
            return false
        }
    }

    const handleApiKeySuccess = () => {
        setShowApiKeyModal(false)
    }

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

                {/* Main content - Only show when API key is validated */}
                {!showApiKeyModal && (
                    <div className="flex flex-1 flex-col overflow-hidden">
                        {/* Top navbar */}
                        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground" aria-label="Open sidebar">
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="flex-1 lg:flex-none">
                                <h2 className="text-lg font-semibold text-foreground lg:hidden">Analytics</h2>
                            </div>
                            <AdminDashboardTopbar />
                        </header>

                        {/* Main content area */}
                        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                            <div className="mx-auto max-w-7xl space-y-6">
                                {/* Header */}
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Analytics</h1>
                                    <p className="text-sm text-muted-foreground mt-1">Detailed analytics and insights</p>
                                </div>

                                {/* Analytics Charts */}
                                <AdminAnalyticsCharts analytics={analytics} isLoading={analyticsLoading} />
                            </div>
                        </main>
                    </div>
                )}
            </div>

            {/* API Key Modal */}
            <ApiKeyModal
                isOpen={showApiKeyModal}
                onValidate={validateApiKey}
                onSuccess={handleApiKeySuccess}
            />
        </AdminThemeWrapper>
    )
}
