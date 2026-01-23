import Link from "next/link"
import { Shield, Lock, MessageCircle, FileSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background px-4 py-20 md:py-32">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
              <Shield className="h-10 w-10 text-primary" />
            </div>

            <h1 className="mb-6 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              You&apos;re not alone. We&apos;re here to help.
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
              This platform helps you understand and respond to suspected deepfake or altered images in a safe and private way.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
                <Link href="/chat">
                  <MessageCircle className="h-5 w-5" />
                  Talk to Us Safely
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                <Link href="/upload">
                  <FileSearch className="h-5 w-5" />
                  Analyze an Image
                </Link>
              </Button>
            </div>
          </div>

          {/* Privacy Banner */}
          <div className="container mx-auto mt-16 max-w-2xl">
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-accent/20 px-6 py-4 text-accent-foreground">
              <Lock className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm font-medium">
                Anonymous by default. Your data is never stored.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 px-4 py-20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-semibold text-foreground md:text-3xl">
              How we can help
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-foreground">
                    Supportive Conversation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Talk to our AI assistant in a calm, judgment-free environment. We listen first.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <FileSearch className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-foreground">
                    Private Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload images for analysis. They&apos;re processed temporarily and never stored.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-foreground">
                    Guided Support
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get help drafting complaints and understanding your options, at your own pace.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-background px-4 py-20">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              Ready to take the first step?
            </h2>
            <p className="mb-8 text-muted-foreground">
              There&apos;s no pressure and no judgment. We&apos;re here when you need us.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/chat">
                <MessageCircle className="h-5 w-5" />
                Start a Conversation
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
