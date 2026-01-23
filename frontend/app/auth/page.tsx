"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthPage() {
  const [showEmailForm, setShowEmailForm] = useState(false)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground">
            Welcome to Digital Dignity
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            A safe space to help you understand and respond to manipulated images.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!showEmailForm ? (
            <>
              <Button
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 bg-transparent"
                size="lg"
                onClick={() => setShowEmailForm(true)}
              >
                <Mail className="h-5 w-5" />
                Continue with Email
              </Button>
            </>
          ) : (
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="bg-input"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                Sign In
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowEmailForm(false)}
              >
                Back to options
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Link
            href="#"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            Your privacy matters. No images are stored.
          </p>
        </CardFooter>
      </Card>

      <Link
        href="/"
        className="mt-6 text-sm text-muted-foreground hover:text-primary"
      >
        Back to home
      </Link>
    </main>
  )
}
