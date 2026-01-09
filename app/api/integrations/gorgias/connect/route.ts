import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    // Check if Gorgias integration is configured
    const gorgiasClientId = process.env.GORGIAS_CLIENT_ID
    const gorgiasClientSecret = process.env.GORGIAS_CLIENT_SECRET

    if (!gorgiasClientId || !gorgiasClientSecret) {
      return NextResponse.json({
        configured: false,
        message: 'Gorgias integration not configured. Required env vars: GORGIAS_CLIENT_ID, GORGIAS_CLIENT_SECRET',
      })
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

    // In a real implementation, this would:
    // 1. Generate OAuth URL for Gorgias
    // 2. Redirect user to Gorgias for authorization
    // 3. Handle callback with access token
    // 4. Store encrypted credentials in integrations table

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return NextResponse.json({
      configured: true,
      message: 'Gorgias OAuth would redirect here',
      oauthUrl: `https://app.gorgias.com/oauth/authorize?client_id=${gorgiasClientId}&redirect_uri=${appUrl}/api/integrations/gorgias/callback`,
      instructions: [
        '1. Click connect to authorize your Gorgias account',
        '2. Sign in to your Gorgias helpdesk',
        '3. Approve the integration permissions',
        '4. Tickets will sync automatically',
      ],
    })
  } catch (error) {
    console.error('Gorgias connect error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Gorgias connection' },
      { status: 500 }
    )
  }
}
