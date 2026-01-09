import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="font-semibold text-xl">SiteGPT</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <Button asChild size="sm">
              <Link href="/app">Try it now</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          Verified Resolution Agent for Shopify
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Resolve tickets with
          <span className="text-primary"> verifiable AI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Handle WISMO and Returns tickets automatically with grounded data lookups,
          policy enforcement, citations, and complete audit trails.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/app">
              Try it now - No signup required
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#features">Learn more</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Free tier: 50 resolutions/month
        </p>
      </section>

      {/* Demo Preview */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-2xl border overflow-hidden">
          <div className="bg-muted px-4 py-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-sm text-muted-foreground">SiteGPT Resolver</span>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-sm font-medium">Incoming Ticket</div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="font-medium">Where is my order?</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Hi, I ordered some wireless earbuds last week and haven&apos;t received them yet.
                  My order number is ORD-2024-1001...
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-sm font-medium">Verified Response</div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <Badge className="bg-green-100 text-green-800 mb-2">WISMO - 92% confidence</Badge>
                <div className="text-sm">
                  <p className="font-medium">Order found: ORD-2024-1001</p>
                  <p className="text-muted-foreground">Status: Shipped via UPS</p>
                  <p className="text-muted-foreground">ETA: Jan 2, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Enterprise-grade resolution, startup simple
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Zap,
              title: 'Intent Detection',
              description: 'AI + rules-based classification for WISMO, Returns, and more',
            },
            {
              icon: Shield,
              title: 'Policy Engine',
              description: 'Automatic checks for return windows, final sales, and delivery claims',
            },
            {
              icon: CheckCircle,
              title: 'Citations',
              description: 'Every claim backed by data sources - orders, tracking, policies',
            },
            {
              icon: BarChart3,
              title: 'Audit Trail',
              description: 'Append-only logs for compliance and quality assurance',
            },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, transparent pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              name: 'Free',
              price: '$0',
              features: ['50 resolutions/month', 'Demo mode', 'Basic policy engine'],
              cta: 'Get Started',
              popular: false,
            },
            {
              name: 'Starter',
              price: '$29',
              features: ['500 resolutions/month', 'Real integrations', 'Advanced policy engine', 'Analytics'],
              cta: 'Start Trial',
              popular: true,
            },
            {
              name: 'Growth',
              price: '$99',
              features: ['2000 resolutions/month', 'All integrations', 'Full policy engine', 'Priority support'],
              cta: 'Contact Sales',
              popular: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-xl border ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'}`}
            >
              {plan.popular && (
                <Badge className="mb-4">Most Popular</Badge>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="text-3xl font-bold mt-2">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" variant={plan.popular ? 'default' : 'outline'} asChild>
                <Link href="/app">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to resolve tickets faster?</h2>
        <p className="text-muted-foreground mb-8">
          Start for free. No credit card required. Works with demo data instantly.
        </p>
        <Button size="lg" asChild>
          <Link href="/app">
            Try it now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">S</span>
              </div>
              <span className="font-medium">SiteGPT</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Verified Resolution Agent for Shopify Merchants
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
