"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useCssVariable } from "@/hooks/use-css-variable"
import { WrappedAxisTick } from "@/components/wrapped-axis-tick"

interface AnalyticsData {
  courseProgress: Array<{ course: string; progress: number }>
  submissionStatus: Array<{ name: string; value: number }>
}

interface StudentDashboardAnalyticsProps {
  analytics?: AnalyticsData
  isLoading: boolean
}

const STATUS_COLORS = ["#34d399", "#fbbf24", "#f87171"]

export function StudentDashboardAnalytics({ analytics, isLoading }: StudentDashboardAnalyticsProps) {
  const mutedForegroundColor = useCssVariable("--muted-foreground", "#9ca3af")

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Safe data extraction with fallbacks
  const courseProgressData = Array.isArray(analytics?.courseProgress)
    ? analytics.courseProgress
    : []

  // Get top 5 courses by progress
  const courseProgress = courseProgressData
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5)

  const submissionStatus = Array.isArray(analytics?.submissionStatus)
    ? analytics.submissionStatus
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Bar Chart - Course Progress */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Course Progress</h3>
          {courseProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={courseProgress} margin={{ bottom: 60, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="course"
                  className="text-xs"
                  tick={<WrappedAxisTick fill={mutedForegroundColor} fontFamily="system-ui, -apple-system, sans-serif" />}
                  interval={0}
                  height={70}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: mutedForegroundColor }}
                  allowDecimals={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="progress" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No course progress data available
            </div>
          )}
        </div>

        {/* Pie Chart - Submission Status */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Submission Status</h3>
          {submissionStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={submissionStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const RADIAN = Math.PI / 180;
                    // Increase radius for label placement
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={mutedForegroundColor}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-sm font-medium"
                      >
                        {`${submissionStatus[index].name}: ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  outerRadius={65}
                  dataKey="value"
                >
                  {submissionStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No submission status data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
