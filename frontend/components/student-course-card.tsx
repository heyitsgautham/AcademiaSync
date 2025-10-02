import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { User } from "lucide-react"
import Link from "next/link"

interface StudentCourseCardProps {
  id: string
  title: string
  instructor: string
  progress: number
}

export function StudentCourseCard({ id, title, instructor, progress }: StudentCourseCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{instructor}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/student/assignments?course=${id}`} className="w-full">
          <Button className="w-full bg-transparent" variant="outline">
            View Assignments
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
