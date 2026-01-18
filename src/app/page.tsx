import ChatWidget from '@/components/ChatWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-lg dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              SiteGPT
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Features
            </a>
            <a
              href="#demo"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Demo
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Pricing
            </a>
            <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-900/20" />
          <div className="absolute right-1/4 top-1/4 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-900/20" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            AI-Powered Support
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl lg:text-6xl">
            Turn your website into a
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {' '}conversation
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Add an intelligent AI chatbot to your website in minutes. Answer
            visitor questions, guide users, and provide 24/7 support without
            lifting a finger.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="w-full rounded-full bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 sm:w-auto">
              Start Free Trial
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-8 py-3 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 sm:w-auto">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
              Everything you need for website support
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Powerful features designed to help you provide exceptional visitor experiences
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Instant Responses"
              description="AI-powered answers in milliseconds. No more waiting for support tickets."
              iconPath="M13 10V3L4 14h7v7l9-11h-7z"
            />
            <FeatureCard
              title="Fully Customizable"
              description="Match your brand with custom colors, messages, and personality."
              iconPath="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
            <FeatureCard
              title="Smart Analytics"
              description="Track conversations, identify trends, and improve over time."
              iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
            <FeatureCard
              title="Secure & Private"
              description="Enterprise-grade security with data encryption and privacy controls."
              iconPath="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
            <FeatureCard
              title="Easy Integration"
              description="Add to any website with a simple code snippet. No coding required."
              iconPath="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
            <FeatureCard
              title="24/7 Availability"
              description="Never miss a visitor question, even outside business hours."
              iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="bg-zinc-100/50 px-4 py-24 dark:bg-zinc-800/20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
              Try it yourself
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Click the chat button in the bottom right corner to see SiteGPT in
              action. Ask questions about features, pricing, or anything else!
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    Chat widget is ready!
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Click the button in the corner to start chatting
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <PricingCard
              name="Starter"
              price="$0"
              description="Perfect for personal projects"
              features={['100 messages/month', '1 chatbot', 'Basic customization', 'Email support']}
              cta="Get Started"
            />
            <PricingCard
              name="Pro"
              price="$29"
              description="Best for growing businesses"
              features={['5,000 messages/month', '5 chatbots', 'Full customization', 'Priority support', 'Analytics dashboard', 'Custom training']}
              cta="Start Free Trial"
              highlighted
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large-scale deployments"
              features={['Unlimited messages', 'Unlimited chatbots', 'White-label solution', 'Dedicated support', 'SLA guarantee', 'Custom integrations']}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-4 py-12 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                SiteGPT
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              © 2025 SiteGPT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget
        siteName="SiteGPT Assistant"
        primaryColor="#6366f1"
        placeholder="Ask about features, pricing, or anything..."
        welcomeMessage="Hi there! I'm SiteGPT, your AI assistant. I can help you learn about our chatbot platform, answer questions about features and pricing, or guide you to the information you need. What would you like to know?"
      />
    </div>
  );
}

function FeatureCard({ title, description, iconPath }: { title: string; description: string; iconPath: string }) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-900 dark:hover:shadow-indigo-900/20">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  highlighted = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-8 ${
        highlighted
          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-600/25'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 px-4 py-1 text-sm font-medium text-white">
          Most Popular
        </div>
      )}
      <h3 className={`mb-2 text-xl font-semibold ${highlighted ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
        {name}
      </h3>
      <p className={`mb-4 text-sm ${highlighted ? 'text-indigo-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
        {description}
      </p>
      <div className="mb-6">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {price}
        </span>
        {price !== 'Custom' && (
          <span className={highlighted ? 'text-indigo-100' : 'text-zinc-500 dark:text-zinc-400'}>/month</span>
        )}
      </div>
      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${highlighted ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className={highlighted ? 'text-indigo-50' : 'text-zinc-600 dark:text-zinc-400'}>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`w-full rounded-full py-3 font-medium transition-colors ${
          highlighted ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {cta}
      </button>
    </div>
  );
}
