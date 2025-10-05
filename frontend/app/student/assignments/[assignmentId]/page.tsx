"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Upload, CheckCircle2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface AssignmentDetails {
    id: string
    name: string
    course: string
    courseId: string
    dueDate: string
    question?: string
    status: "Pending" | "Submitted" | "Graded"
    submission?: string
    grade?: number
    feedback?: string
    submittedAt?: string
}

export default function StudentAssignmentDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const assignmentId = params.assignmentId as string
    const [submission, setSubmission] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: assignment, isLoading } = useQuery<AssignmentDetails>({
        queryKey: ["assignment-details", assignmentId],
        queryFn: async () => {
            const res = await fetch(`/api/student/assignments/${assignmentId}`)
            if (!res.ok) throw new Error("Failed to fetch assignment details")
            return res.json()
        },
    })

    // Set initial submission if already submitted
    useEffect(() => {
        if (assignment?.submission && !submission) {
            setSubmission(assignment.submission)
        }
    }, [assignment?.submission, submission])

    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/student/submit-assignment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentId: assignment?.id,
                    submission,
                    fileName: file?.name,
                }),
            })
            if (!res.ok) throw new Error("Failed to submit assignment")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignment-details", assignmentId] })
            queryClient.invalidateQueries({ queryKey: ["student-assignments"] })
            queryClient.invalidateQueries({ queryKey: ["student-dashboard"] })
            toast({
                title: "Assignment submitted",
                description: "Your assignment has been submitted successfully.",
            })
            setFile(null)
        },
        onError: () => {
            toast({
                title: "Submission failed",
                description: "Failed to submit assignment. Please try again.",
                variant: "destructive",
            })
        },
    })

    const handleSubmit = () => {
        if (!submission.trim()) {
            toast({
                title: "Empty submission",
                description: "Please enter your assignment submission.",
                variant: "destructive",
            })
            return
        }
        submitMutation.mutate()
    }

    return (
        <div className="p-4 lg:p-6">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Back Button */}
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Assignments
                </Button>

                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : !assignment ? (
                    <Card>
                        <CardContent className="py-12">
                            <p className="text-center text-muted-foreground">Assignment not found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Assignment Header */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-2xl">{assignment.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-2">{assignment.course}</p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            assignment.status === "Graded"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                : assignment.status === "Submitted"
                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                        }
                                    >
                                        {assignment.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Due: {assignment.dueDate}</p>
                            </CardHeader>
                        </Card>

                        {/* Assignment Question */}
                        {assignment.question && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Assignment Question
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{assignment.question}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Submission Section */}
                        {assignment.status === "Pending" ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Submit Your Assignment</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="submission">Your Submission</Label>
                                        <Textarea
                                            id="submission"
                                            placeholder="Enter your assignment submission here..."
                                            value={submission}
                                            onChange={(e) => setSubmission(e.target.value)}
                                            rows={10}
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="file">Attach File (Optional)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="file"
                                                type="file"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className="flex-1"
                                            />
                                            {file && (
                                                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                        {file && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Upload className="h-4 w-4" />
                                                {file.name}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!submission.trim() || submitMutation.isPending}
                                        className="w-full"
                                    >
                                        {submitMutation.isPending ? "Submitting..." : "Submit Assignment"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {/* Student Submission */}
                                {assignment.submission && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-green-600" />
                                                Your Submission
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm whitespace-pre-wrap">{assignment.submission}</p>
                                            {assignment.submittedAt && (
                                                <p className="mt-4 text-sm text-muted-foreground">
                                                    Submitted on: {assignment.submittedAt}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Grade and Feedback */}
                                {assignment.status === "Graded" && (
                                    <>
                                        {assignment.grade !== undefined && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <CheckCircle2 className="h-5 w-5 text-purple-600" />
                                                        Grade
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-4xl font-bold">{assignment.grade}</span>
                                                        <span className="text-xl text-muted-foreground">/ 100</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {assignment.feedback && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">Instructor Feedback</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                        {assignment.feedback}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
