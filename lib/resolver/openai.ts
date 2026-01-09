import OpenAI from 'openai'
import type { Intent } from './intent'
import type { DemoOrder, DemoTracking } from '../demo-data'
import type { PolicyCheckResult } from '../policy'

let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export async function classifyIntentWithAI(
  subject: string,
  body: string
): Promise<{ intent: Intent; confidence: number } | null> {
  const client = getOpenAIClient()
  if (!client) return null

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a customer support intent classifier. Classify the customer's message into exactly one of these categories:
- WISMO: Where Is My Order - questions about order status, shipping, delivery, tracking
- RETURNS: Return, refund, or exchange requests
- OTHER: Any other type of inquiry

Respond with JSON only: {"intent": "WISMO" | "RETURNS" | "OTHER", "confidence": 0.0-1.0}`,
        },
        {
          role: 'user',
          content: `Subject: ${subject}\n\nMessage: ${body}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 50,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return null

    const result = JSON.parse(content)
    return {
      intent: result.intent as Intent,
      confidence: result.confidence,
    }
  } catch (error) {
    console.error('OpenAI intent classification error:', error)
    return null
  }
}

export async function generateAIReply(
  intent: Intent,
  order: DemoOrder | null,
  tracking: DemoTracking | null,
  policyChecks: PolicyCheckResult[],
  customerName: string,
  originalMessage: string
): Promise<{
  subject: string
  body: string
  internalNote: string
  suggestedActions: string[]
  citations: Array<{ claim: string; source: string; value: string }>
} | null> {
  const client = getOpenAIClient()
  if (!client) return null

  const context = {
    intent,
    customerName,
    order: order ? {
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map(i => ({ name: i.name, finalSale: i.finalSale })),
      total: order.total,
      fulfillment: order.fulfillment,
    } : null,
    tracking: tracking ? {
      status: tracking.status,
      carrier: tracking.carrier,
      trackingNumber: tracking.trackingNumber,
      estimatedDelivery: tracking.estimatedDelivery,
      deliveredAt: tracking.deliveredAt,
      lastCheckpoint: tracking.checkpoints[tracking.checkpoints.length - 1],
    } : null,
    policyChecks: policyChecks.map(p => ({
      rule: p.rule,
      passed: p.passed,
      message: p.message,
    })),
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful customer support agent for an e-commerce store. Generate a professional, friendly response to the customer's inquiry.

You MUST cite your sources for any factual claims. Use the data provided in the context.

Respond with JSON:
{
  "subject": "Reply subject line",
  "body": "The customer-facing email body",
  "internalNote": "Brief note for support team",
  "suggestedActions": ["action 1", "action 2"],
  "citations": [
    {"claim": "what you're stating", "source": "where the data came from", "value": "the actual value"}
  ]
}

Guidelines:
- Be concise but thorough
- Use customer's first name
- Include specific order/tracking details when available
- For returns: explain policy decisions clearly
- For WISMO: provide tracking updates and expected delivery
- Always be empathetic and professional`,
        },
        {
          role: 'user',
          content: `Customer message: ${originalMessage}

Context data:
${JSON.stringify(context, null, 2)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return null

    return JSON.parse(content)
  } catch (error) {
    console.error('OpenAI reply generation error:', error)
    return null
  }
}
