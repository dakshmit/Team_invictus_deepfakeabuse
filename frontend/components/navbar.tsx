"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Digital Dignity</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Home
          </Link>
          <Link
            href="/chat"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/chat") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Talk to Us
          </Link>
          <Link
            href="/upload"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/upload") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Analyze Image
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  )
}
