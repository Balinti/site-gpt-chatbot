import { createClient } from './supabase/server'

export interface UserSession {
  user: {
    id: string
    email: string
  }
  merchant: {
    id: string
    name: string
    ownerId: string
  } | null
  subscription: {
    status: string
    priceId: string | null
    currentPeriodEnd: string | null
  } | null
}

export async function getSession(): Promise<UserSession | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  // Get merchant membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('merchant_id, role, merchants(id, name, owner_user_id)')
    .eq('user_id', user.id)
    .single()

  const merchant = membership?.merchants as { id: string; name: string; owner_user_id: string } | undefined

  // Get subscription if merchant exists
  let subscription = null
  if (merchant) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, price_id, current_period_end')
      .eq('merchant_id', merchant.id)
      .single()

    if (sub) {
      subscription = {
        status: sub.status,
        priceId: sub.price_id,
        currentPeriodEnd: sub.current_period_end,
      }
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
    },
    merchant: merchant ? {
      id: merchant.id,
      name: merchant.name,
      ownerId: merchant.owner_user_id,
    } : null,
    subscription,
  }
}

export async function signOut() {
  const supabase = await createClient()
  if (!supabase) return

  await supabase.auth.signOut()
}
