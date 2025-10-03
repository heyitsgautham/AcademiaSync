"use client"

import { StudentSettingsSections } from "@/components/student-settings-sections"

export default function StudentSettingsPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <StudentSettingsSections />
      </div>
    </div>
  )
}
