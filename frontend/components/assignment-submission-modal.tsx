"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"

interface Assignment {
  id: string
  name: string
  course: string
  dueDate: string
  question?: string
}

interface AssignmentSubmissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment
}

export function AssignmentSubmissionModal({ open, onOpenChange, assignment }: AssignmentSubmissionModalProps) {
  const [submission, setSubmission] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/student/submit-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          submission,
          fileName: file?.name,
        }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] })
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] })
      toast({
        title: "Assignment submitted",
        description: "Your assignment has been submitted successfully.",
      })
      onOpenChange(false)
      setSubmission("")
      setFile(null)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
          <DialogDescription>
            {assignment.name} - Due: {assignment.dueDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submission">Your Submission</Label>
            <Textarea
              id="submission"
              placeholder="Enter your assignment submission here..."
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              rows={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Attach File (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="flex-1" />
              {file && (
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                  Remove
                </Button>
              )}
            </div>
            {file && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {file.name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => submitMutation.mutate()} disabled={!submission.trim() || submitMutation.isPending}>
            {submitMutation.isPending ? "Submitting..." : "Submit Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
