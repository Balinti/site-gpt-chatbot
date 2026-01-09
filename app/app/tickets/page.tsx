'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { TicketInput, ResolverResult } from '@/lib/types'
import { Inbox, ArrowRight } from 'lucide-react'

interface StoredTicket {
  id: string
  input: TicketInput
  result?: ResolverResult
  status: 'pending' | 'resolved' | 'contained'
  createdAt: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-blue-100 text-blue-800',
  contained: 'bg-green-100 text-green-800',
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<StoredTicket[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TICKETS)
    if (stored) {
      try {
        setTickets(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse tickets:', e)
      }
    }
  }, [])

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">No tickets yet</h2>
          <p className="text-muted-foreground text-center mb-4">
            Resolve your first ticket to see it here
          </p>
          <Button asChild>
            <Link href="/app">
              Go to Resolver
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">View your resolved tickets history</p>
        </div>
        <Button asChild>
          <Link href="/app">New Resolution</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Link key={ticket.id} href={`/app/tickets/${ticket.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{ticket.input.subject}</CardTitle>
                    <CardDescription>
                      {ticket.input.customerEmail}
                      {ticket.input.orderNumber && ` - ${ticket.input.orderNumber}`}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[ticket.status]}>
                    {ticket.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </span>
                  {ticket.result && (
                    <Badge variant="outline">
                      {ticket.result.intent.type}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
