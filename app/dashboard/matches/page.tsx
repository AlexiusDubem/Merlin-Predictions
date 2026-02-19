'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { FaFire, FaCrown, FaMagic, FaLock } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import BottomNav from '@/components/bottom-nav'
import { useAuth } from '@/lib/auth-context'
import { useFreeGames, useAllGames } from '@/lib/use-games'

const BOOKING_LABELS: Record<string, string> = {
  sportybet: 'SportyBet',
  bet9ja: 'Bet9ja',
  betway: 'Betway',
  bet365: 'Bet365',
  _1xbet: '1xBet',
}

function ConfidenceBar({ value, locked }: { value: number; locked: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Confidence</span>
        {!locked && <span className="font-semibold text-primary">{value}%</span>}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${locked ? 'bg-muted-foreground/30' : 'bg-primary'}`} style={{ width: locked ? '100%' : `${value}%` }} />
      </div>
    </div>
  )
}

export default function MatchesPage() {
  const { user, loading, isPremium } = useAuth()
  const router = useRouter()
  const freeHook = useFreeGames()
  const allHook = useAllGames()
  const { games, loading: gamesLoading } = isPremium ? allHook : freeHook

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-24 text-foreground">
      <div className="mx-auto max-w-md space-y-4 px-4 pt-6">

        <header className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button size="icon" variant="ghost" className="rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Browse</p>
            <h1 className="text-xl font-extrabold tracking-tight"><span className="text-primary">Match</span> Feed</h1>
          </div>
        </header>

        <article className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 to-primary/5 p-4">
          <div className="flex items-center gap-2">
            <FaFire className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">
              {isPremium ? 'All picks with full booking codes' : 'Free picks — upgrade for booking codes'}
            </p>
          </div>
        </article>

        {gamesLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card px-6 py-14 text-center space-y-2">
            <FaMagic className="h-8 w-8 text-primary/40 mx-auto animate-pulse" />
            <p className="text-base font-extrabold text-foreground">Merlin is analysing…</p>
            <p className="text-sm text-muted-foreground">No picks for now — wait for Merlin to predict</p>
            <p className="text-xs text-muted-foreground/60 italic">New predictions drop daily</p>
          </div>
        ) : (
          <section className="space-y-4">
            {games.map((game) => {
              const isLocked = game.tier === 'premium' && !isPremium
              const codes = Object.entries(game.bookingCodes ?? {}).filter((e): e is [string, string] => typeof e[1] === 'string' && e[1].length > 0)

              return (
                <div key={game.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{game.fixture}</p>
                      <p className="text-xs text-muted-foreground">{game.league} · {game.time}</p>
                    </div>
                    {game.tier === 'premium' ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <FaCrown className="h-2.5 w-2.5" /> Premium
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Free</span>
                    )}
                  </div>

                  <p className="text-sm">
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                        <FaLock className="h-3 w-3" /> Subscribe to unlock full prediction
                      </span>
                    ) : (
                      <span className="font-medium">{game.prediction}</span>
                    )}
                  </p>

                  <ConfidenceBar value={game.confidence} locked={isLocked} />

                  {!isLocked && codes.length > 0 && (
                    <div className="rounded-xl border border-border bg-background/50 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Booking Codes</p>
                      <div className="flex flex-col gap-1.5">
                        {codes.map(([platform, code]) => (
                          <div key={platform} className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">{BOOKING_LABELS[platform] ?? platform}</span>
                            <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary tracking-wider">{code}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <Link href="/dashboard/premium">
                      <button className="w-full rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-700 flex items-center justify-center gap-1">
                        <FaCrown className="h-3 w-3" /> Upgrade to see booking codes
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </button>
                    </Link>
                  )}
                </div>
              )
            })}
          </section>
        )}
      </div>
      <BottomNav />
    </main>
  )
}
