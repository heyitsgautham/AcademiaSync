"use client"

import { useEffect, useState } from "react"

export function TeacherThemeWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Get the current theme from localStorage or default to light
        const currentTheme = localStorage.getItem("theme") || "light"

        // Add teacher-theme class to document
        document.documentElement.classList.add("teacher-theme")

        // Apply dark class if needed
        if (currentTheme === "dark") {
            document.documentElement.classList.add("dark")
        }

        // Cleanup function to remove teacher-theme when component unmounts
        return () => {
            document.documentElement.classList.remove("teacher-theme")
        }
    }, [])

    if (!mounted) {
        return null
    }

    return <>{children}</>
}
