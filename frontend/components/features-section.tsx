"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    title: "For Students",
    description: "Enroll in courses, submit assignments, and view your analytics to track your progress",
    icon: BookOpen,
    highlights: [
      "Browse and enroll in courses",
      "Submit assignments online",
      "Track your learning progress",
      "View personalized analytics",
    ],
  },
  {
    title: "For Teachers",
    description: "Create and manage courses, assignments, grade submissions, and monitor student performance",
    icon: Users,
    highlights: [
      "Create and manage courses",
      "Design assignments and quizzes",
      "Grade student submissions",
      "View class analytics",
    ],
  },
  {
    title: "For Admins",
    description: "Manage teachers, oversee the platform, and access comprehensive system analytics",
    icon: BarChart3,
    highlights: [
      "Manage teacher accounts",
      "Monitor platform usage",
      "Access system-wide analytics",
      "Configure platform settings",
    ],
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Built for Everyone</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comprehensive tools designed for students, teachers, and administrators
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
