import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

interface Submission {
  id: string
  studentId: number
  studentName: string
  studentAvatar: string
  course: string
  courseId: number
  assignment: string
  assignmentId: number
  status: "completed" | "pending" | "late"
  submittedAt: string
}

interface RecentActivityProps {
  submissions?: Submission[]
  isLoading: boolean
}

export function TeacherRecentActivity({ submissions, isLoading }: RecentActivityProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-chart-3 text-white"
      case "pending":
        return "bg-chart-2 text-white"
      case "late":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleSubmissionClick = (assignmentId: number, studentId: number) => {
    router.push(`/teacher/assignments/${assignmentId}/submissions/${studentId}`)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Safe array access - ensure submissions is an array
  const submissionsArray = Array.isArray(submissions) ? submissions : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {submissionsArray.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent submissions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissionsArray.map((submission) => (
              <div
                key={submission.id}
                onClick={() => handleSubmissionClick(submission.assignmentId, submission.studentId)}
                className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <Avatar className="h-10 w-10">
                  {submission.studentAvatar && (
                    <AvatarImage
                      src={submission.studentAvatar}
                      alt={submission.studentName}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {submission.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{submission.studentName}</p>
                    <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {submission.course} • {submission.assignment}
                  </p>
                  <p className="text-xs text-muted-foreground">{submission.submittedAt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
