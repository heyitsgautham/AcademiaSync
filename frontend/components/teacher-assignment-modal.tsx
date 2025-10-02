"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { courseApi } from "@/lib/api-client"

interface AssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment?: any
  courseId: number | string
}

const assignmentSchema = yup.object({
  title: yup.string().required("Assignment title is required"),
  description: yup.string().required("Description is required"),
  due_date: yup.string().nullable(),
})

type AssignmentFormData = yup.InferType<typeof assignmentSchema>

export function TeacherAssignmentModal({ open, onOpenChange, assignment, courseId }: AssignmentModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: yupResolver(assignmentSchema),
  })

  useEffect(() => {
    if (assignment) {
      // Convert timestamp to date input format
      const dueDate = assignment.due_date ? new Date(assignment.due_date).toISOString().split('T')[0] : null
      reset({
        title: assignment.title || "",
        description: assignment.description || "",
        due_date: dueDate,
      })
    } else {
      reset({ title: "", description: "", due_date: null })
    }
  }, [assignment, reset])

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description: string; due_date?: string }) =>
      courseApi.createAssignment(courseId, data),
    onSuccess: () => {
      // Invalidate both the specific course assignments and all assignments
      queryClient.invalidateQueries({ queryKey: ["assignments", courseId] })
      queryClient.invalidateQueries({ queryKey: ["all-assignments"] })
      toast({
        title: "Success",
        description: "Assignment created successfully",
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { title: string; description: string; due_date?: string }) =>
      courseApi.updateAssignment(assignment.id, data),
    onSuccess: () => {
      // Invalidate both the specific course assignments and all assignments
      queryClient.invalidateQueries({ queryKey: ["assignments", courseId] })
      queryClient.invalidateQueries({ queryKey: ["all-assignments"] })
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: AssignmentFormData) => {
    const payload = {
      title: data.title,
      description: data.description,
      due_date: data.due_date || undefined,
    }

    if (assignment) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{assignment ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
          <DialogDescription>
            {assignment ? "Update the assignment details below." : "Fill in the details to create a new assignment."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input id="title" placeholder="e.g., React Hooks Exercise" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Assignment instructions..."
              {...register("description")}
              rows={4}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input id="due_date" type="date" {...register("due_date")} />
            {errors.due_date && <p className="text-sm text-destructive">{errors.due_date.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : assignment
                  ? "Update Assignment"
                  : "Create Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
