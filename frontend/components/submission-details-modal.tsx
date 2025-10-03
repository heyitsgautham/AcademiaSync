"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Save, Calendar, User, Mail } from "lucide-react"

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

interface SubmissionDetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    submission: Submission | null
    assignment: any
    onSave: (submissionId: number, grade: number, feedback: string) => void
    isSaving: boolean
}

export function SubmissionDetailsModal({
    open,
    onOpenChange,
    submission,
    assignment,
    onSave,
    isSaving,
}: SubmissionDetailsModalProps) {
    const [grade, setGrade] = useState("")
    const [feedback, setFeedback] = useState("")

    // Update grade and feedback whenever submission changes
    useEffect(() => {
        if (submission) {
            setGrade(submission.grade?.toString() || "")
            setFeedback(submission.feedback || "")
        } else {
            setGrade("")
            setFeedback("")
        }
    }, [submission])

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen)
    }

    const handleSave = () => {
        if (!submission?.submission_id) return

        const gradeNum = parseInt(grade)
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
            return
        }

        onSave(submission.submission_id, gradeNum, feedback)
    }

    if (!submission) return null

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "graded":
                return "default"
            case "submitted":
                return "secondary"
            case "late":
                return "destructive"
            default:
                return "outline"
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Submission Details</DialogTitle>
                    <DialogDescription>
                        View and grade the student's submission for this assignment
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Student Info */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Student Information</h3>
                        <div className="grid gap-3 bg-muted p-4 rounded-lg">
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
                                <Badge variant={getStatusColor(submission.status)}>{submission.status}</Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Assignment Question */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Assignment Question</h3>
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">
                                {assignment?.description || "No description available"}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Student's Answer */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Student's Answer</h3>
                        {submission.submission_text ? (
                            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm whitespace-pre-wrap">{submission.submission_text}</p>
                            </div>
                        ) : (
                            <div className="bg-muted p-4 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">No submission yet</p>
                            </div>
                        )}
                    </div>

                    {submission.submission_id && (
                        <>
                            <Separator />

                            {/* Grading Section */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Grading</h3>
                                <div className="grid gap-4">
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
                                            rows={4}
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    {submission.submission_id && (
                        <Button onClick={handleSave} disabled={isSaving || !grade}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Grade"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
