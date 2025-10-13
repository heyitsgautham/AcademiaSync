"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Menu, X, ArrowLeft, BookOpen, Users, Award, TrendingUp } from "lucide-react"
import { AdminThemeWrapper } from "@/components/admin-theme-wrapper"
import { AdminDashboardSidebar } from "@/components/admin-dashboard-sidebar"
import { AdminDashboardTopbar } from "@/components/admin-dashboard-topbar"
import { AdminDashboardLogo } from "@/components/admin-dashboard-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Force dynamic rendering
export const dynamic = "force-dynamic"

interface CourseStats {
    courseId: number
    courseTitle: string
    courseDescription: string
    studentCount: number
    averageGrade: number | null
    totalAssignments: number
}

interface TeacherData {
    teacherId: number
    firstName: string
    lastName: string
    email: string
    specialization?: string
    courses: CourseStats[]
}

export default function AdminTeacherDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const teacherId = params.id as string

    const { data: teacherData, isLoading } = useQuery<TeacherData>({
        queryKey: ["admin-teacher-detail", teacherId],
        queryFn: async () => {
            const res = await fetch(`/api/admin/teachers/${teacherId}/courses`)
            if (!res.ok) {
                throw new Error("Failed to fetch teacher data")
            }
            return res.json()
        },
    })

    const courses = Array.isArray(teacherData?.courses) ? teacherData.courses : []
    const teacherName = teacherData ? `${teacherData.firstName} ${teacherData.lastName}` : ""

    const totalStudents = courses.reduce((sum, course) => sum + course.studentCount, 0)
    const overallAverage = courses.length > 0
        ? courses.reduce((sum, course) => sum + (course.averageGrade || 0), 0) / courses.length
        : 0

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
                            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/teachers")} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Teachers
                            </Button>
                        </div>
                        <AdminDashboardTopbar />
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            {/* Teacher Header */}
                            {isLoading ? (
                                <Card>
                                    <CardHeader>
                                        <Skeleton className="h-8 w-64" />
                                    </CardHeader>
                                </Card>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-3">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Teacher Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-2xl font-bold">{teacherName}</p>
                                                <p className="text-sm text-muted-foreground">{teacherData?.email}</p>
                                                {teacherData?.specialization && (
                                                    <Badge variant="secondary">{teacherData.specialization}</Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{totalStudents}</div>
                                            <p className="text-xs text-muted-foreground">Across all courses</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {overallAverage > 0 ? `${overallAverage.toFixed(1)}%` : "N/A"}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Average across courses</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Courses Handled */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        Courses Handled
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
                                            <p className="text-muted-foreground">No courses assigned yet</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Course Name</TableHead>
                                                        <TableHead>Assignments</TableHead>
                                                        <TableHead className="text-center">Students</TableHead>
                                                        <TableHead className="text-right">Average Grade</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {courses.map((course) => {
                                                        const avgGrade = course.averageGrade !== null ? course.averageGrade : null

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
                                                                    <Badge variant="outline">{course.totalAssignments} assignments</Badge>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => router.push(`/admin/teachers/${teacherId}/courses/${course.courseId}/students`)}
                                                                        className="font-medium text-primary hover:underline"
                                                                    >
                                                                        <Users className="h-4 w-4 mr-1" />
                                                                        {course.studentCount}
                                                                    </Button>
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
