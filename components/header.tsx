"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Github, LogOut } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react"

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="border-b border-border">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Github className="h-6 w-6" />
          <span className="text-xl font-semibold">GitHub Analyzer</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/dashboards" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : session ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-muted-foreground">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboards">Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => signIn("google")}>
                Log In
              </Button>
              <Button size="sm" onClick={() => signIn("google")}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

