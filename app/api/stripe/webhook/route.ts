import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const supabase = createAdminClient()

    // Always return 200 to acknowledge receipt
    if (!stripe || !supabase) {
      console.log('Stripe webhook: services not configured')
      return NextResponse.json({ received: true })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event: Stripe.Event

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ received: true }) // Still return 200
      }
    } else {
      // Parse without verification (dev mode)
      event = JSON.parse(body) as Stripe.Event
    }

    // Handle subscription events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const merchantId = session.metadata?.merchant_id

        if (merchantId && session.subscription) {
          const subscriptionData = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as Stripe.Subscription

          const periodEnd = (subscriptionData as unknown as { current_period_end: number }).current_period_end

          await supabase
            .from('subscriptions')
            .upsert({
              merchant_id: merchantId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionData.id,
              status: subscriptionData.status,
              price_id: subscriptionData.items.data[0]?.price.id,
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'merchant_id',
            })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find merchant by customer ID
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('merchant_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (existingSub) {
          const subPeriodEnd = (subscription as unknown as { current_period_end: number }).current_period_end

          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              price_id: subscription.items.data[0]?.price.id || null,
              current_period_end: new Date(subPeriodEnd * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('merchant_id', existingSub.merchant_id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('merchant_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (existingSub) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('merchant_id', existingSub.merchant_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    // Always return 200 to prevent Stripe retries
    return NextResponse.json({ received: true })
  }
}
