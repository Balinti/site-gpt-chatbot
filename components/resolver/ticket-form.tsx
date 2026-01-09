'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SAMPLE_TICKETS } from '@/lib/demo-data'

const ticketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Message is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerName: z.string().optional(),
  orderNumber: z.string().optional(),
})

type TicketFormData = z.infer<typeof ticketSchema>

interface TicketFormProps {
  onSubmit: (data: TicketFormData) => void
  isLoading: boolean
}

export function TicketForm({ onSubmit, isLoading }: TicketFormProps) {
  const [showSamples, setShowSamples] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  })

  const loadSampleTicket = (index: number) => {
    const sample = SAMPLE_TICKETS[index]
    setValue('subject', sample.subject)
    setValue('body', sample.body)
    setValue('customerEmail', sample.customerEmail)
    setValue('customerName', sample.customerName)
    setValue('orderNumber', sample.orderNumber || '')
    setShowSamples(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Ticket</CardTitle>
        <CardDescription>
          Paste a customer ticket or select a sample to see the resolver in action
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSamples(!showSamples)}
          >
            {showSamples ? 'Hide Samples' : 'Load Sample Ticket'}
          </Button>

          {showSamples && (
            <div className="mt-2 grid gap-2">
              {SAMPLE_TICKETS.map((ticket, index) => (
                <Button
                  key={ticket.id}
                  type="button"
                  variant="ghost"
                  className="justify-start h-auto py-2 px-3 text-left"
                  onClick={() => loadSampleTicket(index)}
                >
                  <div>
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {ticket.customerEmail}
                      {ticket.orderNumber && ` - ${ticket.orderNumber}`}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="customer@example.com"
                {...register('customerEmail')}
              />
              {errors.customerEmail && (
                <p className="text-sm text-destructive">{errors.customerEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="John Doe"
                {...register('customerName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order Number (optional)</Label>
            <Input
              id="orderNumber"
              placeholder="ORD-2024-1001"
              {...register('orderNumber')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Where is my order?"
              {...register('subject')}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              placeholder="Paste the customer's message here..."
              className="min-h-[120px]"
              {...register('body')}
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Verified Reply'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
