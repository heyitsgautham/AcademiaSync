"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"

export default function StudentDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [dashboardData, setDashboardData] = useState<any>(null)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (status === "authenticated") {
            // Check if user has correct role
            if (session?.role?.toLowerCase() !== "student") {
                router.push("/login")
                return
            }

            // Fetch dashboard data from backend
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/student/dashboard`, {
                credentials: "include"
            })
                .then(res => res.json())
                .then(data => setDashboardData(data))
                .catch(err => console.error("Error fetching dashboard:", err))
        }
    }, [status, session, router])

    const handleLogout = async () => {
        // Call backend logout
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/auth/logout`, {
            method: "POST",
            credentials: "include"
        })
        // Sign out from NextAuth
        await signOut({ callbackUrl: "/" })
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="h-10 w-10 text-primary" />
                        <h1 className="text-3xl font-bold">Student Dashboard</h1>
                    </div>
                    <Button onClick={handleLogout} variant="outline">
                        Logout
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {session?.user?.name || "Student"}!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{session?.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Role</p>
                                <p className="font-medium">{session?.role || "Student"}</p>
                            </div>
                            {dashboardData && (
                                <div className="mt-6 p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-medium mb-2">Backend Response:</p>
                                    <pre className="text-xs overflow-auto">
                                        {JSON.stringify(dashboardData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Features Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>View enrolled courses</li>
                            <li>Submit assignments</li>
                            <li>Check grades and feedback</li>
                            <li>Update profile</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
