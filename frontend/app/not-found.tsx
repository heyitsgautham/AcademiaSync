import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-background to-muted p-6 text-center">
      <Link href="/" className="mb-4 flex items-center gap-2">
        <GraduationCap className="h-10 w-10 text-primary" aria-hidden="true" />
        <span className="text-2xl font-bold text-foreground">AcademiaSync</span>
      </Link>
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-3xl font-bold text-foreground">Page not found</h1>
      <p className="max-w-md text-muted-foreground">The page you asked for does not exist or has moved.</p>
      <Button asChild className="mt-2">
        <Link href="/">Go to the home page</Link>
      </Button>
    </main>
  )
}
