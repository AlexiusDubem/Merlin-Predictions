'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, MessageCircle } from 'lucide-react'
import { FaCrown, FaCreditCard, FaKey } from 'react-icons/fa'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import BottomNav from '@/components/bottom-nav'
import { useAuth } from '@/lib/auth-context'
import { redeemVipCode } from '@/lib/vip-codes'

const WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? ''

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: ['Free daily picks', 'View predictions', 'Leaderboard access'],
    tier: 'free' as const,
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/mo',
    features: [
      'All free picks',
      'Premium predictions',
      'Full booking codes (SportyBet, Bet9ja, Betway, Bet365, 1xBet)',
      'Early access picks',
      'Priority support',
    ],
    tier: 'premium' as const,
    recommended: true,
  },
]

export default function PremiumPage() {
  const { user, loading, isPremium, profile } = useAuth()
  const router = useRouter()
  const [vipCode, setVipCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi! I want to upgrade to Merlin Predictions Premium. My account email: ${profile?.email ?? user?.email ?? ''}`
    )
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
  }

  const handleRedeem = async () => {
    if (!vipCode.trim() || !user) return
    setRedeeming(true)
    const result = await redeemVipCode(vipCode.trim().toUpperCase(), user.uid)
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Premium Unlocked!',
        text: 'Welcome to VIP! Enjoy full access to all predictions & booking codes.',
        confirmButtonColor: '#7c3aed',
      })
      setVipCode('')
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Code',
        text: result.error ?? 'Something went wrong. Try again.',
        confirmButtonColor: '#7c3aed',
      })
    }
    setRedeeming(false)
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-24 text-foreground">
      <div className="mx-auto max-w-md space-y-5 px-4 pt-6">

        <header className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button size="icon" variant="ghost" className="rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Upgrade</p>
            <h1 className="text-xl font-extrabold tracking-tight"><span className="text-primary">Premium</span> Plans</h1>
          </div>
        </header>

        {isPremium && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
            <FaCrown className="mx-auto mb-2 h-8 w-8 text-amber-500" />
            <p className="font-bold text-amber-800">You&apos;re a VIP Member!</p>
            <p className="mt-1 text-xs text-amber-700/70">Full access to all picks, premium predictions, and booking codes.</p>
          </div>
        )}

        {plans.map((plan) => {
          const isCurrentPlan = profile?.plan === plan.tier
          return (
            <div key={plan.name}
              className={`rounded-3xl border p-5 transition-all ${plan.recommended
                ? 'border-primary/60 bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-border bg-card'
                }`}
            >
              {plan.recommended && (
                <p className="mb-3 text-[10px] uppercase tracking-widest text-primary font-semibold flex items-center gap-1">
                  <FaCrown className="h-3 w-3" /> Most Popular
                </p>
              )}
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-lg font-extrabold">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.recommended ? 'Full access + booking codes' : 'Get started for free'}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-1.5 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <div className="rounded-2xl bg-secondary py-2.5 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1">
                  <Check className="h-3 w-3" /> Current Plan
                </div>
              ) : plan.recommended && !isPremium ? (
                <button
                  onClick={handleWhatsApp}
                  className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  <MessageCircle className="h-4 w-4" /> Pay via WhatsApp
                </button>
              ) : null}
            </div>
          )
        })}

        {!isPremium && (
          <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <FaCreditCard className="h-3.5 w-3.5 text-primary" /> How to Subscribe
            </h2>
            <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
              <li>Click <strong className="text-foreground">&quot;Pay via WhatsApp&quot;</strong> above</li>
              <li>Admin receives your message &amp; sends account number</li>
              <li>Make payment &amp; send proof to admin</li>
              <li>Admin verifies &amp; sends you a <strong className="text-foreground">VIP Code</strong></li>
              <li>Enter the code below to unlock Premium instantly</li>
            </ol>
          </div>
        )}

        {!isPremium && (
          <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <FaKey className="h-3.5 w-3.5 text-amber-600" /> Redeem VIP Code
            </h2>
            <p className="text-xs text-muted-foreground">Received a code from the admin after payment? Enter it here.</p>
            <div className="flex gap-2">
              <input
                value={vipCode}
                onChange={(e) => setVipCode(e.target.value.toUpperCase())}
                placeholder="e.g. MERLIN8X"
                maxLength={12}
                className="flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-mono font-bold tracking-wider outline-none ring-primary/50 transition focus:ring-2 uppercase"
              />
              <button
                onClick={handleRedeem}
                disabled={redeeming || !vipCode.trim()}
                className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
              >
                {redeeming ? '…' : 'Redeem'}
              </button>
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </main>
  )
}
