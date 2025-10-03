"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Menu, X, ArrowLeft, Save, Calendar, User, Mail } from "lucide-react"
import { TeacherDashboardSidebar } from "@/components/teacher-dashboard-sidebar"
import { TeacherDashboardTopbar } from "@/components/teacher-dashboard-topbar"
import { TeacherDashboardLogo } from "@/components/teacher-dashboard-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

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

export default function SubmissionDetailPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [grade, setGrade] = useState("")
    const [feedback, setFeedback] = useState("")
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const router = useRouter()
    const params = useParams()
    const assignmentId = params.assignmentId as string
    const studentId = params.studentId as string

    const { data, isLoading } = useQuery({
        queryKey: ["assignment-submissions", assignmentId],
        queryFn: async () => {
            const res = await fetch(`/api/teacher/assignments/${assignmentId}/submissions`)
            if (!res.ok) throw new Error("Failed to fetch submissions")
            return res.json()
        },
    })

    const updateMutation = useMutation({
        mutationFn: async ({ submissionId, grade, feedback }: { submissionId: number; grade: number; feedback: string }) => {
            const res = await fetch(`/api/teacher/submissions/${submissionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ grade, feedback }),
            })
            if (!res.ok) throw new Error("Failed to update submission")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignment-submissions", assignmentId] })
            toast({
                title: "Success",
                description: "Grade updated successfully",
            })
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update grade",
                variant: "destructive",
            })
        },
    })

    const assignment = data?.assignment
    const submissions = Array.isArray(data?.submissions) ? data.submissions : []
    const submission = submissions.find((s: Submission) => s.student_id.toString() === studentId)

    // Set initial grade and feedback when submission is loaded
    useEffect(() => {
        if (submission) {
            setGrade(submission.grade?.toString() || "")
            setFeedback(submission.feedback || "")
        }
    }, [submission])

    const handleSaveGrade = () => {
        if (!submission?.submission_id) {
            toast({
                title: "Error",
                description: "No submission to grade",
                variant: "destructive",
            })
            return
        }

        const gradeNum = parseInt(grade)
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
            toast({
                title: "Error",
                description: "Grade must be between 0 and 100",
                variant: "destructive",
            })
            return
        }

        updateMutation.mutate({
            submissionId: submission.submission_id,
            grade: gradeNum,
            feedback: feedback,
        })
    }

    const getStatusBadge = (status: string, gradeValue: number | null) => {
        if (gradeValue !== null) {
            return <Badge variant="default">Graded</Badge>
        }
        if (status === "Submitted") {
            return <Badge variant="secondary">Submitted</Badge>
        }
        if (status === "Late") {
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
                        <h2 className="text-lg font-semibold text-foreground lg:hidden">Submission Details</h2>
                    </div>
                    <TeacherDashboardTopbar />
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="mx-auto max-w-4xl space-y-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Submission Details</h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {assignment?.title || "Loading..."}
                                </p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-48 rounded-lg" />
                                <Skeleton className="h-64 rounded-lg" />
                                <Skeleton className="h-48 rounded-lg" />
                            </div>
                        ) : !submission ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-12">
                                    <p className="text-muted-foreground">Submission not found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {/* Student Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Student Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{submission.student_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">{submission.student_email}</span>
                                        </div>
                                        {submission.submitted_at && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    Submitted on {new Date(submission.submitted_at).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            {getStatusBadge(submission.status, submission.grade)}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Assignment Question */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Assignment Question</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <p className="text-sm whitespace-pre-wrap">
                                                {assignment?.description || "No description available"}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Student's Answer */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Student's Answer</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {submission.submission_text ? (
                                            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <p className="text-sm whitespace-pre-wrap">{submission.submission_text}</p>
                                            </div>
                                        ) : (
                                            <div className="bg-muted p-4 rounded-lg text-center">
                                                <p className="text-sm text-muted-foreground">No submission yet</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Grading Section */}
                                {submission.submission_id && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Grading</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">
                                                    Grade (0-100) <span className="text-destructive">*</span>
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="Enter grade"
                                                    value={grade}
                                                    onChange={(e) => setGrade(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Feedback</label>
                                                <Textarea
                                                    placeholder="Enter feedback for the student..."
                                                    rows={6}
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={handleSaveGrade}
                                                    disabled={updateMutation.isPending || !grade}
                                                    className="flex-1"
                                                >
                                                    <Save className="h-4 w-4 mr-2" />
                                                    {updateMutation.isPending ? "Saving..." : "Save Grade"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.back()}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
