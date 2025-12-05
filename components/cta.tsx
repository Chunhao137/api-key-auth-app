import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="border-t border-border bg-card/30 py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Ready to analyze your first repository?
          </h2>
          <p className="mb-8 text-pretty text-lg leading-relaxed text-muted-foreground">
            Join thousands of developers who trust GitHub Analyzer for their open source insights.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group" asChild>
              <Link href="/dashboards">
                Start Free Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/playground">
                Schedule Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

