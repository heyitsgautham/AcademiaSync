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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
