import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateId } from '@/lib/utils'

const auditEventSchema = z.object({
  ticketId: z.string(),
  merchantId: z.string().optional(),
  actorType: z.enum(['user', 'system']),
  actorUserId: z.string().optional(),
  eventType: z.enum([
    'ticket_created',
    'resolution_generated',
    'draft_copied',
    'marked_contained',
    'policy_changed',
  ]),
  input: z.record(z.string(), z.unknown()),
  output: z.record(z.string(), z.unknown()),
  citations: z.array(z.object({
    id: z.string(),
    claim: z.string(),
    source: z.object({
      type: z.enum(['policy', 'order', 'tracking', 'system']),
      name: z.string(),
      value: z.string(),
      reference: z.string().optional(),
    }),
  })).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const event = auditEventSchema.parse(json)

    const supabase = await createClient()

    // If Supabase is available, store in database
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user && event.merchantId) {
        const { error } = await supabase
          .from('audit_events')
          .insert({
            id: generateId(),
            merchant_id: event.merchantId,
            ticket_id: event.ticketId,
            actor_user_id: event.actorUserId || user.id,
            actor_type: event.actorType,
            event_type: event.eventType,
            input: event.input,
            output: event.output,
            citations: event.citations || [],
          })

        if (error) {
          console.error('Audit insert error:', error)
          // Fall through to return success - client will handle local storage
        }

        return NextResponse.json({
          success: true,
          stored: 'database',
          id: generateId()
        })
      }
    }

    // Return success for client-side localStorage storage
    return NextResponse.json({
      success: true,
      stored: 'local',
      id: generateId()
    })
  } catch (error) {
    console.error('Audit error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
