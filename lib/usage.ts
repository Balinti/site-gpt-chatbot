import { createClient } from './supabase/server'
import { PLANS, getPlanByPriceId } from './stripe'

export interface UsageStats {
  generated: number
  contained: number
  sent: number
  limit: {
    generated: number
    contained: number
  }
  plan: string
}

export async function getUsageStats(merchantId: string): Promise<UsageStats | null> {
  const supabase = await createClient()
  if (!supabase) return null

  // Get current month boundaries
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  // Get subscription for plan limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('price_id')
    .eq('merchant_id', merchantId)
    .single()

  const planKey = getPlanByPriceId(subscription?.price_id || null)
  const plan = PLANS[planKey]

  // Get usage counts for current month
  const { data: usageData } = await supabase
    .from('usage_events')
    .select('event_type')
    .eq('merchant_id', merchantId)
    .gte('created_at', startOfMonth.toISOString())
    .lte('created_at', endOfMonth.toISOString())

  const usage = {
    generated: 0,
    contained: 0,
    sent: 0,
  }

  if (usageData) {
    usageData.forEach(event => {
      if (event.event_type === 'generated') usage.generated++
      if (event.event_type === 'contained') usage.contained++
      if (event.event_type === 'sent') usage.sent++
    })
  }

  return {
    ...usage,
    limit: {
      generated: plan.limits.generatedPerMonth,
      contained: plan.limits.containedPerMonth,
    },
    plan: plan.name,
  }
}

export async function recordUsageEvent(
  merchantId: string,
  ticketId: string,
  eventType: 'generated' | 'contained' | 'sent'
): Promise<boolean> {
  const supabase = await createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('usage_events')
    .insert({
      merchant_id: merchantId,
      ticket_id: ticketId,
      event_type: eventType,
    })

  return !error
}

export async function checkUsageLimit(
  merchantId: string,
  eventType: 'generated' | 'contained'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const stats = await getUsageStats(merchantId)
  if (!stats) {
    // Allow if we can't check (e.g., no Supabase)
    return { allowed: true, current: 0, limit: 50 }
  }

  const current = eventType === 'generated' ? stats.generated : stats.contained
  const limit = eventType === 'generated' ? stats.limit.generated : stats.limit.contained

  return {
    allowed: current < limit,
    current,
    limit,
  }
}

// Re-export for backwards compatibility
export { LOCAL_STORAGE_KEYS } from './constants'
