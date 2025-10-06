"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Menu, X, Plus } from "lucide-react"
import { AdminThemeWrapper } from "@/components/admin-theme-wrapper"
import { AdminDashboardSidebar } from "@/components/admin-dashboard-sidebar"
import { AdminDashboardTopbar } from "@/components/admin-dashboard-topbar"
import { AdminDashboardLogo } from "@/components/admin-dashboard-logo"
import { AdminStudentsTable } from "@/components/admin-students-table"
import { AdminStudentModal } from "@/components/admin-student-modal"
import { Button } from "@/components/ui/button"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default function AdminStudentsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [studentModalOpen, setStudentModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [modalMode, setModalMode] = useState<"create" | "edit">("create")
    const queryClient = useQueryClient()

    const { data: students, isLoading } = useQuery({
        queryKey: ["admin-students"],
        queryFn: async () => {
            const res = await fetch("/api/admin/students")
            return res.json()
        },
    })

    const handleUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ["admin-students"] })
    }

    const handleCreateStudent = () => {
        setSelectedStudent(null)
        setModalMode("create")
        setStudentModalOpen(true)
    }

    const handleEditStudent = (student: any) => {
        setSelectedStudent(student)
        setModalMode("edit")
        setStudentModalOpen(true)
    }

    const handleDeleteStudent = () => {
        queryClient.invalidateQueries({ queryKey: ["admin-students"] })
    }

    const handleModalSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["admin-students"] })
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

                {/* Main content */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top navbar */}
                    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground" aria-label="Open sidebar">
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex-1 lg:flex-none">
                            <h2 className="text-lg font-semibold text-foreground lg:hidden">Students</h2>
                        </div>
                        <AdminDashboardTopbar />
                    </header>

                    {/* Main content area */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            {/* Header with action button */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Students</h1>
                                    <p className="text-sm text-muted-foreground mt-1">Manage student accounts and promote roles</p>
                                </div>
                                <Button onClick={handleCreateStudent} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Student
                                </Button>
                            </div>

                            {/* Students Table */}
                            <AdminStudentsTable
                                students={students || []}
                                isLoading={isLoading}
                                onUpdate={handleUpdate}
                                onEdit={handleEditStudent}
                                onDelete={handleDeleteStudent}
                            />
                        </div>
                    </main>
                </div>
            </div>

            {/* Student Modal */}
            <AdminStudentModal
                open={studentModalOpen}
                onOpenChange={setStudentModalOpen}
                student={selectedStudent}
                onSuccess={handleModalSuccess}
                mode={modalMode}
            />
        </AdminThemeWrapper>
    )
}
