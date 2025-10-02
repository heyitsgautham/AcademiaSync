import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, ClipboardList, CheckCircle2, TrendingUp } from "lucide-react"

interface StatCardsProps {
  totalCourses: number
  assignmentsDue: number
  assignmentsCompleted: number
  averageGrade: number
}

export function StudentStatCards({ totalCourses, assignmentsDue, assignmentsCompleted, averageGrade }: StatCardsProps) {
  const stats = [
    {
      title: "Total Courses Enrolled",
      value: totalCourses,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Assignments Due",
      value: assignmentsDue,
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Assignments Completed",
      value: assignmentsCompleted,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Average Grade",
      value: `${averageGrade}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
