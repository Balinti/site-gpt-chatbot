import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { detectIntent } from '@/lib/resolver/intent'
import { classifyIntentWithAI, generateAIReply } from '@/lib/resolver/openai'
import { selectTemplate } from '@/lib/resolver/templates'
import {
  findOrderByNumber,
  findOrderByEmail,
  getTrackingInfo,
  type DemoOrder,
  type DemoTracking
} from '@/lib/demo-data'
import {
  DEFAULT_POLICY,
  checkReturnEligibility,
  checkFinalSale,
  checkDeliveredNotReceived,
  type PolicyCheckResult
} from '@/lib/policy'
import {
  createPolicyCitation,
  createOrderCitation,
  createTrackingCitation,
  type Citation
} from '@/lib/resolver/citations'
import { generateId } from '@/lib/utils'
import type { ResolverResult, TicketInput } from '@/lib/types'

const ticketSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
  orderNumber: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const input = ticketSchema.parse(json) as TicketInput

    const ticketId = generateId()
    const customerName = input.customerName || input.customerEmail.split('@')[0]

    // 1. Intent Detection
    let intent = detectIntent(input.subject, input.body)
    let intentSource: 'rules' | 'ai' = 'rules'

    // Try AI classification if OpenAI is available
    const aiIntent = await classifyIntentWithAI(input.subject, input.body)
    if (aiIntent && aiIntent.confidence > intent.confidence) {
      intent = {
        intent: aiIntent.intent,
        confidence: aiIntent.confidence,
        signals: [`AI classified as ${aiIntent.intent} with ${(aiIntent.confidence * 100).toFixed(0)}% confidence`],
      }
      intentSource = 'ai'
    }

    // 2. Order Resolution (demo data)
    let order: DemoOrder | null = null
    let tracking: DemoTracking | null = null

    if (input.orderNumber) {
      order = findOrderByNumber(input.orderNumber) || null
    }

    if (!order) {
      const orders = findOrderByEmail(input.customerEmail)
      if (orders.length > 0) {
        // Get most recent order
        order = orders.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      }
    }

    // 3. Tracking Lookup
    if (order?.fulfillment?.trackingNumber) {
      tracking = getTrackingInfo(order.fulfillment.trackingNumber) || null
    }

    // 4. Policy Checks
    const policyChecks: PolicyCheckResult[] = []
    const policy = DEFAULT_POLICY

    if (intent.intent === 'RETURNS' && order) {
      policyChecks.push(checkReturnEligibility(order.createdAt, policy))
      policyChecks.push(checkFinalSale(order.items, policy))
    }

    if (intent.intent === 'WISMO' && tracking?.status === 'delivered') {
      policyChecks.push(checkDeliveredNotReceived(tracking.deliveredAt, policy))
    }

    // 5. Generate Reply
    let reply: {
      subject: string
      body: string
      internalNote: string
      suggestedActions: string[]
    }
    let citations: Citation[] = []

    // Try AI-generated reply
    const aiReply = await generateAIReply(
      intent.intent,
      order,
      tracking,
      policyChecks,
      customerName,
      `${input.subject}\n\n${input.body}`
    )

    if (aiReply) {
      reply = {
        subject: aiReply.subject,
        body: aiReply.body,
        internalNote: aiReply.internalNote,
        suggestedActions: aiReply.suggestedActions,
      }
      citations = aiReply.citations.map((c, i) => ({
        id: `cite_${i}`,
        claim: c.claim,
        source: {
          type: 'order' as const,
          name: c.source,
          value: c.value,
        },
      }))
    } else {
      // Fallback to templates
      const template = selectTemplate(intent.intent, order, tracking, policyChecks, customerName)
      reply = template
    }

    // 6. Generate Citations from data sources
    if (order) {
      citations.push(
        createOrderCitation(
          `Order ${order.orderNumber} found`,
          order.orderNumber,
          'status',
          order.status
        )
      )
      citations.push(
        createOrderCitation(
          `Order placed on ${new Date(order.createdAt).toLocaleDateString()}`,
          order.orderNumber,
          'createdAt',
          new Date(order.createdAt).toLocaleDateString()
        )
      )
    }

    if (tracking) {
      citations.push(
        createTrackingCitation(
          `Package status: ${tracking.status}`,
          tracking.trackingNumber,
          'status',
          tracking.status
        )
      )
      if (tracking.deliveredAt) {
        citations.push(
          createTrackingCitation(
            `Delivered on ${new Date(tracking.deliveredAt).toLocaleDateString()}`,
            tracking.trackingNumber,
            'deliveredAt',
            new Date(tracking.deliveredAt).toLocaleDateString()
          )
        )
      }
    }

    policyChecks.forEach(check => {
      citations.push(
        createPolicyCitation(
          check.message,
          check.citation.source,
          check.citation.value
        )
      )
    })

    const result: ResolverResult = {
      ticketId,
      intent: {
        type: intent.intent,
        confidence: intent.confidence,
        signals: intent.signals,
        source: intentSource,
      },
      dataSources: {
        order,
        tracking,
        source: 'demo',
      },
      policyChecks,
      reply,
      citations,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Resolver error:', error)
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
