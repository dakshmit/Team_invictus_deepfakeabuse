import { Lock } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Hackathon MVP - Not a law enforcement tool</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your privacy matters. No images are stored.
          </p>
        </div>
      </div>
    </footer>
  )
}
