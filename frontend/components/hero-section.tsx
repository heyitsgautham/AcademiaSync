"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function HeroSection() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features")
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
            AcademiaSync
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty">
            Empowering Students, Teachers, and Admins with innovative tools for modern education
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" onClick={scrollToFeatures} className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 sm:mt-24"
        >
          <div className="relative rounded-xl bg-card shadow-2xl ring-1 ring-border overflow-hidden">
            <img src="/modern-classroom-with-students-and-teachers-using-.png" alt="AcademiaSync Dashboard" className="w-full h-auto" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
