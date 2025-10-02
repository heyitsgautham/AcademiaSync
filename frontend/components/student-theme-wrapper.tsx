"use client"

import type React from "react"

import { useEffect } from "react"

export function StudentThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("student-theme")

    return () => {
      document.documentElement.classList.remove("student-theme")
    }
  }, [])

  return <>{children}</>
}
