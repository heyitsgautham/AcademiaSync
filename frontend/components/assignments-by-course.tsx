"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Calendar, Users } from "lucide-react"
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

interface AssignmentsByCourseProps {
  assignmentsByCourse: any[]
  searchQuery: string
  onEdit: (assignment: any) => void
}

export function AssignmentsByCourse({ assignmentsByCourse, searchQuery, onEdit }: AssignmentsByCourseProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<any>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const filteredData = assignmentsByCourse
    ?.map((course) => ({
      ...course,
      assignments: course.assignments.filter((assignment: any) =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((course) => course.assignments.length > 0)

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => courseApi.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-assignments"] })
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      })
      setDeleteDialogOpen(false)
      setAssignmentToDelete(null)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive",
      })
    },
  })

  const handleDeleteClick = (assignment: any) => {
    setAssignmentToDelete(assignment)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (assignmentToDelete) {
      deleteMutation.mutate(assignmentToDelete.id)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "No due date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <>
      <div className="space-y-6">
        {filteredData?.map((course) => (
          <Card key={course.courseId}>
            <CardHeader>
              <CardTitle className="text-xl">{course.courseName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.assignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="flex flex-col gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Due: {formatDate(assignment.due_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{assignment.submission_count || 0} submissions</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(assignment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(assignment)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assignment "
              {assignmentToDelete?.title}" and all associated submissions.
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
