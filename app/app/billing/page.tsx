'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PLANS } from '@/lib/stripe'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

function BillingContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [stripeConfigured, setStripeConfigured] = useState(true)

  useEffect(() => {
    // Check current plan
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.planKey) {
          setCurrentPlan(data.planKey)
        }
      })
      .catch(console.error)
  }, [])

  const handleUpgrade = async (priceId: string) => {
    setLoading(priceId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()

      if (data.error === 'Stripe not configured') {
        setStripeConfigured(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(null)
    }
  }

  const handlePortal = async () => {
    setLoading('portal')
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {success && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your subscription has been activated. Thank you for upgrading!
          </AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Canceled</AlertTitle>
          <AlertDescription>
            The checkout was canceled. No charges were made.
          </AlertDescription>
        </Alert>
      )}

      {!stripeConfigured && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Billing Not Configured</AlertTitle>
          <AlertDescription>
            Stripe is not configured for this deployment. The app remains fully functional
            on the free tier.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(PLANS).map(([key, plan]) => {
          const isCurrent = currentPlan === key
          const priceId = 'priceId' in plan ? plan.priceId : null

          return (
            <Card
              key={key}
              className={isCurrent ? 'border-primary ring-2 ring-primary ring-offset-2' : ''}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge>Current Plan</Badge>}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div>Generated/month: {plan.limits.generatedPerMonth}</div>
                  <div>Contained/month: {plan.limits.containedPerMonth}</div>
                </div>

                {isCurrent ? (
                  currentPlan !== 'free' ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handlePortal}
                      disabled={loading === 'portal'}
                    >
                      {loading === 'portal' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Manage Subscription'
                      )}
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-full" disabled>
                      Current Plan
                    </Button>
                  )
                ) : priceId ? (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(priceId)}
                    disabled={loading === priceId || !stripeConfigured}
                  >
                    {loading === priceId ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Contact Sales
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your resolution usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">
                Resolutions generated
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                of {PLANS[currentPlan as keyof typeof PLANS].limits.generatedPerMonth} limit
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">
                Tickets contained
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                of {PLANS[currentPlan as keyof typeof PLANS].limits.containedPerMonth} limit
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <BillingContent />
    </Suspense>
  )
}
