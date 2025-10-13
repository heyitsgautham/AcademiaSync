"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsData {
    userRoleDistribution: Array<{ name: string; value: number }>
    enrollmentTrend: Array<{ period: string; enrollments: number }>
}

interface AnalyticsSectionProps {
    analytics?: AnalyticsData
    isLoading: boolean
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"]

export function AdminAnalyticsSection({ analytics, isLoading }: AnalyticsSectionProps) {
    const [mutedForegroundColor, setMutedForegroundColor] = useState("#9ca3af")

    useEffect(() => {
        // Get computed color from CSS variable for muted-foreground
        const updateColor = () => {
            const color = getComputedStyle(document.documentElement)
                .getPropertyValue('--muted-foreground')
                .trim()

            if (color) {
                // Color is already in hex format (#9ca3af), use it directly
                setMutedForegroundColor(color)
            }
        }

        // Update color initially
        updateColor()

        // Listen for theme changes (when user toggles theme)
        const observer = new MutationObserver(updateColor)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme', 'style']
        })

        return () => observer.disconnect()
    }, [])

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
    const userRoleDistribution = Array.isArray(analytics?.userRoleDistribution)
        ? analytics.userRoleDistribution
        : []

    const enrollmentTrend = Array.isArray(analytics?.enrollmentTrend)
        ? analytics.enrollmentTrend
        : []

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Pie Chart - User Role Distribution */}
                <div>
                    <h3 className="text-base font-semibold text-foreground mb-4">User Role Distribution</h3>
                    {userRoleDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={userRoleDistribution}
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
                                                {`${userRoleDistribution[index].name}: ${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                    outerRadius={55}
                                    dataKey="value"
                                >
                                    {userRoleDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                        <div className="flex items-center justify-center h-[220px] text-muted-foreground">
                            No role data available
                        </div>
                    )}
                </div>

                {/* Bar Chart - Enrollment Trend */}
                <div>
                    <h3 className="text-base font-semibold text-foreground mb-4">Recent Enrollment Trend</h3>
                    {enrollmentTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={enrollmentTrend} margin={{ bottom: 40, left: 10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="period"
                                    className="text-xs"
                                    tick={{ fill: mutedForegroundColor }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{ fill: mutedForegroundColor }}
                                    allowDecimals={false}
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
                                <Bar dataKey="enrollments" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[240px] text-muted-foreground">
                            No enrollment data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
