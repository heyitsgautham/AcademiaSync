"use client"

import { useState } from "react"
import { BookOpen, Users, TrendingUp, MoreVertical, Edit, Trash2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { courseApi } from "@/lib/api-client"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    studentsEnrolled?: number
    students_enrolled?: number
    progress?: number
    color?: string
  }
  onEdit: (course: any) => void
}

export function CourseCard({ course, onEdit }: CourseCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => courseApi.deleteCourse(course.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      toast({
        title: "Success",
        description: "Course deleted successfully",
      })
      setDeleteDialogOpen(false)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      })
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  const studentsEnrolled = course.studentsEnrolled || course.students_enrolled || 0
  const progress = course.progress || 0
  const color = course.color || "bg-blue-500"

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className={`h-2 ${color}`} />
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
              <BookOpen className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(course)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{studentsEnrolled} students</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{progress}% complete</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
            <span>Course Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course "{course.title}" and all associated
              assignments and submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
