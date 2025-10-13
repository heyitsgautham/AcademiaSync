"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Menu, X, ArrowLeft, BookOpen, Award, User } from "lucide-react"
import { AdminThemeWrapper } from "@/components/admin-theme-wrapper"
import { AdminDashboardSidebar } from "@/components/admin-dashboard-sidebar"
import { AdminDashboardTopbar } from "@/components/admin-dashboard-topbar"
import { AdminDashboardLogo } from "@/components/admin-dashboard-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

// Force dynamic rendering
export const dynamic = "force-dynamic"

interface CourseEnrollment {
    courseId: number
    courseTitle: string
    courseDescription: string
    instructorName: string
    instructorId: number
    averageGrade: number | null
    totalSubmissions: number
    totalAssignments: number
}

interface StudentData {
    studentId: number
    firstName: string
    lastName: string
    email: string
    profilePicture?: string
    courses: CourseEnrollment[]
}

export default function AdminStudentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const studentId = params.id as string

    const { data: studentData, isLoading } = useQuery<StudentData>({
        queryKey: ["admin-student-detail", studentId],
        queryFn: async () => {
            const res = await fetch(`/api/admin/students/${studentId}/courses`)
            if (!res.ok) {
                throw new Error("Failed to fetch student data")
            }
            return res.json()
        },
    })

    const courses = Array.isArray(studentData?.courses) ? studentData.courses : []
    const studentName = studentData ? `${studentData.firstName} ${studentData.lastName}` : ""

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
                    {/* Topbar */}
                    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground" aria-label="Open sidebar">
                                <Menu className="h-6 w-6" />
                            </button>
                            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/students")} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Students
                            </Button>
                        </div>
                        <AdminDashboardTopbar />
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            {/* Student Header */}
                            {isLoading ? (
                                <Card>
                                    <CardHeader>
                                        <Skeleton className="h-8 w-64" />
                                    </CardHeader>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={studentData?.profilePicture} alt={studentName} />
                                                <AvatarFallback>
                                                    <User className="h-8 w-8" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-2xl">{studentName}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{studentData?.email}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            )}

                            {/* Enrolled Courses */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        Enrolled Courses
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="space-y-3">
                                            {[...Array(3)].map((_, i) => (
                                                <Skeleton key={i} className="h-16 w-full" />
                                            ))}
                                        </div>
                                    ) : courses.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <BookOpen className="h-12 w-12 text-muted-foreground mb-3" />
                                            <p className="text-muted-foreground">No courses enrolled yet</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Course Name</TableHead>
                                                        <TableHead>Instructor</TableHead>
                                                        <TableHead>Progress</TableHead>
                                                        <TableHead className="text-right">Average Grade</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {courses.map((course) => {
                                                        const avgGrade = course.averageGrade !== null ? course.averageGrade : null
                                                        const progressPercent = course.totalAssignments > 0
                                                            ? Math.round((course.totalSubmissions / course.totalAssignments) * 100)
                                                            : 0

                                                        return (
                                                            <TableRow key={course.courseId}>
                                                                <TableCell>
                                                                    <div>
                                                                        <p className="font-medium">{course.courseTitle}</p>
                                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                                            {course.courseDescription}
                                                                        </p>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                                        <span>{course.instructorName}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 bg-secondary rounded-full h-2 max-w-[100px]">
                                                                            <div
                                                                                className="bg-primary h-2 rounded-full transition-all"
                                                                                style={{ width: `${progressPercent}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {course.totalSubmissions}/{course.totalAssignments}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {avgGrade !== null ? (
                                                                        <Badge variant={avgGrade >= 70 ? "default" : avgGrade >= 50 ? "secondary" : "destructive"}>
                                                                            <Award className="h-3 w-3 mr-1" />
                                                                            {avgGrade.toFixed(1)}%
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-sm text-muted-foreground">No grades yet</span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </AdminThemeWrapper>
    )
}
