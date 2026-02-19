'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, BarChart2, Shield } from 'lucide-react'

const features = [
  { icon: Zap, label: 'Free picks', desc: 'Instantly visible in your feed' },
  { icon: Shield, label: 'Premium EV', desc: 'Locked behind subscription' },
  { icon: BarChart2, label: 'Leaderboards', desc: 'Track streaks & badges daily' },
]

export default function OnboardingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center justify-center">
            <img src="/logo.png" alt="Merlin" className="h-24 w-24 object-contain drop-shadow-xl" />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Sports Predictions
          </p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-foreground">
            MERLIN
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Predict smarter with free picks, premium EV,<br />streaks & gamified leaderboards.
          </p>
        </div>

        {/* Feature cards */}
        <div className="space-y-2">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3 backdrop-blur"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link href="/auth/sign-up" className="block">
            <Button className="brand-gradient w-full rounded-2xl py-6 text-base font-bold shadow-lg shadow-primary/25">
              Get Started — It&apos;s Free
            </Button>
          </Link>
          <Link href="/auth/login" className="block">
            <Button variant="outline" className="w-full rounded-2xl py-5">
              I already have an account
            </Button>
          </Link>
          <Link
            href="/dashboard"
            className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse as guest →
          </Link>
        </div>
      </div>
    </main>
  )
}
