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

interface CourseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: any
}

const courseSchema = yup.object({
  title: yup.string().required("Course title is required"),
  description: yup.string().required("Description is required"),
  weeks: yup.number().positive("Weeks must be positive").nullable(),
})

type CourseFormData = yup.InferType<typeof courseSchema>

export function TeacherCourseModal({ open, onOpenChange, course }: CourseModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: yupResolver(courseSchema),
  })

  useEffect(() => {
    if (course) {
      reset({
        title: course.title || "",
        description: course.description || "",
        weeks: course.weeks || null,
      })
    } else {
      reset({ title: "", description: "", weeks: null })
    }
  }, [course, reset])

  const createMutation = useMutation({
    mutationFn: courseApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      toast({
        title: "Success",
        description: "Course created successfully",
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: CourseFormData) => courseApi.updateCourse(course.id, {
      title: data.title,
      description: data.description,
      weeks: data.weeks ?? undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      toast({
        title: "Success",
        description: "Course updated successfully",
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: CourseFormData) => {
    const payload = {
      title: data.title,
      description: data.description,
      weeks: data.weeks ?? undefined,
    }

    if (course) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Create New Course"}</DialogTitle>
          <DialogDescription>
            {course ? "Update the course details below." : "Fill in the details to create a new course."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" placeholder="e.g., Introduction to React" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the course..."
              {...register("description")}
              rows={4}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="weeks">Duration (weeks)</Label>
            <Input id="weeks" type="number" placeholder="e.g., 8" {...register("weeks")} />
            {errors.weeks && <p className="text-sm text-destructive">{errors.weeks.message}</p>}
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
                : course
                  ? "Update Course"
                  : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
