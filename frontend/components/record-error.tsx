import Link from "next/link"
import { SearchX, TriangleAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HttpError } from "@/lib/http"

interface RecordErrorProps {
  /** What the page shows, such as "course" */
  noun: string
  error: unknown
  backHref: string
  backLabel: string
}

/**
 * Replaces a detail page's content when its record is missing or could not be loaded.
 * The APIs answer 404 for an unknown id and 400 for one that is not a number, and both mean a bad link.
 */
export function RecordError({ noun, error, backHref, backLabel }: RecordErrorProps) {
  const missing = error instanceof HttpError && (error.status === 404 || error.status === 400)
  const Icon = missing ? SearchX : TriangleAlert

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Icon className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">
          {missing ? `This ${noun} does not exist` : `Could not load this ${noun}`}
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {missing
            ? `It may have been deleted, or the link may be wrong.`
            : `Something went wrong on our side. Try again in a moment.`}
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
