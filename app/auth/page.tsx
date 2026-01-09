'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

function AuthContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'signin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setError('Authentication not configured')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Migrate local data after sign in
    await migrateLocalData()

    window.location.href = '/app'
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setError('Authentication not configured')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess('Check your email to confirm your account, then sign in.')
    setLoading(false)
  }

  const migrateLocalData = async () => {
    const tickets = localStorage.getItem('sitegpt_tickets')
    const auditLog = localStorage.getItem('sitegpt_audit_log')

    if (!tickets && !auditLog) return

    try {
      await fetch('/api/auth/migrate-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickets: tickets ? JSON.parse(tickets) : [],
          auditLog: auditLog ? JSON.parse(auditLog) : [],
        }),
      })

      // Clear local storage after migration
      localStorage.removeItem('sitegpt_tickets')
      localStorage.removeItem('sitegpt_audit_log')
      localStorage.removeItem('sitegpt_usage')
      localStorage.removeItem('sitegpt_contained_count')
    } catch (e) {
      console.error('Migration failed:', e)
    }
  }

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Not Available</CardTitle>
            <CardDescription>
              Supabase is not configured for this deployment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can still use the app in demo mode without signing in.
                All data will be stored locally in your browser.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full mt-4">
              <Link href="/app">Continue to App</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="font-semibold text-xl">SiteGPT</span>
          </div>
          <CardDescription>
            Sign in to save your work and sync across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={mode === 'signup' ? 'signup' : 'signin'}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    minLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  )
}
