"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentAnalyticsCharts } from "@/components/student-analytics-charts"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function StudentAnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState("weekly")

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["student-analytics", timeFilter],
    queryFn: async () => {
      const res = await fetch(`/api/student/analytics?filter=${timeFilter}`)
      return res.json()
    },
  })

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your academic performance and progress</p>
        </div>

        {/* Time Filter Tabs */}
        <Tabs value={timeFilter} onValueChange={setTimeFilter} className="w-full">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="biweekly">Bi-Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value={timeFilter} className="mt-6">
            <StudentAnalyticsCharts data={analyticsData} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
