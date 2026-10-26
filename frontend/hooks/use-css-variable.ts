import { useEffect, useState } from "react"

/**
 * Reads a CSS custom property from <html> and follows it when the theme changes.
 * Recharts needs real colours for SVG text, so the charts cannot use var(--...) directly.
 */
export function useCssVariable(name: string, fallback: string): string {
  const [value, setValue] = useState(fallback)

  useEffect(() => {
    const update = () => {
      const current = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      if (current) setValue(current)
    }

    update()

    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    })
    return () => observer.disconnect()
  }, [name])

  return value
}
