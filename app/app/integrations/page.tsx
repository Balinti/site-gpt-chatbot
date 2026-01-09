'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ShoppingBag, Headphones, Truck, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: 'connected' | 'not_configured' | 'available'
  connectEndpoint: string
}

const integrations: Integration[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Connect your Shopify store for real-time order and fulfillment data',
    icon: ShoppingBag,
    status: 'not_configured',
    connectEndpoint: '/api/integrations/shopify/connect',
  },
  {
    id: 'gorgias',
    name: 'Gorgias',
    description: 'Sync tickets from your Gorgias helpdesk',
    icon: Headphones,
    status: 'not_configured',
    connectEndpoint: '/api/integrations/gorgias/connect',
  },
  {
    id: 'aftership',
    name: 'AfterShip',
    description: 'Get real-time tracking updates for all carriers',
    icon: Truck,
    status: 'available',
    connectEndpoint: '/api/integrations/aftership/connect',
  },
]

export default function IntegrationsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, unknown>>({})
  const [apiKey, setApiKey] = useState('')

  const handleConnect = async (integration: Integration) => {
    setLoading(integration.id)
    try {
      const body = integration.id === 'aftership' && apiKey
        ? JSON.stringify({ apiKey })
        : '{}'

      const res = await fetch(integration.connectEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const data = await res.json()
      setResults({ ...results, [integration.id]: data })
    } catch {
      setResults({
        ...results,
        [integration.id]: { error: 'Connection failed' },
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect external services for real-time data lookups
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Demo Mode Active</AlertTitle>
        <AlertDescription>
          Integrations require configuration. In demo mode, all data is simulated from sample
          orders and tracking information.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const result = results[integration.id] as Record<string, unknown> | undefined

          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <integration.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge
                    variant={
                      result?.success
                        ? 'default'
                        : result?.configured
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {result?.success
                      ? 'Connected'
                      : result?.configured
                      ? 'Ready'
                      : 'Not Configured'}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4">{integration.name}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {result && (
                  <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
                    {result.error ? (
                      <span className="text-destructive">{String(result.error)}</span>
                    ) : result.message ? (
                      <span>{String(result.message)}</span>
                    ) : result.success ? (
                      <span className="text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Successfully connected
                      </span>
                    ) : null}
                  </div>
                )}

                {integration.id === 'aftership' ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        {loading === integration.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Configure'
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect AfterShip</DialogTitle>
                        <DialogDescription>
                          Enter your AfterShip API key to enable real-time tracking
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="apiKey">API Key</Label>
                          <Input
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your AfterShip API key"
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleConnect(integration)}
                          disabled={!apiKey || loading === integration.id}
                        >
                          {loading === integration.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleConnect(integration)}
                    disabled={loading === integration.id}
                  >
                    {loading === integration.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Check Status'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
