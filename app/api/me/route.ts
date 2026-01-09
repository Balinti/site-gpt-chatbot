import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUsageStats } from '@/lib/usage'
import { getPlanByPriceId, PLANS } from '@/lib/stripe'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        merchant: null,
        plan: PLANS.free,
        usage: null,
      })
    }

    let usage = null
    let planKey = 'free'

    if (session.merchant) {
      usage = await getUsageStats(session.merchant.id)
      if (session.subscription?.priceId) {
        planKey = getPlanByPriceId(session.subscription.priceId)
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      merchant: session.merchant,
      plan: PLANS[planKey as keyof typeof PLANS],
      planKey,
      subscription: session.subscription,
      usage,
    })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
