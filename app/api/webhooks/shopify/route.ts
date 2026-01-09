import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Check if Shopify webhooks are configured
    const shopifyApiSecret = process.env.SHOPIFY_API_SECRET

    if (!shopifyApiSecret) {
      console.log('Shopify webhook received but not configured')
      return NextResponse.json({ received: true })
    }

    const body = await request.text()
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256')

    // Verify webhook signature
    if (hmacHeader) {
      const hmac = crypto
        .createHmac('sha256', shopifyApiSecret)
        .update(body, 'utf8')
        .digest('base64')

      if (hmac !== hmacHeader) {
        console.error('Shopify webhook signature verification failed')
        return NextResponse.json({ received: true })
      }
    }

    const topic = request.headers.get('x-shopify-topic')
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    console.log(`Shopify webhook received: ${topic} from ${shopDomain}`)

    // In a real implementation, handle different webhook topics:
    // - orders/create
    // - orders/updated
    // - fulfillments/create
    // - fulfillments/update
    // etc.

    const payload = JSON.parse(body)

    switch (topic) {
      case 'orders/create':
        // Handle new order
        console.log('New order:', payload.id)
        break

      case 'orders/updated':
        // Handle order update
        console.log('Order updated:', payload.id)
        break

      case 'fulfillments/create':
      case 'fulfillments/update':
        // Handle fulfillment updates
        console.log('Fulfillment:', payload.id)
        break

      default:
        console.log('Unhandled webhook topic:', topic)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Shopify webhook error:', error)
    return NextResponse.json({ received: true })
  }
}
