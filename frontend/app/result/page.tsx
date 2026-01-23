"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, MessageCircle, FileText, Upload, Lock, AlertTriangle, HelpCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type ResultType = "likely" | "possibly" | "inconclusive"

const resultData: Record<ResultType, { label: string; description: string; color: string; icon: React.ReactNode }> = {
  likely: {
    label: "Likely Manipulated",
    description: "Our analysis detected significant signs of digital alteration in this image.",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <AlertTriangle className="h-8 w-8 text-amber-600" />,
  },
  possibly: {
    label: "Possibly Manipulated",
    description: "Some indicators of manipulation were found, but results are not conclusive.",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <HelpCircle className="h-8 w-8 text-blue-600" />,
  },
  inconclusive: {
    label: "Inconclusive",
    description: "We could not determine with certainty whether this image has been altered.",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    icon: <CheckCircle className="h-8 w-8 text-slate-600" />,
  },
}

export default function ResultPage() {
  const [result] = useState<ResultType>("likely")
  const [confidence] = useState(78)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const currentResult = resultData[result]

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Processing results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/upload">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Analysis Results</h1>
          </div>
          
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Lock className="h-3.5 w-3.5" />
            Privacy Protected
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Analysis Complete</CardTitle>
            <CardDescription className="text-base">
              Here&apos;s what we found about the image you uploaded.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Result Badge */}
            <div
              className={cn(
                "flex flex-col items-center gap-4 rounded-2xl border p-6",
                currentResult.color
              )}
            >
              {currentResult.icon}
              <div className="text-center">
                <h2 className="text-xl font-semibold">{currentResult.label}</h2>
                <p className="mt-2 text-sm opacity-90">{currentResult.description}</p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence Level</span>
                <span className="font-medium text-foreground">{confidence}%</span>
              </div>
              <Progress value={confidence} className="h-3" />
            </div>

            {/* Explanation */}
            <div className="rounded-xl bg-muted/50 p-4">
              <h3 className="mb-2 font-medium text-foreground">In simple terms</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This image shows signs of digital alteration. The analysis detected inconsistencies in lighting, pixel patterns, or metadata that are commonly associated with manipulated images. This is not a definitive judgment, but an indicator for further investigation.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full gap-2" size="lg" asChild>
                <Link href="/chat">
                  <MessageCircle className="h-5 w-5" />
                  Talk to Assistant
                </Link>
              </Button>
              <Button variant="outline" className="w-full gap-2 bg-transparent" size="lg" asChild>
                <Link href="/complaint">
                  <FileText className="h-5 w-5" />
                  Generate Complaint Draft
                </Link>
              </Button>
              <Button variant="ghost" className="w-full gap-2" asChild>
                <Link href="/upload">
                  <Upload className="h-5 w-5" />
                  Upload Another Image
                </Link>
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Remember: This analysis is assistive only and not legal evidence.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
