"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check } from "lucide-react"

interface StudentProfile {
    id: number
    email: string
    first_name: string
    last_name: string
    age: number | null
    role: string
}

export function StudentSettingsSections() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const [profileData, setProfileData] = useState({
        first_name: "",
        last_name: "",
        age: "",
    })

    const [originalData, setOriginalData] = useState({
        first_name: "",
        last_name: "",
        age: "",
    })

    const [hasChanges, setHasChanges] = useState(false)

    // Fetch student profile
    const { data: profile, isLoading } = useQuery<StudentProfile>({
        queryKey: ["student-profile"],
        queryFn: async () => {
            const res = await fetch("/api/student/profile")
            if (!res.ok) {
                throw new Error("Failed to fetch profile")
            }
            return res.json()
        },
    })

    // Update form when profile data loads
    useEffect(() => {
        if (profile) {
            const data = {
                first_name: profile.first_name || "",
                last_name: profile.last_name || "",
                age: profile.age?.toString() || "",
            }
            setProfileData(data)
            setOriginalData(data)
            setHasChanges(false)
        }
    }, [profile])

    // Check for changes whenever profileData changes
    useEffect(() => {
        const changed =
            profileData.first_name !== originalData.first_name ||
            profileData.last_name !== originalData.last_name ||
            profileData.age !== originalData.age
        setHasChanges(changed)
    }, [profileData, originalData])

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data: typeof profileData) => {
            const res = await fetch("/api/student/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: data.first_name,
                    last_name: data.last_name,
                    age: data.age ? parseInt(data.age) : null,
                }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || "Failed to update profile")
            }

            return res.json()
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["student-profile"] })
            queryClient.invalidateQueries({ queryKey: ["student-dashboard"] })
            // Update original data to reflect saved state
            const savedData = {
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                age: data.age?.toString() || "",
            }
            setOriginalData(savedData)
            setHasChanges(false)
            toast({
                title: "Success",
                description: "Profile updated successfully. Refreshing...",
            })
            // Reload the page to update session with new name
            setTimeout(() => {
                window.location.reload()
            }, 1000)
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        },
    })

    const handleProfileSave = () => {
        // Validation
        if (!profileData.first_name.trim()) {
            toast({
                title: "Validation Error",
                description: "First name is required",
                variant: "destructive",
            })
            return
        }

        if (profileData.age && (parseInt(profileData.age) < 10 || parseInt(profileData.age) > 100)) {
            toast({
                title: "Validation Error",
                description: "Age must be between 10 and 100",
                variant: "destructive",
            })
            return
        }

        updateProfileMutation.mutate(profileData)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Unable to load profile data</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                                id="first_name"
                                value={profileData.first_name}
                                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                placeholder="Enter first name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                value={profileData.last_name}
                                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                placeholder="Enter last name (optional)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Email cannot be changed (linked to Google account)</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input
                                id="age"
                                type="number"
                                min="10"
                                max="100"
                                value={profileData.age}
                                onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                                placeholder="Enter age"
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <Button
                            onClick={handleProfileSave}
                            disabled={updateProfileMutation.isPending || !hasChanges}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {updateProfileMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : !hasChanges ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Saved
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
