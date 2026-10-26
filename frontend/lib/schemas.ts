import { z } from "zod"

/**
 * Request bodies the /api route handlers check before calling a backend.
 * The backends validate again; these give the browser the same messages it always got.
 */

const optionalAge = (min: number) =>
  z
    .number({ error: `Age must be between ${min} and 100` })
    .min(min, `Age must be between ${min} and 100`)
    .max(100, `Age must be between ${min} and 100`)
    .nullable()
    .optional()

const firstName = z.string({ error: "First name is required" }).min(1, "First name is required")

export const studentProfileUpdate = z.object({
  first_name: firstName,
  last_name: z.string().nullable().optional(),
  age: optionalAge(10),
})

export const teacherProfileUpdate = z.object({
  first_name: firstName,
  last_name: z.string().nullable().optional(),
  age: optionalAge(18),
  specialization: z.string().nullable().optional(),
})

/** The first issue's message, which is what the old hand-written checks returned. */
export const firstIssue = (error: z.ZodError): string => error.issues[0]?.message ?? "Invalid request"
