'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/utils'
import type { AuditEvent } from '@/lib/types'

interface AuditLogProps {
  events: AuditEvent[]
  maxHeight?: string
}

const eventTypeLabels: Record<string, { label: string; color: string }> = {
  ticket_created: { label: 'Ticket Created', color: 'bg-blue-100 text-blue-800' },
  resolution_generated: { label: 'Resolution Generated', color: 'bg-green-100 text-green-800' },
  draft_copied: { label: 'Draft Copied', color: 'bg-purple-100 text-purple-800' },
  marked_contained: { label: 'Marked Contained', color: 'bg-orange-100 text-orange-800' },
  policy_changed: { label: 'Policy Changed', color: 'bg-yellow-100 text-yellow-800' },
}

export function AuditLog({ events, maxHeight = '400px' }: AuditLogProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Log</CardTitle>
          <CardDescription>No activity recorded yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Audit Log</CardTitle>
        <CardDescription>Append-only record of all actions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-4">
            {events.map((event) => {
              const typeInfo = eventTypeLabels[event.eventType] || {
                label: event.eventType,
                color: 'bg-gray-100 text-gray-800'
              }

              return (
                <div key={event.id} className="border-l-2 border-muted pl-4 pb-4 relative">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-background border-2 border-muted" />

                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(event.createdAt)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {event.actorType === 'system' ? 'System' : 'User'}
                    </span>
                    {event.ticketId && (
                      <span className="text-muted-foreground"> on ticket {event.ticketId.slice(0, 8)}...</span>
                    )}
                  </div>

                  {event.citations && event.citations.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Citations: </span>
                      {event.citations.length} source(s)
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
