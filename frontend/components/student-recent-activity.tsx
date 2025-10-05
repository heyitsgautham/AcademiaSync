import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface Activity {
  id: string
  assignmentId: number
  assignment: string
  courseId: number
  course: string
  submittedAt: string
  grade?: number
  status: "graded" | "submitted"
}

interface StudentRecentActivityProps {
  activity?: Activity[]
  isLoading: boolean
}

export function StudentRecentActivity({ activity, isLoading }: StudentRecentActivityProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "graded":
        return "bg-chart-3 text-white"
      case "submitted":
        return "bg-chart-2 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleActivityClick = (assignmentId: number) => {
    router.push(`/student/assignments/${assignmentId}`)
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

  // Safe array access - ensure activity is an array
  const activityArray = Array.isArray(activity) ? activity : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activityArray.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityArray.map((item) => (
              <div
                key={item.id}
                onClick={() => handleActivityClick(item.assignmentId)}
                className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <div className="rounded-full p-2 bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{item.assignment}</p>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status === "graded" ? "Graded" : "Submitted"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.course}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{item.submittedAt}</p>
                    {item.grade !== null && item.grade !== undefined && (
                      <p className="text-xs font-medium text-foreground">Grade: {item.grade}%</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
