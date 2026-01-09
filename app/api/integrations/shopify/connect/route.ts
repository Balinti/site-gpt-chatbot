import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    // Check if Shopify integration is configured
    const shopifyApiKey = process.env.SHOPIFY_API_KEY
    const shopifyApiSecret = process.env.SHOPIFY_API_SECRET

    if (!shopifyApiKey || !shopifyApiSecret) {
      return NextResponse.json({
        configured: false,
        message: 'Shopify integration not configured. Required env vars: SHOPIFY_API_KEY, SHOPIFY_API_SECRET',
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
    // 1. Generate OAuth URL for Shopify
    // 2. Redirect user to Shopify for authorization
    // 3. Handle callback with access token
    // 4. Store encrypted credentials in integrations table

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const scopes = process.env.SHOPIFY_SCOPES || 'read_orders,read_customers,read_fulfillments'

    return NextResponse.json({
      configured: true,
      message: 'Shopify OAuth would redirect here',
      // This would be the actual OAuth URL in production
      oauthUrl: `https://shopify.com/admin/oauth/authorize?client_id=${shopifyApiKey}&scope=${scopes}&redirect_uri=${appUrl}/api/integrations/shopify/callback`,
      instructions: [
        '1. Click connect to authorize your Shopify store',
        '2. Select the store you want to connect',
        '3. Approve the requested permissions',
        '4. You will be redirected back to configure settings',
      ],
    })
  } catch (error) {
    console.error('Shopify connect error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Shopify connection' },
      { status: 500 }
    )
  }
}
