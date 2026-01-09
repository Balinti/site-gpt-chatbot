import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateId } from '@/lib/utils'

const migrateSchema = z.object({
  tickets: z.array(z.object({
    id: z.string(),
    input: z.object({
      subject: z.string(),
      body: z.string(),
      customerEmail: z.string(),
      customerName: z.string().optional(),
      orderNumber: z.string().optional(),
    }),
    result: z.any().optional(),
    status: z.enum(['pending', 'resolved', 'contained']),
    createdAt: z.string(),
  })),
  auditLog: z.array(z.object({
    id: z.string(),
    ticketId: z.string(),
    actorType: z.enum(['user', 'system']),
    eventType: z.string(),
    input: z.record(z.string(), z.unknown()),
    output: z.record(z.string(), z.unknown()),
    citations: z.array(z.any()),
    createdAt: z.string(),
  })),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()
    const data = migrateSchema.parse(json)

    // Get or create merchant for user
    const { data: membership } = await supabase
      .from('memberships')
      .select('merchant_id')
      .eq('user_id', user.id)
      .single()

    let merchantId: string

    if (!membership) {
      // Create new merchant
      merchantId = generateId()
      const { error: merchantError } = await supabase
        .from('merchants')
        .insert({
          id: merchantId,
          owner_user_id: user.id,
          name: `${user.email}'s Store`,
        })

      if (merchantError) {
        throw merchantError
      }

      // Create membership
      await supabase
        .from('memberships')
        .insert({
          merchant_id: merchantId,
          user_id: user.id,
          role: 'owner',
        })
    } else {
      merchantId = membership.merchant_id
    }

    // Migrate tickets
    const ticketIdMap: Record<string, string> = {}

    for (const ticket of data.tickets) {
      const newTicketId = generateId()
      ticketIdMap[ticket.id] = newTicketId

      await supabase
        .from('tickets')
        .insert({
          id: newTicketId,
          merchant_id: merchantId,
          external_source: 'demo',
          subject: ticket.input.subject,
          body: ticket.input.body,
          customer_email: ticket.input.customerEmail,
          customer_name: ticket.input.customerName,
          status: ticket.status,
          created_at: ticket.createdAt,
        })
    }

    // Migrate audit log
    for (const event of data.auditLog) {
      const ticketId = ticketIdMap[event.ticketId] || event.ticketId

      await supabase
        .from('audit_events')
        .insert({
          id: generateId(),
          merchant_id: merchantId,
          ticket_id: ticketId,
          actor_user_id: user.id,
          actor_type: event.actorType,
          event_type: event.eventType,
          input: event.input,
          output: event.output,
          citations: event.citations,
          created_at: event.createdAt,
        })
    }

    return NextResponse.json({
      success: true,
      migrated: {
        tickets: data.tickets.length,
        auditEvents: data.auditLog.length,
      },
      merchantId,
    })
  } catch (error) {
    console.error('Migration error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    )
  }
}
