'use client'

import { useState, useEffect } from 'react'
import { TicketForm } from '@/components/resolver/ticket-form'
import { ResultPanel } from '@/components/resolver/result-panel'
import { AuditLog } from '@/components/resolver/audit-log'
import { SignupPrompt } from '@/components/resolver/signup-prompt'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'
import { generateId } from '@/lib/utils'
import type { ResolverResult, AuditEvent, TicketInput } from '@/lib/types'

interface StoredTicket {
  id: string
  input: TicketInput
  result?: ResolverResult
  status: 'pending' | 'resolved' | 'contained'
  createdAt: string
}

export default function ResolverPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ResolverResult | null>(null)
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([])
  const [containedCount, setContainedCount] = useState(0)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [currentTicket, setCurrentTicket] = useState<StoredTicket | null>(null)

  // Load audit log from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUDIT_LOG)
    if (stored) {
      try {
        setAuditLog(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse audit log:', e)
      }
    }

    const count = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTAINED_COUNT)
    if (count) {
      setContainedCount(parseInt(count, 10))
    }
  }, [])

  // Save audit log to localStorage
  const saveAuditEvent = (event: AuditEvent) => {
    const updated = [event, ...auditLog]
    setAuditLog(updated)
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUDIT_LOG, JSON.stringify(updated))

    // Also send to API (will store in DB if authenticated)
    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(console.error)
  }

  const handleSubmit = async (data: TicketInput) => {
    setIsLoading(true)
    setResult(null)

    const ticketId = generateId()

    try {
      const res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('Resolution failed')
      }

      const resolverResult: ResolverResult = await res.json()
      setResult(resolverResult)

      // Create ticket record
      const ticket: StoredTicket = {
        id: ticketId,
        input: data,
        result: resolverResult,
        status: 'resolved',
        createdAt: new Date().toISOString(),
      }
      setCurrentTicket(ticket)

      // Save to localStorage
      const storedTickets = localStorage.getItem(LOCAL_STORAGE_KEYS.TICKETS)
      const tickets: StoredTicket[] = storedTickets ? JSON.parse(storedTickets) : []
      tickets.unshift(ticket)
      localStorage.setItem(LOCAL_STORAGE_KEYS.TICKETS, JSON.stringify(tickets))

      // Log audit events
      saveAuditEvent({
        id: generateId(),
        ticketId,
        actorType: 'system',
        eventType: 'ticket_created',
        input: { subject: data.subject, customerEmail: data.customerEmail },
        output: {},
        citations: [],
        createdAt: new Date().toISOString(),
      })

      saveAuditEvent({
        id: generateId(),
        ticketId,
        actorType: 'system',
        eventType: 'resolution_generated',
        input: { intent: resolverResult.intent.type },
        output: {
          confidence: resolverResult.intent.confidence,
          citationCount: resolverResult.citations.length,
        },
        citations: resolverResult.citations,
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Resolution error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyDraft = () => {
    if (!result || !currentTicket) return

    saveAuditEvent({
      id: generateId(),
      ticketId: currentTicket.id,
      actorType: 'user',
      eventType: 'draft_copied',
      input: {},
      output: { subject: result.reply.subject },
      citations: [],
      createdAt: new Date().toISOString(),
    })
  }

  const handleMarkContained = () => {
    if (!result || !currentTicket) return

    const newCount = containedCount + 1
    setContainedCount(newCount)
    localStorage.setItem(LOCAL_STORAGE_KEYS.CONTAINED_COUNT, String(newCount))

    // Update ticket status
    const storedTickets = localStorage.getItem(LOCAL_STORAGE_KEYS.TICKETS)
    if (storedTickets) {
      const tickets: StoredTicket[] = JSON.parse(storedTickets)
      const updated = tickets.map(t =>
        t.id === currentTicket.id ? { ...t, status: 'contained' as const } : t
      )
      localStorage.setItem(LOCAL_STORAGE_KEYS.TICKETS, JSON.stringify(updated))
    }

    saveAuditEvent({
      id: generateId(),
      ticketId: currentTicket.id,
      actorType: 'user',
      eventType: 'marked_contained',
      input: {},
      output: { totalContained: newCount },
      citations: [],
      createdAt: new Date().toISOString(),
    })

    // Show signup prompt after 1-2 contained actions
    if (newCount >= 1 && newCount <= 2) {
      setShowSignupPrompt(true)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <TicketForm onSubmit={handleSubmit} isLoading={isLoading} />
        <AuditLog events={auditLog.slice(0, 10)} maxHeight="300px" />
      </div>

      <div>
        {result ? (
          <ResultPanel
            result={result}
            onCopyDraft={handleCopyDraft}
            onMarkContained={handleMarkContained}
            containedCount={containedCount}
          />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-lg">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No ticket resolved yet</p>
              <p className="text-sm mt-1">
                Submit a ticket or load a sample to see the resolver in action
              </p>
            </div>
          </div>
        )}
      </div>

      <SignupPrompt
        open={showSignupPrompt}
        onOpenChange={setShowSignupPrompt}
        containedCount={containedCount}
      />
    </div>
  )
}
