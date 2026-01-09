import type { Intent } from './resolver/intent'
import type { Citation } from './resolver/citations'
import type { PolicyCheckResult } from './policy'
import type { DemoOrder, DemoTracking } from './demo-data'

export interface TicketInput {
  subject: string
  body: string
  customerEmail: string
  customerName?: string
  orderNumber?: string
}

export interface ResolverResult {
  ticketId: string
  intent: {
    type: Intent
    confidence: number
    signals: string[]
    source: 'rules' | 'ai'
  }
  dataSources: {
    order: DemoOrder | null
    tracking: DemoTracking | null
    source: 'demo' | 'shopify' | 'aftership'
  }
  policyChecks: PolicyCheckResult[]
  reply: {
    subject: string
    body: string
    internalNote: string
    suggestedActions: string[]
  }
  citations: Citation[]
  timestamp: string
}

export interface AuditEvent {
  id: string
  ticketId: string
  merchantId?: string
  actorType: 'user' | 'system'
  actorUserId?: string
  eventType: 'ticket_created' | 'resolution_generated' | 'draft_copied' | 'marked_contained' | 'policy_changed'
  input: Record<string, unknown>
  output: Record<string, unknown>
  citations: Citation[]
  createdAt: string
}

export interface LocalStorageData {
  tickets: Array<{
    id: string
    input: TicketInput
    result?: ResolverResult
    status: 'pending' | 'resolved' | 'contained'
    createdAt: string
  }>
  auditLog: AuditEvent[]
  usage: {
    generated: number
    contained: number
    lastReset: string
  }
}
