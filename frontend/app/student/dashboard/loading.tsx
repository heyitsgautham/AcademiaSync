import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="student-theme flex min-h-screen">
      <div className="fixed left-0 top-0 h-screen w-64 border-r">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex-1 md:ml-64">
        <div className="h-16 border-b">
          <Skeleton className="h-full w-full" />
        </div>
        <main className="p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
