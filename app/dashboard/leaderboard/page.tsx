'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FaTrophy, FaCrown, FaMedal, FaBolt } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import BottomNav from '@/components/bottom-nav'
import { useAuth } from '@/lib/auth-context'
import { useLeaderboard } from '@/lib/use-games'

export default function LeaderboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { entries, loading: lbLoading } = useLeaderboard()

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
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Rankings</p>
            <h1 className="text-xl font-extrabold tracking-tight">
              <span className="text-primary">Leader</span>board
            </h1>
          </div>
        </header>

        {/* Top 3 podium */}
        {!lbLoading && entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[entries[1], entries[0], entries[2]].map((entry, i) => {
              const rank = i === 0 ? 2 : i === 1 ? 1 : 3
              const heights = { 1: 'h-24', 2: 'h-20', 3: 'h-16' }
              const colors = {
                1: 'bg-amber-400 text-amber-900',
                2: 'bg-slate-200 text-slate-700',
                3: 'bg-amber-700/30 text-amber-900',
              }
              const medals = {
                1: <FaMedal className="h-5 w-5 text-amber-600" />,
                2: <FaMedal className="h-5 w-5 text-slate-500" />,
                3: <FaMedal className="h-5 w-5 text-amber-800" />,
              }
              return (
                <div key={entry.id} className={`flex flex-col items-center gap-1 ${rank === 1 ? '-mt-3' : ''}`}>
                  <div className={`w-full rounded-2xl ${colors[rank as 1 | 2 | 3]} flex flex-col items-center justify-end pb-3 pt-4 ${heights[rank as 1 | 2 | 3]}`}>
                    {medals[rank as 1 | 2 | 3]}
                    <p className="text-xs font-bold truncate max-w-full px-1">{entry.username}</p>
                    <p className="text-[10px] font-semibold">{entry.score} pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Full leaderboard */}
        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaTrophy className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">All Participants</h2>
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Live
            </span>
          </div>

          {lbLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FaTrophy className="h-8 w-8 text-muted-foreground/30 mx-auto animate-pulse" />
              <p className="text-base font-extrabold text-foreground">No rankings yet</p>
              <p className="text-sm text-muted-foreground">Be the first to make predictions and climb the board!</p>
              <p className="text-xs text-muted-foreground/60 italic">Rankings update live</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition ${entry.rank === 1
                    ? 'border-amber-200 bg-amber-50'
                    : entry.rank === 2
                      ? 'border-slate-200 bg-slate-50'
                      : entry.rank === 3
                        ? 'border-amber-100 bg-orange-50'
                        : 'border-border bg-background'
                    }`}
                >
                  <span className="text-lg w-7 text-center">
                    {entry.rank === 1 ? <FaMedal className="h-4 w-4 text-amber-500 inline" />
                      : entry.rank === 2 ? <FaMedal className="h-4 w-4 text-slate-400 inline" />
                        : entry.rank === 3 ? <FaMedal className="h-4 w-4 text-amber-700 inline" />
                          : `#${entry.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold truncate">{entry.username}</p>
                      {entry.plan === 'premium' && <FaCrown className="h-3 w-3 text-amber-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <FaBolt className="h-2.5 w-2.5 text-orange-400" /> {entry.streak} streak
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">{entry.score}</p>
                    <p className="text-[10px] text-muted-foreground">pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* How scores work */}
        <section className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground flex items-center gap-1">
            <FaBolt className="h-3.5 w-3.5 text-primary" /> How points work
          </p>
          <p>+10 pts per correct prediction · +5 pts streak bonus · Premium members get ×2 on streak bonuses</p>
        </section>

      </div>
      <BottomNav />
    </main>
  )
}
