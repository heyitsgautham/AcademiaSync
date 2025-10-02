import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, FileText } from "lucide-react"

interface Assignment {
  id: string
  name: string
  course: string
  dueDate: string
  question?: string
  status: "Pending" | "Submitted" | "Graded"
  submission?: string
  grade?: number
  feedback?: string
  submittedAt?: string
}

interface AssignmentDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment
}

export function AssignmentDetailsModal({ open, onOpenChange, assignment }: AssignmentDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{assignment.name}</DialogTitle>
          <DialogDescription>{assignment.course}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
              </CardContent>
            </Card>
          )}

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {assignment.status === "Graded" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-blue-600" />
                )}
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant="secondary"
                className={
                  assignment.status === "Graded"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                }
              >
                {assignment.status}
              </Badge>
              {assignment.submittedAt && (
                <p className="mt-2 text-sm text-muted-foreground">Submitted on: {assignment.submittedAt}</p>
              )}
            </CardContent>
          </Card>

          {/* Grade */}
          {assignment.status === "Graded" && assignment.grade !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Grade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{assignment.grade}</span>
                  <span className="text-muted-foreground">/ 100</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          {assignment.feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Instructor Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
