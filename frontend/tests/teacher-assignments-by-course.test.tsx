import { describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
const deleteAssignment = vi.fn().mockResolvedValue({})
vi.mock("@/lib/api-client", () => ({ courseApi: { deleteAssignment: (id: number) => deleteAssignment(id) } }))

import { TeacherAssignmentsByCourse } from "@/components/teacher-assignments-by-course"
import type { AssignmentWithStatus } from "@/types/api"

const assignment = (id: number, title: string): AssignmentWithStatus => ({
  id,
  course_id: 1,
  title,
  description: "Read chapter 1",
  due_date: "2026-11-01T10:00:00Z",
  created_at: "2026-10-01T10:00:00Z",
  updated_at: "2026-10-01T10:00:00Z",
  course_name: "Algebra",
  total_students: 10,
  total_submissions: 4,
  graded_submissions: 3,
  late_submissions: 0,
  average_grade: 82,
  not_submitted: 6,
  submitted_not_graded: 1,
  has_submissions: true,
  has_graded: true,
  has_not_submitted: true,
  has_late: false,
  is_overdue: false,
})

const renderList = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const invalidate = vi.spyOn(queryClient, "invalidateQueries")
  render(
    <QueryClientProvider client={queryClient}>
      <TeacherAssignmentsByCourse
        assignmentsByCourse={[{ courseId: 1, courseName: "Algebra", assignments: [assignment(5, "Quiz 1"), assignment(6, "Essay")] }]}
        searchQuery=""
        onEdit={vi.fn()}
      />
    </QueryClientProvider>,
  )
  return { invalidate }
}

describe("TeacherAssignmentsByCourse", () => {
  it("filters assignments by the search query", () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <TeacherAssignmentsByCourse
          assignmentsByCourse={[{ courseId: 1, courseName: "Algebra", assignments: [assignment(5, "Quiz 1"), assignment(6, "Essay")] }]}
          searchQuery="quiz"
          onEdit={vi.fn()}
        />
      </QueryClientProvider>,
    )
    expect(screen.getByText("Quiz 1")).toBeInTheDocument()
    expect(screen.queryByText("Essay")).not.toBeInTheDocument()
  })

  it("refreshes the assignments page list after a delete", async () => {
    const { invalidate } = renderList()

    await userEvent.click(screen.getAllByRole("button", { name: "Delete assignment" })[0])
    await userEvent.click(screen.getByRole("button", { name: "Delete" }))

    await waitFor(() => expect(deleteAssignment).toHaveBeenCalledWith(5))
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["assignments-with-status"] }))
  })
})
