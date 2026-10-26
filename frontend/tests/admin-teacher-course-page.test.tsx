import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const push = vi.fn()
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "11", courseId: "3" }),
  useRouter: () => ({ push }),
  usePathname: () => "/admin/teachers/11/courses/3/students",
}))
vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }), signOut: vi.fn() }))
vi.mock("@/components/admin-dashboard-sidebar", () => ({ AdminDashboardSidebar: () => null }))
vi.mock("@/components/admin-dashboard-topbar", () => ({ AdminDashboardTopbar: () => null }))

import TeacherCourseStudentsPage from "@/app/admin/teachers/[id]/courses/[courseId]/students/page"

describe("/admin/teachers/[id]/courses/[courseId]/students", () => {
  it("loads the course and links back to the teacher from the [id] segment", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ courseId: 3, courseTitle: "Optics", courseDescription: "", teacherName: "Tia", teacherId: 11, students: [] }), {
        status: 200,
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    render(
      <QueryClientProvider client={new QueryClient()}>
        <TeacherCourseStudentsPage />
      </QueryClientProvider>,
    )

    expect(await screen.findByText("Optics")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/teachers/11/courses/3/students")

    await userEvent.click(screen.getByRole("button", { name: /Back to Teacher/ }))
    expect(push).toHaveBeenCalledWith("/admin/teachers/11")
    vi.unstubAllGlobals()
  })
})
