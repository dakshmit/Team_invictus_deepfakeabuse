"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Copy, Check, Lock, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const initialDraft = `To Whom It May Concern,

I am writing to report a suspected case of image manipulation that may constitute a violation of my dignity and privacy.

On [DATE], I became aware of an image that appears to have been digitally altered to misrepresent my likeness. This manipulation was created and/or distributed without my knowledge or consent.

I am requesting that you:

1. Investigate the origin and distribution of this manipulated content
2. Remove any instances of this content from your platform
3. Take appropriate action to prevent further distribution

I am prepared to provide additional information as needed to support this matter.

Thank you for your attention to this serious issue.

Respectfully,
[YOUR NAME]
[CONTACT INFORMATION - Optional]`

export default function ComplaintPage() {
  const [content, setContent] = useState(initialDraft)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "complaint-draft.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/result">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Complaint Draft</h1>
          </div>
          
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Lock className="h-3.5 w-3.5" />
            Privacy Protected
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-start justify-center px-4 py-8 md:py-12">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Your Draft Complaint</CardTitle>
            <CardDescription className="text-base">
              This is an assistive draft only. You are not submitting anything yet.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Notice */}
            <div className="rounded-xl bg-primary/5 p-4 text-sm text-muted-foreground">
              <p>
                This draft is a starting point to help you communicate about your situation. 
                Feel free to edit it to better reflect your experience. Remember to replace the 
                bracketed placeholders with your specific information.
              </p>
            </div>

            {/* Text Editor */}
            <div className="space-y-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] resize-none bg-muted/30 font-mono text-sm leading-relaxed"
                placeholder="Your complaint draft..."
              />
              <p className="text-xs text-muted-foreground">
                You can edit the text above to personalize your complaint.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleDownload} className="flex-1 gap-2" size="lg">
                <Download className="h-5 w-5" />
                Download as Text
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 gap-2 bg-transparent"
                size="lg"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copy Text
                  </>
                )}
              </Button>
            </div>

            <Button variant="ghost" className="w-full gap-2" asChild>
              <Link href="/">
                <Home className="h-5 w-5" />
                Back to Home
              </Link>
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              This tool provides assistive drafting only. We encourage you to seek professional legal advice 
              if you plan to pursue formal action.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
