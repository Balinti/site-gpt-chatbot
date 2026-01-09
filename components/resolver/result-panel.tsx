'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle,
  XCircle,
  Copy,
  CheckCheck,
  Package,
  Truck,
  FileText,
  AlertCircle
} from 'lucide-react'
import type { ResolverResult } from '@/lib/types'

interface ResultPanelProps {
  result: ResolverResult
  onCopyDraft: () => void
  onMarkContained: () => void
  containedCount: number
}

export function ResultPanel({ result, onCopyDraft, onMarkContained, containedCount }: ResultPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(result.reply.body)
    setCopied(true)
    onCopyDraft()
    setTimeout(() => setCopied(false), 2000)
  }

  const intentColor = {
    WISMO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    RETURNS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
  }

  return (
    <div className="space-y-4">
      {/* Intent Detection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Intent Detected</CardTitle>
            <Badge className={intentColor[result.intent.type]}>
              {result.intent.type}
            </Badge>
          </div>
          <CardDescription>
            {Math.round(result.intent.confidence * 100)}% confidence via {result.intent.source}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {result.intent.signals.slice(0, 3).map((signal, i) => (
              <div key={i}>{signal}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data Sources</CardTitle>
          <CardDescription>Information retrieved from {result.dataSources.source}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.dataSources.order ? (
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Package className="h-5 w-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">{result.dataSources.order.orderNumber}</div>
                <div className="text-sm text-muted-foreground">
                  Status: <Badge variant="outline" className="ml-1">{result.dataSources.order.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.dataSources.order.items.map(i => i.name).join(', ')}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: ${result.dataSources.order.total.toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>No order found</span>
            </div>
          )}

          {result.dataSources.tracking ? (
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Truck className="h-5 w-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">{result.dataSources.tracking.carrier}</div>
                <div className="text-sm text-muted-foreground">
                  Tracking: {result.dataSources.tracking.trackingNumber}
                </div>
                <div className="text-sm text-muted-foreground">
                  Status: <Badge variant="outline" className="ml-1">{result.dataSources.tracking.status}</Badge>
                </div>
                {result.dataSources.tracking.deliveredAt && (
                  <div className="text-sm text-muted-foreground">
                    Delivered: {new Date(result.dataSources.tracking.deliveredAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ) : result.dataSources.order?.fulfillment ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>Tracking info pending</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Policy Checks */}
      {result.policyChecks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Policy Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.policyChecks.map((check, i) => (
                <div key={i} className="flex items-start gap-2">
                  {check.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={check.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                      {check.message}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Source: {check.citation.source}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Draft Reply */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Verified Draft Reply</CardTitle>
              <CardDescription>Review and send to customer</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Draft
                  </>
                )}
              </Button>
              <Button size="sm" onClick={onMarkContained}>
                Mark Contained
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reply">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reply">Reply</TabsTrigger>
              <TabsTrigger value="internal">Internal Note</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="reply" className="mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="font-medium mb-2">Subject: {result.reply.subject}</div>
                <Separator className="my-2" />
                <ScrollArea className="h-[300px]">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {result.reply.body}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="internal" className="mt-4">
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2 text-yellow-800 dark:text-yellow-200">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Internal Note</span>
                </div>
                <p className="text-sm">{result.reply.internalNote}</p>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="mt-4">
              <div className="space-y-2">
                {result.reply.suggestedActions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {i + 1}
                    </div>
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Citations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Citations</CardTitle>
          <CardDescription>Sources backing the response</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.citations.map((citation) => (
              <div key={citation.id} className="flex items-start gap-2 p-2 bg-muted rounded text-sm">
                <Badge variant="outline" className="shrink-0">
                  {citation.source.type}
                </Badge>
                <div className="flex-1">
                  <div className="font-medium">{citation.claim}</div>
                  <div className="text-muted-foreground">
                    {citation.source.name}: {citation.source.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage indicator */}
      <div className="text-center text-sm text-muted-foreground">
        Contained tickets: {containedCount} / 50 (Free tier)
      </div>
    </div>
  )
}
