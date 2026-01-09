'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  MessageSquare,
  Inbox,
  Settings,
  Link2,
  CreditCard,
  BarChart3,
  LogOut,
  User,
} from 'lucide-react'

const navItems = [
  { href: '/app', label: 'Resolver', icon: MessageSquare },
  { href: '/app/tickets', label: 'Tickets', icon: Inbox },
  { href: '/app/policy', label: 'Policy', icon: Settings },
  { href: '/app/integrations', label: 'Integrations', icon: Link2 },
  { href: '/app/billing', label: 'Billing', icon: CreditCard },
  { href: '/app/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/me')
        const data = await res.json()
        if (data.authenticated) {
          setUser(data.user)
        }
      } catch (e) {
        console.error('Auth check failed:', e)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="font-semibold">SiteGPT</span>
            </Link>
            <Badge variant="secondary">Demo Mode</Badge>
          </div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden md:block w-48 shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/app' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <Separator className="my-4" />

            <div className="px-3 text-xs text-muted-foreground">
              <p>Free tier</p>
              <p className="mt-1">50 resolutions/mo</p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
