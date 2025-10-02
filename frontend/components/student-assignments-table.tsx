"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AssignmentSubmissionModal } from "./assignment-submission-modal"
import { AssignmentDetailsModal } from "./assignment-details-modal"

interface Assignment {
  id: string
  name: string
  course: string
  dueDate: string
  question?: string
  status: "Pending" | "Submitted" | "Graded"
  submission?: string
  grade?: number
  feedback?: string
  submittedAt?: string
}

interface StudentAssignmentsTableProps {
  assignments: Assignment[]
}

export function StudentAssignmentsTable({ assignments }: StudentAssignmentsTableProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const handleAction = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    if (assignment.status === "Pending") {
      setSubmissionModalOpen(true)
    } else {
      setDetailsModalOpen(true)
    }
  }

  const getActionLabel = (status: string) => {
    switch (status) {
      case "Pending":
        return "Submit"
      case "Submitted":
        return "View Submission"
      case "Graded":
        return "View Grade"
      default:
        return "View"
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.name}</TableCell>
                  <TableCell>{assignment.course}</TableCell>
                  <TableCell>{assignment.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleAction(assignment)}>
                      {getActionLabel(assignment.status)}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedAssignment && (
        <>
          <AssignmentSubmissionModal
            open={submissionModalOpen}
            onOpenChange={setSubmissionModalOpen}
            assignment={selectedAssignment}
          />
          <AssignmentDetailsModal
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            assignment={selectedAssignment}
          />
        </>
      )}
    </>
  )
}
