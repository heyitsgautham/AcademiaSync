"use client"

import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react"

interface StudentDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: any
}

export function StudentDetailModal({ open, onOpenChange, student }: StudentDetailModalProps) {
  const { data: studentDetails, isLoading } = useQuery({
    queryKey: ["student-details", student?.id],
    queryFn: async () => {
      const res = await fetch(`/api/teacher/student-details?id=${student.id}`)
      return res.json()
    },
    enabled: !!student?.id && open,
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "late":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "incomplete":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      completed: "default",
      pending: "secondary",
      late: "destructive",
      incomplete: "destructive",
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>View detailed information and assignment progress</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
              <AvatarFallback>
                {student.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{student.name}</h3>
              <p className="text-sm text-muted-foreground">{student.email}</p>
              <p className="text-sm font-medium mt-1">
                Overall Performance: <span className="text-primary text-lg">{student.performance}%</span>
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentDetails?.assignments?.map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(assignment.status)}
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">{assignment.course}</p>
                          {assignment.submittedDate && (
                            <p className="text-xs text-muted-foreground mt-1">Submitted: {assignment.submittedDate}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {assignment.grade && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Grade</p>
                            <p className="text-lg font-bold text-primary">{assignment.grade}%</p>
                          </div>
                        )}
                        {getStatusBadge(assignment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
