import { BookOpen, Users, TrendingUp, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Stats {
  totalCourses: number
  totalStudents: number
  averageGrade: number
  pendingAssignmentsToGrade: number
}

interface StatCardsProps {
  stats?: Stats
  isLoading: boolean
}

export function TeacherStatCards({ stats, isLoading }: StatCardsProps) {
  const router = useRouter()

  const cards = [
    {
      title: "Total Courses",
      value: stats?.totalCourses ?? 0,
      icon: BookOpen,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      href: "/teacher/courses",
    },
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      href: "/teacher/students",
    },
    {
      title: "Average Grade",
      value: stats?.averageGrade ? `${stats.averageGrade}%` : "0%",
      icon: TrendingUp,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      href: "/teacher/assignments?status=graded",
    },
    {
      title: "Pending Reviews",
      value: stats?.pendingAssignmentsToGrade ?? 0,
      icon: FileText,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      href: "/teacher/assignments?status=submitted",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Statistics">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card 
            key={card.title} 
            className="transition-all hover:shadow-lg cursor-pointer hover:scale-105"
            onClick={() => router.push(card.href)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className={`rounded-full p-3 ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
