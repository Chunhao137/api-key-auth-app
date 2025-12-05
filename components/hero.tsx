import { Button } from "@/components/ui/button"
import { ArrowRight, Github } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="container mx-auto px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <Github className="h-4 w-4" />
          <span>Deep insights for open source</span>
        </div>

        <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          Analyze GitHub repositories with <span className="text-accent">AI-powered insights</span>
        </h1>

        <p className="mb-10 text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          Get comprehensive summaries, star tracking, cool facts, latest updates, pull request analysis, and version
          monitoring for any open source repository. Make better decisions faster.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="group" asChild>
            <Link href="/dashboards">
              Start Analyzing Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/playground">
              View Demo
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">No credit card required • Free tier available</p>
      </div>
    </section>
  )
}

