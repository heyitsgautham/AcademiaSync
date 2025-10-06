import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, UserPlus, Edit, Trash2 } from "lucide-react"

interface Activity {
  id: string
  type: "course_created" | "course_updated" | "course_deleted" | "student_enrolled"
  actorName: string
  actorAvatar?: string
  courseName?: string
  studentName?: string
  timestamp: string
}

interface RecentActivityProps {
  activities?: Activity[]
  isLoading: boolean
}

export function AdminRecentActivity({ activities, isLoading }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course_created":
        return <BookOpen className="h-5 w-5 text-green-500" />
      case "course_updated":
        return <Edit className="h-5 w-5 text-blue-500" />
      case "course_deleted":
        return <Trash2 className="h-5 w-5 text-red-500" />
      case "student_enrolled":
        return <UserPlus className="h-5 w-5 text-purple-500" />
      default:
        return <BookOpen className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case "course_created":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "course_updated":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "course_deleted":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      case "student_enrolled":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "course_created":
        return "Created"
      case "course_updated":
        return "Updated"
      case "course_deleted":
        return "Deleted"
      case "student_enrolled":
        return "Enrolled"
      default:
        return type
    }
  }

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case "course_created":
        return `Created course "${activity.courseName}"`
      case "course_updated":
        return `Updated course "${activity.courseName}"`
      case "course_deleted":
        return `Deleted course "${activity.courseName}"`
      case "student_enrolled":
        return `${activity.studentName} enrolled in "${activity.courseName}"`
      default:
        return "Unknown activity"
    }
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

  // Safe array access - ensure activities is an array
  const activitiesArray = Array.isArray(activities) ? activities : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activitiesArray.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activitiesArray.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  {activity.actorAvatar && (
                    <AvatarImage
                      src={activity.actorAvatar}
                      alt={activity.actorName}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {activity.actorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-shrink-0 mt-2">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{activity.actorName}</p>
                    <Badge className={getActivityBadgeColor(activity.type)}>
                      {getActivityLabel(activity.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
