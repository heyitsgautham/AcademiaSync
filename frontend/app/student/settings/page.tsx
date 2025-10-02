"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bell, Lock } from "lucide-react"

interface SettingsData {
  student: {
    name: string
    email: string
    phone: string
    bio: string
  }
  notifications: {
    emailNotifications: boolean
    assignmentReminders: boolean
    gradeNotifications: boolean
    courseUpdates: boolean
  }
}

export default function StudentSettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<SettingsData>({
    queryKey: ["student-settings"],
    queryFn: async () => {
      const res = await fetch("/api/student/settings")
      return res.json()
    },
  })

  const [profileData, setProfileData] = useState({
    name: data?.student.name || "",
    email: data?.student.email || "",
    phone: data?.student.phone || "",
    bio: data?.student.bio || "",
  })

  const [notifications, setNotifications] = useState(data?.notifications || {})

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const res = await fetch("/api/student/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-settings"] })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    },
  })

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: typeof notifications) => {
      const res = await fetch("/api/student/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-settings"] })
      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been saved.",
      })
    },
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information and profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg" alt={data.student.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {data.student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Avatar</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
            />
          </div>

          <Button onClick={() => updateProfileMutation.mutate(profileData)} disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Assignment Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminders for upcoming assignments</p>
            </div>
            <Switch
              checked={notifications.assignmentReminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, assignmentReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Grade Notifications</Label>
              <p className="text-sm text-muted-foreground">Be notified when assignments are graded</p>
            </div>
            <Switch
              checked={notifications.gradeNotifications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, gradeNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Course Updates</Label>
              <p className="text-sm text-muted-foreground">Receive updates about your courses</p>
            </div>
            <Switch
              checked={notifications.courseUpdates}
              onCheckedChange={(checked) => setNotifications({ ...notifications, courseUpdates: checked })}
            />
          </div>

          <Button
            onClick={() => updateNotificationsMutation.mutate(notifications)}
            disabled={updateNotificationsMutation.isPending}
          >
            {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>Change Password</Button>
        </CardContent>
      </Card>
    </div>
  )
}
