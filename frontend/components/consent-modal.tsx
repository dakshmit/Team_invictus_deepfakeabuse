"use client"

import { useState } from "react"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ConsentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConsent: () => void
}

export function ConsentModal({ open, onOpenChange, onConsent }: ConsentModalProps) {
  const [checked, setChecked] = useState(false)

  const handleContinue = () => {
    if (checked) {
      onConsent()
      onOpenChange(false)
      setChecked(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Before we continue
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            To analyze an image, we need your permission. Your image is processed temporarily and never stored.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
          <Checkbox
            id="consent"
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
            className="mt-0.5"
          />
          <label
            htmlFor="consent"
            className="cursor-pointer text-sm leading-relaxed text-foreground"
          >
            I understand and consent
          </label>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleContinue}
            disabled={!checked}
            className="w-full"
            size="lg"
          >
            Continue safely
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Go back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
