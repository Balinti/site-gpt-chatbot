'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface SignupPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  containedCount: number
}

export function SignupPrompt({ open, onOpenChange, containedCount }: SignupPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Your Progress</DialogTitle>
          <DialogDescription>
            You&apos;ve contained {containedCount} ticket(s). Create a free account to save your work and unlock more features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">With a free account, you get:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                'Save tickets and audit logs',
                '50 resolutions per month',
                'Access from any device',
                'Connect real integrations',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth?mode=signup">Create Free Account</Link>
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Continue Without Saving
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
