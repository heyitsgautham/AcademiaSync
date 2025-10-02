"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState } from "react"

interface AnalyticsData {
  student: {
    name: string
    email: string
  }
  weekly: {
    gradesData: Array<{ week: string; grade: number }>
    assignmentCompletion: Array<{ week: string; completed: number; total: number }>
    courseProgress: Array<{ course: string; progress: number; color: string }>
    gradeDistribution: Array<{ grade: string; count: number; color: string }>
  }
  monthly: {
    gradesData: Array<{ month: string; grade: number }>
    assignmentCompletion: Array<{ month: string; completed: number; total: number }>
    courseProgress: Array<{ course: string; progress: number; color: string }>
    gradeDistribution: Array<{ grade: string; count: number; color: string }>
  }
  semester: {
    gradesData: Array<{ period: string; grade: number }>
    assignmentCompletion: Array<{ period: string; completed: number; total: number }>
    courseProgress: Array<{ course: string; progress: number; color: string }>
    gradeDistribution: Array<{ grade: string; count: number; color: string }>
  }
}

export default function StudentAnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState<"weekly" | "monthly" | "semester">("weekly")

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["student-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/student/analytics")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const currentData = data[timeFilter]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your academic performance and progress</p>
      </div>

      {/* Time Filter Tabs */}
      <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as typeof timeFilter)}>
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="semester">Semester</TabsTrigger>
        </TabsList>

        <TabsContent value={timeFilter} className="mt-6 space-y-6">
          {/* Charts Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Grades Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Grades Trend</CardTitle>
                <CardDescription>Your performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    grade: {
                      label: "Grade",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentData.gradesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey={timeFilter === "weekly" ? "week" : timeFilter === "monthly" ? "month" : "period"}
                      />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="grade"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Assignment Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Completion Rate</CardTitle>
                <CardDescription>Completed vs total assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    completed: {
                      label: "Completed",
                      color: "hsl(var(--chart-3))",
                    },
                    total: {
                      label: "Total",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData.assignmentCompletion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey={timeFilter === "weekly" ? "week" : timeFilter === "monthly" ? "month" : "period"}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="completed" fill="#10b981" />
                      <Bar dataKey="total" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Course Progress Distribution</CardTitle>
                <CardDescription>Completion status across courses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentData.courseProgress}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ course, progress }) => `${course}: ${progress}%`}
                      outerRadius={80}
                      dataKey="progress"
                    >
                      {currentData.courseProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Breakdown of your grades</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentData.gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ grade, count }) => `${grade}: ${count}`}
                      outerRadius={80}
                      dataKey="count"
                    >
                      {currentData.gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
