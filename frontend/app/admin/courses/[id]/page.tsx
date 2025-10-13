"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Menu, X, ArrowLeft, Users, Award, User, BookOpen } from "lucide-react"
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

interface StudentGrade {
    studentId: number
    firstName: string
    lastName: string
    email: string
    profilePicture?: string
    averageGrade: number | null
    totalSubmissions: number
    totalAssignments: number
}

interface CourseData {
    courseId: number
    courseTitle: string
    courseDescription: string
    teacherName: string
    teacherId: number
    students: StudentGrade[]
}

export default function AdminCourseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const courseId = params.id as string

    const { data: courseData, isLoading } = useQuery<CourseData>({
        queryKey: ["admin-course-detail", courseId],
        queryFn: async () => {
            const res = await fetch(`/api/admin/courses/${courseId}/students`)
            if (!res.ok) {
                throw new Error("Failed to fetch course data")
            }
            return res.json()
        },
    })

    const students = Array.isArray(courseData?.students) ? courseData.students : []
    const overallAverage = students.length > 0
        ? students.reduce((sum, student) => sum + (student.averageGrade || 0), 0) / students.length
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
                            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/courses")} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Courses
                            </Button>
                        </div>
                        <AdminDashboardTopbar />
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            {/* Course Header */}
                            {isLoading ? (
                                <Card>
                                    <CardHeader>
                                        <Skeleton className="h-8 w-64" />
                                    </CardHeader>
                                </Card>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-3">
                                    <Card className="md:col-span-2">
                                        <CardHeader>
                                            <div className="flex items-start gap-3">
                                                <BookOpen className="h-6 w-6 text-primary mt-1" />
                                                <div>
                                                    <CardTitle className="text-2xl">{courseData?.courseTitle}</CardTitle>
                                                    <p className="text-sm text-muted-foreground mt-2">{courseData?.courseDescription}</p>
                                                    <div className="mt-3">
                                                        <Badge variant="secondary">
                                                            Instructor: {courseData?.teacherName}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Course Statistics</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                    <Users className="h-4 w-4" />
                                                    <span className="text-xs">Total Students</span>
                                                </div>
                                                <p className="text-2xl font-bold">{students.length}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                    <Award className="h-4 w-4" />
                                                    <span className="text-xs">Average Grade</span>
                                                </div>
                                                <p className="text-2xl font-bold">
                                                    {overallAverage > 0 ? `${overallAverage.toFixed(1)}%` : "N/A"}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Enrolled Students */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Enrolled Students ({students.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="space-y-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Skeleton key={i} className="h-16 w-full" />
                                            ))}
                                        </div>
                                    ) : students.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <Users className="h-12 w-12 text-muted-foreground mb-3" />
                                            <p className="text-muted-foreground">No students enrolled yet</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Student</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Progress</TableHead>
                                                        <TableHead className="text-right">Average Grade</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {students.map((student) => {
                                                        const avgGrade = student.averageGrade !== null ? student.averageGrade : null
                                                        const progressPercent = student.totalAssignments > 0
                                                            ? Math.round((student.totalSubmissions / student.totalAssignments) * 100)
                                                            : 0

                                                        return (
                                                            <TableRow
                                                                key={student.studentId}
                                                                className="cursor-pointer hover:bg-muted/50"
                                                                onClick={() => router.push(`/admin/students/${student.studentId}`)}
                                                            >
                                                                <TableCell>
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarImage src={student.profilePicture} alt={`${student.firstName} ${student.lastName}`} />
                                                                            <AvatarFallback>
                                                                                <User className="h-4 w-4" />
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground">{student.email}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 bg-secondary rounded-full h-2 max-w-[100px]">
                                                                            <div
                                                                                className="bg-primary h-2 rounded-full transition-all"
                                                                                style={{ width: `${progressPercent}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {student.totalSubmissions}/{student.totalAssignments}
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
