import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe, PLANS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

const checkoutSchema = z.object({
  priceId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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
    const { priceId } = checkoutSchema.parse(json)

    // Validate price ID
    const validPriceIds = [PLANS.starter.priceId, PLANS.growth.priceId].filter(Boolean)
    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Get merchant
    const { data: membership } = await supabase
      .from('memberships')
      .select('merchant_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      )
    }

    // Check for existing Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('merchant_id', membership.merchant_id)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          merchant_id: membership.merchant_id,
          user_id: user.id,
          app_name: 'site-gpt-chatbot',
        },
      })
      customerId = customer.id
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/app/billing?success=true`,
      cancel_url: `${appUrl}/app/billing?canceled=true`,
      metadata: {
        merchant_id: membership.merchant_id,
        app_name: 'site-gpt-chatbot',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
