'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AuditLog } from '@/components/resolver/audit-log'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { TicketInput, ResolverResult, AuditEvent } from '@/lib/types'
import { ArrowLeft, Package, Truck, FileText } from 'lucide-react'

interface StoredTicket {
  id: string
  input: TicketInput
  result?: ResolverResult
  status: 'pending' | 'resolved' | 'contained'
  createdAt: string
}

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<StoredTicket | null>(null)
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])

  useEffect(() => {
    // Load ticket
    const storedTickets = localStorage.getItem(LOCAL_STORAGE_KEYS.TICKETS)
    if (storedTickets) {
      const tickets: StoredTicket[] = JSON.parse(storedTickets)
      const found = tickets.find(t => t.id === ticketId)
      setTicket(found || null)
    }

    // Load audit events for this ticket
    const storedAudit = localStorage.getItem(LOCAL_STORAGE_KEYS.AUDIT_LOG)
    if (storedAudit) {
      const events: AuditEvent[] = JSON.parse(storedAudit)
      setAuditEvents(events.filter(e => e.ticketId === ticketId))
    }
  }, [ticketId])

  if (!ticket) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <h2 className="text-lg font-semibold mb-2">Ticket not found</h2>
          <Button asChild variant="outline">
            <Link href="/app/tickets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tickets
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const result = ticket.result

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/app/tickets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-xl font-bold">{ticket.input.subject}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(ticket.createdAt)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Original Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Original Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Customer</div>
              <div>{ticket.input.customerName || 'Unknown'}</div>
              <div className="text-sm">{ticket.input.customerEmail}</div>
            </div>

            {ticket.input.orderNumber && (
              <div>
                <div className="text-sm text-muted-foreground">Order Number</div>
                <div>{ticket.input.orderNumber}</div>
              </div>
            )}

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground mb-2">Message</div>
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                {ticket.input.body}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resolution */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Resolution</CardTitle>
                <Badge>{result.intent.type}</Badge>
              </div>
              <CardDescription>
                {Math.round(result.intent.confidence * 100)}% confidence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data Sources */}
              {result.dataSources.order && (
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{result.dataSources.order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      Status: {result.dataSources.order.status}
                    </div>
                  </div>
                </div>
              )}

              {result.dataSources.tracking && (
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{result.dataSources.tracking.carrier}</div>
                    <div className="text-sm text-muted-foreground">
                      {result.dataSources.tracking.trackingNumber}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Generated Reply */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Generated Reply</span>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="font-medium mb-2">{result.reply.subject}</div>
                  <div className="text-sm whitespace-pre-wrap">
                    {result.reply.body}
                  </div>
                </div>
              </div>

              {/* Citations */}
              {result.citations.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Citations ({result.citations.length})</div>
                  <div className="space-y-1">
                    {result.citations.map((citation) => (
                      <div key={citation.id} className="text-sm p-2 bg-muted rounded">
                        <Badge variant="outline" className="mr-2">{citation.source.type}</Badge>
                        {citation.claim}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Audit Log */}
      <AuditLog events={auditEvents} maxHeight="400px" />
    </div>
  )
}
