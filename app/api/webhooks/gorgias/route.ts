import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Check if Gorgias webhooks are configured
    const gorgiasWebhookSecret = process.env.GORGIAS_WEBHOOK_SECRET

    const body = await request.text()

    // Verify webhook signature if configured
    if (gorgiasWebhookSecret) {
      const signature = request.headers.get('x-gorgias-signature')
      // In production, verify HMAC signature
      if (!signature) {
        console.log('Gorgias webhook missing signature')
      }
    }

    const payload = JSON.parse(body)
    const eventType = payload.event

    console.log(`Gorgias webhook received: ${eventType}`)

    // In a real implementation, handle different webhook events:
    // - ticket.created
    // - ticket.message.created
    // - ticket.updated
    // etc.

    switch (eventType) {
      case 'ticket.created':
        // New ticket from Gorgias
        console.log('New ticket:', payload.ticket?.id)
        break

      case 'ticket.message.created':
        // New message on ticket
        console.log('New message on ticket:', payload.ticket?.id)
        break

      case 'ticket.updated':
        // Ticket status change
        console.log('Ticket updated:', payload.ticket?.id)
        break

      default:
        console.log('Unhandled Gorgias event:', eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Gorgias webhook error:', error)
    return NextResponse.json({ received: true })
  }
}
