import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, GitPullRequest, Star, Sparkles, TrendingUp, Package } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Summaries",
    description: "Get instant, comprehensive summaries of any repository with key insights and context.",
  },
  {
    icon: Star,
    title: "Star Tracking",
    description: "Monitor repository popularity with historical star data and trending analysis.",
  },
  {
    icon: TrendingUp,
    title: "Cool Facts & Stats",
    description: "Discover interesting patterns, contributor insights, and unique repository characteristics.",
  },
  {
    icon: BarChart3,
    title: "Latest Information",
    description: "Stay updated with real-time activity, recent commits, and repository health metrics.",
  },
  {
    icon: GitPullRequest,
    title: "PR Analysis",
    description: "Deep dive into pull request patterns, merge times, and contributor collaboration.",
  },
  {
    icon: Package,
    title: "Version Updates",
    description: "Track releases, semantic versioning, and dependency updates automatically.",
  },
]

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-card/30 py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to understand repositories
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Powerful features to help developers make informed decisions about open source projects.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-colors hover:border-accent/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
