import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'

const connectSchema = z.object({
  apiKey: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // Check if AfterShip integration is available
    const aftershipApiKey = process.env.AFTERSHIP_API_KEY

    // For AfterShip, we use API key authentication (not OAuth)
    // User can provide their own API key or use the platform key

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

    const body = await request.json().catch(() => ({}))

    // If user provides their own API key
    if (body.apiKey) {
      const { apiKey } = connectSchema.parse(body)

      // Validate the API key by making a test request
      const testResponse = await fetch('https://api.aftership.com/v4/couriers', {
        headers: {
          'aftership-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      })

      if (!testResponse.ok) {
        return NextResponse.json(
          { error: 'Invalid AfterShip API key' },
          { status: 400 }
        )
      }

      // Encrypt and store the API key
      const encryptedKey = encrypt(apiKey)

      if (!encryptedKey) {
        return NextResponse.json(
          { error: 'Encryption not configured' },
          { status: 503 }
        )
      }

      await supabase
        .from('integrations')
        .upsert({
          merchant_id: membership.merchant_id,
          provider: 'aftership',
          status: 'active',
          credentials_encrypted: encryptedKey,
          meta: { connected_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'merchant_id,provider',
        })

      return NextResponse.json({
        success: true,
        message: 'AfterShip connected successfully',
      })
    }

    // If platform API key is configured, use that
    if (aftershipApiKey) {
      return NextResponse.json({
        configured: true,
        message: 'AfterShip is available via platform integration',
        instructions: [
          'AfterShip tracking is enabled for your account',
          'Real-time tracking updates will be fetched automatically',
        ],
      })
    }

    return NextResponse.json({
      configured: false,
      message: 'AfterShip integration not configured. You can provide your own API key.',
      instructions: [
        '1. Go to your AfterShip dashboard',
        '2. Navigate to Settings > API > API Keys',
        '3. Create a new API key',
        '4. Enter the key below to connect',
      ],
    })
  } catch (error) {
    console.error('AfterShip connect error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to connect AfterShip' },
      { status: 500 }
    )
  }
}
