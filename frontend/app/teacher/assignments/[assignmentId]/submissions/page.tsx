"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Menu, X, ArrowLeft, Eye } from "lucide-react"
import { TeacherDashboardSidebar } from "@/components/teacher-dashboard-sidebar"
import { TeacherDashboardTopbar } from "@/components/teacher-dashboard-topbar"
import { TeacherDashboardLogo } from "@/components/teacher-dashboard-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// Force dynamic rendering
export const dynamic = "force-dynamic"

interface Submission {
    student_id: number
    student_name: string
    student_email: string
    submission_id: number | null
    submission_text: string | null
    submitted_at: string | null
    grade: number | null
    feedback: string | null
    status: string
}

export default function SubmissionsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()
    const params = useParams()
    const assignmentId = params.assignmentId as string

    const { data, isLoading } = useQuery({
        queryKey: ["assignment-submissions", assignmentId],
        queryFn: async () => {
            const res = await fetch(`/api/teacher/assignments/${assignmentId}/submissions`)
            if (!res.ok) throw new Error("Failed to fetch submissions")
            return res.json()
        },
    })

    const assignment = data?.assignment
    const submissions = Array.isArray(data?.submissions) ? data.submissions : []

    const handleViewSubmission = (submission: Submission) => {
        router.push(`/teacher/assignments/${assignmentId}/submissions/${submission.student_id}`)
    }

    const getStatusBadge = (submission: Submission) => {
        if (submission.grade !== null) {
            return <Badge variant="default">Graded</Badge>
        }
        if (submission.status === "Submitted") {
            return <Badge variant="secondary">Submitted</Badge>
        }
        if (submission.status === "Late") {
            return <Badge variant="destructive">Late</Badge>
        }
        return <Badge variant="outline">Not Submitted</Badge>
    }

    return (
        <div className="flex h-screen bg-background">
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border lg:justify-center">
                    <TeacherDashboardLogo />
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <TeacherDashboardSidebar />
            </aside>

            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1 lg:flex-none">
                        <h2 className="text-lg font-semibold text-foreground lg:hidden">Submissions</h2>
                    </div>
                    <TeacherDashboardTopbar />
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="mx-auto max-w-7xl space-y-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
                                    {assignment?.title || "Assignment Submissions"}
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    View and grade student submissions
                                </p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 rounded-lg" />
                                ))}
                            </div>
                        ) : submissions.length === 0 ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-12">
                                    <p className="text-muted-foreground">No students enrolled in this course</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[250px]">Student Name</TableHead>
                                                    <TableHead className="w-[250px]">Email</TableHead>
                                                    <TableHead className="w-[150px]">Status</TableHead>
                                                    <TableHead className="w-[100px] text-center">Grade</TableHead>
                                                    <TableHead className="w-[180px]">Submitted At</TableHead>
                                                    <TableHead className="w-[100px] text-center">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {submissions.map((submission: Submission) => (
                                                    <TableRow key={submission.student_id} className="hover:bg-muted/50">
                                                        <TableCell className="font-medium">{submission.student_name}</TableCell>
                                                        <TableCell className="text-muted-foreground">{submission.student_email}</TableCell>
                                                        <TableCell>{getStatusBadge(submission)}</TableCell>
                                                        <TableCell className="text-center">
                                                            {submission.grade !== null ? (
                                                                <span className="font-semibold">{submission.grade}/100</span>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {submission.submitted_at ? (
                                                                <span className="text-sm">
                                                                    {new Date(submission.submitted_at).toLocaleDateString()} {new Date(submission.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewSubmission(submission)}
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
