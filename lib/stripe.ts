import Stripe from 'stripe'

export function getStripe(): Stripe | null {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return null
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
  })
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      generatedPerMonth: 50,
      containedPerMonth: 50,
    },
    features: [
      'Up to 50 resolutions/month',
      'Demo mode',
      'Basic policy engine',
    ],
  },
  starter: {
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    limits: {
      generatedPerMonth: 500,
      containedPerMonth: 500,
    },
    features: [
      'Up to 500 resolutions/month',
      'Real integrations',
      'Advanced policy engine',
      'Analytics dashboard',
    ],
  },
  growth: {
    name: 'Growth',
    price: 99,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || '',
    limits: {
      generatedPerMonth: 2000,
      containedPerMonth: 2000,
    },
    features: [
      'Up to 2000 resolutions/month',
      'All integrations',
      'Full policy engine',
      'Advanced analytics',
      'Priority support',
    ],
  },
}

export type PlanKey = keyof typeof PLANS

export function getPlanByPriceId(priceId: string | null): PlanKey {
  if (!priceId) return 'free'
  if (priceId === PLANS.starter.priceId) return 'starter'
  if (priceId === PLANS.growth.priceId) return 'growth'
  return 'free'
}
