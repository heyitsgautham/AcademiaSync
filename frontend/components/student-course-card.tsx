"use client"

import { useRouter } from "next/navigation"
import { BookOpen, ClipboardCheck, Award } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentCourseCardProps {
  id: string
  title: string
  description?: string
  instructor: string
  instructorPicture?: string
  progress: number
}

export function StudentCourseCard({ id, title, description, instructor, instructorPicture, progress }: StudentCourseCardProps) {
  const router = useRouter()

  const handlePendingAssignments = () => {
    router.push(`/student/assignments?course=${id}&status=pending`)
  }

  const handleViewGrades = () => {
    router.push(`/student/assignments?course=${id}&status=graded`)
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-2 bg-blue-500" />
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
            <BookOpen className="h-5 w-5 text-blue-500" />
          </div>
          <CardTitle className="text-lg font-semibold line-clamp-2">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={instructorPicture} alt={instructor} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(instructor)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{instructor}</span>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3">
        <div className="w-full flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handlePendingAssignments}>
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Pending Assignments
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleViewGrades}>
            <Award className="h-4 w-4 mr-2" />
            View Grades
          </Button>
        </div>
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Course Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardFooter>
    </Card>
  )
}
