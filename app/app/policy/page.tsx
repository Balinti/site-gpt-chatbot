'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { DEFAULT_POLICY, type Policy } from '@/lib/policy'
import { CheckCircle, AlertCircle, Save } from 'lucide-react'

const POLICY_STORAGE_KEY = 'sitegpt_policy'

export default function PolicyPage() {
  const [policy, setPolicy] = useState<Policy>(DEFAULT_POLICY)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(POLICY_STORAGE_KEY)
    if (stored) {
      try {
        setPolicy(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse policy:', e)
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(policy))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateRule = (key: keyof Policy['rules'], value: unknown) => {
    setPolicy({
      ...policy,
      rules: {
        ...policy.rules,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Policy Engine</h1>
          <p className="text-muted-foreground">Configure rules for automated ticket resolution</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {saved && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>Your policy changes have been saved.</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Return Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Return Policy</CardTitle>
            <CardDescription>Configure return eligibility rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="returnWindow">Return Window (days)</Label>
              <Input
                id="returnWindow"
                type="number"
                value={policy.rules.returnWindow}
                onChange={(e) => updateRule('returnWindow', parseInt(e.target.value, 10))}
              />
              <p className="text-xs text-muted-foreground">
                Number of days from order date that returns are accepted
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Final Sale Items</Label>
                <p className="text-xs text-muted-foreground">
                  Block returns for items marked as final sale
                </p>
              </div>
              <Badge
                variant={policy.rules.finalSaleNoReturn ? 'destructive' : 'secondary'}
                className="cursor-pointer"
                onClick={() => updateRule('finalSaleNoReturn', !policy.rules.finalSaleNoReturn)}
              >
                {policy.rules.finalSaleNoReturn ? 'No Returns' : 'Allow Returns'}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Refund Method</Label>
              <div className="flex gap-2">
                <Button
                  variant={policy.rules.refundMethod === 'original_payment' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateRule('refundMethod', 'original_payment')}
                >
                  Original Payment
                </Button>
                <Button
                  variant={policy.rules.refundMethod === 'store_credit' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateRule('refundMethod', 'store_credit')}
                >
                  Store Credit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Claims */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Claims</CardTitle>
            <CardDescription>Configure rules for delivery issue handling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveredThreshold">
                Delivered-Not-Received Threshold (days)
              </Label>
              <Input
                id="deliveredThreshold"
                type="number"
                value={policy.rules.deliveredNotReceivedThreshold}
                onChange={(e) =>
                  updateRule('deliveredNotReceivedThreshold', parseInt(e.target.value, 10))
                }
              />
              <p className="text-xs text-muted-foreground">
                Days to wait after delivery before accepting non-receipt claims
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Address Change Allowed For</Label>
              <div className="flex flex-wrap gap-2">
                {['pending', 'processing', 'shipped'].map((status) => (
                  <Badge
                    key={status}
                    variant={
                      policy.rules.addressChangeAllowedStatuses.includes(status)
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      const current = policy.rules.addressChangeAllowedStatuses
                      const updated = current.includes(status)
                        ? current.filter((s) => s !== status)
                        : [...current, status]
                      updateRule('addressChangeAllowedStatuses', updated)
                    }}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Order statuses where address changes are permitted
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Policy Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Policy Preview</CardTitle>
            <CardDescription>Current policy configuration as JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(policy, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>
          Policy changes are stored locally. Sign in to sync across devices and enable
          version history.
        </AlertDescription>
      </Alert>
    </div>
  )
}
