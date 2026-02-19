'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flame, LogOut, Star, User2, TrendingUp } from 'lucide-react'
import { FaCrown, FaFreeCodeCamp, FaCog, FaBolt, FaMagic, FaTicketAlt, FaTrophy, FaMedal } from 'react-icons/fa'
import Swal from 'sweetalert2'
import BottomNav from '@/components/bottom-nav'
import MatchCard from '@/components/match-card'
import { useAuth } from '@/lib/auth-context'
import { useFreeGames, useAllGames, useLeaderboard } from '@/lib/use-games'

const BOOKING_LABELS: Record<string, string> = {
  sportybet: 'SportyBet',
  bet9ja: 'Bet9ja',
  betway: 'Betway',
  bet365: 'Bet365',
  _1xbet: '1xBet',
}

export default function DashboardPage() {
  const { user, profile, loading, isPremium, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const freeHook = useFreeGames()
  const allHook = useAllGames()
  const { games, loading: gamesLoading } = isPremium ? allHook : freeHook
  const { entries: leaderboard } = useLeaderboard()

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

  const username = profile?.username ?? profile?.email?.split('@')[0] ?? user.email?.split('@')[0] ?? 'User'
  const gamesWithCodes = games.filter(g =>
    g.bookingCodes && Object.values(g.bookingCodes).some(Boolean)
  )

  const handleSignOut = async () => {
    const result = await Swal.fire({
      title: 'Sign out?',
      text: 'Are you sure you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, sign out',
      cancelButtonText: 'Cancel',
    })
    if (result.isConfirmed) {
      await signOut()
      router.push('/onboarding')
    }
  }

  return (
    <main className="min-h-screen bg-background pb-28 text-foreground">
      <div className="mx-auto max-w-md space-y-4 px-4 pt-5">

        {/* ── HERO HEADER CARD ────────────────────── */}
        <div className="rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-primary via-purple-500 to-violet-600 px-5 pt-5 pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Link href="/dashboard/profile">
                  <div className="h-9 w-9 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-white/40 transition cursor-pointer">
                    <img src="/logo.png" alt="Merlin" className="h-8 w-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                </Link>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/60">Welcome back</p>
                  <p className="text-sm font-bold text-white">{username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-amber-900">
                    <FaCrown className="h-3 w-3" /> VIP
                  </span>
                )}
                <button
                  onClick={handleSignOut}
                  className="rounded-xl bg-white/15 backdrop-blur p-2 text-white/80 hover:bg-white/25 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border border-t-0 rounded-b-3xl px-4 -mt-5 pb-5 pt-0">
            <div className="grid grid-cols-3 gap-2 -mt-4">
              {[
                { label: 'Plan', value: isPremium ? 'VIP' : 'Free', highlight: isPremium, icon: isPremium ? <FaCrown className="h-3 w-3 text-amber-500 inline mr-0.5" /> : <FaFreeCodeCamp className="h-3 w-3 text-emerald-500 inline mr-0.5" /> },
                { label: "Today's Picks", value: games.length.toString(), icon: <FaMagic className="h-3 w-3 text-primary inline mr-0.5" /> },
                { label: 'My Rank', value: (leaderboard.findIndex(e => e.username === username) + 1 || '—').toString(), icon: <FaTrophy className="h-3 w-3 text-amber-500 inline mr-0.5" /> },
              ].map(({ label, value, highlight, icon }) => (
                <div key={label} className={`rounded-2xl p-3 text-center border ${highlight ? 'bg-primary/8 border-primary/20' : 'bg-secondary border-border'}`}>
                  <p className={`text-sm font-extrabold ${highlight ? 'text-primary' : 'text-foreground'}`}>{icon}{value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ADMIN SHORTCUT ───────────────────── */}
        {isAdmin && (
          <Link href="/dashboard/admin">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 to-violet-50 px-4 py-3.5 flex items-center justify-between group hover:shadow-md transition">
              <div className="flex items-center gap-2.5">
                <FaCog className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-primary">Admin Panel</p>
                  <p className="text-[10px] text-muted-foreground">Post picks · manage VIP codes</p>
                </div>
              </div>
              <span className="text-xs text-primary/50 group-hover:translate-x-0.5 transition">→</span>
            </div>
          </Link>
        )}

        {/* ── UPGRADE BANNER ───────────────────── */}
        {!isPremium && (
          <Link href="/dashboard/premium">
            <div className="rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <FaCrown className="h-4 w-4 text-amber-900" />
                    <p className="text-sm font-extrabold text-amber-900">Unlock VIP Access</p>
                  </div>
                  <p className="text-xs text-amber-800/80">Full booking codes · all premium picks</p>
                </div>
                <span className="rounded-full bg-amber-900 px-3 py-1.5 text-[10px] font-bold text-amber-100 whitespace-nowrap">
                  Upgrade →
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* ── LIVE PICKS INDICATOR ────────────── */}
        <div className="flex items-center gap-2 px-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-semibold text-muted-foreground">
            {isPremium ? 'All picks live — booking codes unlocked' : "Today's free picks are live"}
          </p>
          <Flame className="h-3.5 w-3.5 text-orange-400 ml-auto" />
        </div>

        {/* ── 3D MATCH CARDS SCROLL ────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-extrabold flex items-center gap-1.5">
              <Star className="h-4 w-4 text-primary" />
              {isPremium ? 'All Picks' : 'Free Picks'}
            </h2>
            <Link href="/dashboard/matches" className="text-xs text-primary font-bold hover:underline">
              See all →
            </Link>
          </div>

          {gamesLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : games.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-border bg-card px-6 py-12 text-center space-y-2">
              <FaMagic className="h-8 w-8 text-primary/40 mx-auto animate-pulse" />
              <p className="text-base font-extrabold text-foreground">Merlin is analysing…</p>
              <p className="text-sm text-muted-foreground">No picks for now — wait for Merlin to predict</p>
              <p className="text-xs text-muted-foreground/60 italic mt-1">Check back soon</p>
            </div>
          ) : (
            <div className="mc-scroll-row">
              {games.map((game) => {
                const locked = game.tier === 'premium' && !isPremium
                return (
                  <MatchCard
                    key={game.id}
                    id={game.id}
                    fixture={game.fixture}
                    league={game.league}
                    sport={game.sport}
                    time={game.time}
                    prediction={game.prediction}
                    confidence={game.confidence}
                    tier={game.tier}
                    locked={locked}
                    bookingCodes={game.bookingCodes ?? {}}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* ── BOOKING CODES OF THE DAY ──────────── */}
        <section className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary/6 to-violet-50 px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaTicketAlt className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-extrabold">Booking Codes Today</h2>
            </div>
            {!isPremium && (
              <Link href="/dashboard/premium" className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2.5 py-1">
                Upgrade for all
              </Link>
            )}
          </div>

          <div className="p-4">
            {gamesWithCodes.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-1">
                <FaTicketAlt className="h-5 w-5 text-muted-foreground/30" />
                <p>No booking codes available yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gamesWithCodes.map((game) => (
                  <div key={game.id} className="rounded-2xl border border-border bg-background overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <div>
                        <p className="text-sm font-bold leading-tight">{game.fixture}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{game.league} · {game.time}</p>
                      </div>
                      {game.tier === 'premium' ? (
                        <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 whitespace-nowrap inline-flex items-center gap-0.5">
                          <FaCrown className="h-2.5 w-2.5" /> VIP
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">Free</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 p-3">
                      {Object.entries(game.bookingCodes ?? {})
                        .filter((e): e is [string, string] => typeof e[1] === 'string' && e[1].length > 0)
                        .map(([platform, code]) => (
                          <div key={platform} className="flex items-center justify-between rounded-xl bg-primary/6 border border-primary/12 px-3 py-2">
                            <span className="text-[10px] text-muted-foreground font-semibold">{BOOKING_LABELS[platform] ?? platform}</span>
                            <span className="text-xs font-extrabold text-primary tracking-wider font-mono">{code}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── PROFILE CARD ─────────────────────── */}
        <section className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-4 border-b border-border flex items-center gap-2">
            <User2 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-extrabold">My Profile</h2>
            <Link href="/dashboard/profile" className="ml-auto text-[10px] font-bold text-primary">Edit →</Link>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: 'Username', value: username },
              { label: 'Email', value: profile?.email ?? user.email ?? '—' },
              { label: 'Plan', value: isPremium ? 'VIP Premium' : 'Free', icon: isPremium ? <FaCrown className="h-3 w-3 text-amber-500 inline mr-1" /> : null },
              { label: 'Member since', value: 'Active' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <span className="text-xs font-bold text-foreground">{icon}{value}</span>
              </div>
            ))}
            {!isPremium && (
              <Link href="/dashboard/premium">
                <button className="w-full mt-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 py-2.5 text-xs font-extrabold text-amber-900 hover:opacity-90 transition flex items-center justify-center gap-1.5">
                  <FaBolt className="h-3 w-3" /> Upgrade to VIP — Unlock All Features
                </button>
              </Link>
            )}
          </div>
        </section>

        {/* ── MINI LEADERBOARD ─────────────────── */}
        {leaderboard.length > 0 && (
          <section className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4 border-b border-border flex items-center gap-2">
              <FaTrophy className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-extrabold">Top Predictors</h2>
              <Link href="/dashboard/leaderboard" className="ml-auto text-[10px] font-bold text-primary">Full rankings →</Link>
            </div>
            <div className="p-3 space-y-1.5">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={entry.id} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${i === 0 ? 'bg-amber-50 border border-amber-100' : 'bg-background border border-border'}`}>
                  <span className="text-base w-5 text-center">
                    {i === 0 ? <FaMedal className="h-4 w-4 text-amber-500 inline" /> : i === 1 ? <FaMedal className="h-4 w-4 text-slate-400 inline" /> : i === 2 ? <FaMedal className="h-4 w-4 text-amber-700 inline" /> : `#${i + 1}`}
                  </span>
                  <p className="text-xs font-bold flex-1 truncate">{entry.username}</p>
                  {entry.plan === 'premium' && <FaCrown className="h-3 w-3 text-amber-500" />}
                  <span className="text-xs font-extrabold text-primary">{entry.score} pts</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── QUICK NAV ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'All Matches', icon: <Star className="h-5 w-5" />, href: '/dashboard/matches', desc: 'Browse all picks' },
            { label: 'Leaderboard', icon: <TrendingUp className="h-5 w-5" />, href: '/dashboard/leaderboard', desc: 'See top predictors' },
          ].map(({ label, icon, href, desc }) => (
            <Link key={label} href={href}>
              <div className="rounded-3xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-md transition group h-full">
                <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary/15 transition">
                  {icon}
                </div>
                <p className="text-sm font-extrabold">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
      <BottomNav />
    </main>
  )
}
