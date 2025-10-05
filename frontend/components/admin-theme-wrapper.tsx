"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function AdminThemeWrapper({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const htmlElement = document.documentElement

        // Remove any existing theme classes
        htmlElement.classList.remove("student-theme", "admin-theme")

        // Add admin theme class
        htmlElement.classList.add("admin-theme")

        // Cleanup function to remove admin theme when component unmounts
        return () => {
            htmlElement.classList.remove("admin-theme")
        }
    }, [mounted, theme])

    if (!mounted) {
        return <>{children}</>
    }

    return <>{children}</>
}
