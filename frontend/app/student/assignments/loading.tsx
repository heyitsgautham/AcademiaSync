import { Skeleton } from "@/components/ui/skeleton"
import { StudentDashboardSidebar } from "@/components/student-dashboard-sidebar"

export default function Loading() {
  return (
    <div className="student-theme flex min-h-screen">
      <StudentDashboardSidebar />
      <div className="flex-1 md:ml-64">
        <div className="h-16 border-b">
          <Skeleton className="h-full w-full" />
        </div>
        <main className="p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </main>
      </div>
    </div>
  )
}
