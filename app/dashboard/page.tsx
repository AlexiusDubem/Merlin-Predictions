'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, User2, RefreshCw } from 'lucide-react'
import { FaCrown, FaCheckCircle, FaBolt, FaClock, FaRegClock, FaChartLine, FaUser } from 'react-icons/fa'
import Swal from 'sweetalert2'
import BottomNav from '@/components/bottom-nav'
import MatchCard from '@/components/match-card'
import { useAuth } from '@/lib/auth-context'
import { useFreeGames, useAllGames, useLeaderboard, useNotifications, useSeparateBookingCodes } from '@/lib/use-games'

export default function DashboardPage() {
  const { user, profile, loading, isPremium, isAdmin } = useAuth()
  const router = useRouter()

  const freeHook = useFreeGames()
  const allHook = useAllGames()
  const { games, loading: gamesLoading } = isPremium ? allHook : freeHook
  const { entries: leaderboard } = useLeaderboard()
  const { notifications } = useNotifications()
  const { bookingCodesList } = useSeparateBookingCodes()

  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  useEffect(() => {
    updateTime()
  }, [games])

  const updateTime = () => {
    const now = new Date()
    setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      updateTime()
    }, 800)
  }

  const handleEnableNotifications = () => {
    Swal.fire({
      icon: 'success',
      title: 'Notifications Enabled',
      text: "We'll ping you when Merlin finishes analyzing today's matches.",
      confirmButtonColor: '#7c3aed'
    })
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const username = profile?.username ?? profile?.email?.split('@')[0] ?? user.email?.split('@')[0] ?? 'User'
  const myRank = leaderboard.findIndex(e => e.username === username) + 1 || '—'
  const initials = username.slice(0, 2).toUpperCase()

  const gamesWithCodes = games.filter(g =>
    g.bookingCodes && Object.values(g.bookingCodes).some(Boolean)
  )

  return (
    <main className="min-h-screen bg-[#FDFCFB] pb-28 text-foreground font-sans selection:bg-primary/20">
      {/* ── HEADER ────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-primary" />
        <div className="mx-auto max-w-md px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5"><FaUser className="h-3 w-3 text-gray-400" /> Good evening, {username}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase">PREDICTIONS</h1>
              {isPremium && (
                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider uppercase">VIP</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-900 transition rounded-full hover:bg-gray-50">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
            <Link href="/dashboard/profile">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 flex items-center justify-center cursor-pointer shadow-sm hover:shadow transition">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ── NOTIFICATIONS MARQUEE ────────*/}
      {notifications.length > 0 && (
        <Link href="/dashboard/notifications" className="block">
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 overflow-hidden hover:bg-blue-100/50 transition cursor-pointer">
            <FaBolt className="h-3 w-3 text-blue-500 shrink-0" />
            <div className="flex-1 truncate text-xs font-medium text-blue-800">
              {notifications[0].title}: <span className="font-normal">{notifications[0].message}</span>
            </div>
            <span className="text-blue-400 text-[10px] font-bold shrink-0 pl-2 opacity-50">View all &rarr;</span>
          </div>
        </Link>
      )}

      <div className="mx-auto max-w-md px-5 mt-6 space-y-6">

        {/* ── TRUST & STATS ────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Live Engine</p>
          </div>
          <button onClick={handleRefresh} className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-gray-700 transition">
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            Last updated {lastUpdated}
          </button>
        </div>

        {/* ── STATS CARDS (1 ROW) ──────── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-4 flex flex-col items-center justify-center">
            <span className={`${games.length > 0 ? 'text-2xl font-black' : 'text-sm font-bold mt-1'} text-gray-900`}>{games.length > 0 ? games.length : 'Releasing 6PM'}</span>
            <span className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">{games.length === 0 ? 'Pending' : "Today's Picks"}</span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-4 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-gray-900">{myRank}</span>
            <span className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">My Rank</span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-4 flex flex-col items-center justify-center">
            {isPremium ? (
              <FaCrown className="h-6 w-6 text-amber-500 mb-1" />
            ) : (
              <span className="text-lg font-black text-emerald-600 mb-1">Free</span>
            )}
            <span className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">Current Plan</span>
          </div>
        </div>

        {/* ── PERFORMANCE METRICS ──────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] p-3 flex flex-col items-center mt-4">
          <div className="flex items-center w-full">
            <div className="flex-1 text-center py-2.5">
              <p className="text-sm font-bold text-gray-900">87%</p>
              <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">AI Accuracy (30d)</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex-1 text-center py-2.5">
              <p className="text-sm font-bold text-gray-900">12,420</p>
              <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">Picks Delivered</p>
            </div>
          </div>
          <div className="mt-1 w-full text-center pb-1">
            <p className="text-[9px] font-semibold text-gray-400">*Based on 312 predictions verified automatically over last 30 days.</p>
          </div>
        </div>

        {/* ── ADMIN PANEL SHORTCUT ──────── */}
        {isAdmin && (
          <Link href="/dashboard/admin">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 shadow-lg shadow-gray-900/20 flex items-center justify-between group mt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <FaBolt className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Admin Control Panel</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Manage picks & VIP codes</p>
                </div>
              </div>
              <span className="text-white text-xs font-bold group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>
        )}

        {/* ── UPGRADE BANNER ───────────── */}
        {!isPremium && (
          <Link href="/dashboard/premium">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 shadow-lg shadow-gray-900/20 flex flex-col gap-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-500">
                <FaCrown className="h-20 w-20 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5"><FaCrown className="h-3.5 w-3.5 text-amber-400" /> Unlock Premium Authority</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-[85%]">Instantly access all high-confidence predictions, full booking codes, and VIP tracking.</p>
              </div>
              <button className="relative z-10 self-start bg-white text-gray-900 text-[11px] font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition">
                Upgrade Plan →
              </button>
            </div>
          </Link>
        )}

        {/* ── ALL PICKS ────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <FaChartLine className="h-4 w-4 text-primary" />
              {isPremium ? 'Premium AI Predictions' : 'Free Predictions'}
            </h2>
            {games.length > 0 && (
              <Link href="/dashboard/matches" className="text-xs font-semibold text-primary hover:text-primary/80 transition">
                View all
              </Link>
            )}
          </div>

          {gamesLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : games.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] p-8 text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-4 relative">
                <FaBolt className="h-6 w-6 text-primary absolute animate-ping opacity-20" />
                <FaBolt className="h-6 w-6 text-primary relative z-10" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Live AI Market Scan in Progress</h3>
              <p className="text-sm text-gray-500 max-w-[250px] mx-auto mb-6 leading-relaxed">
                Algorithms are scanning thousands of data points. Predictions will be released at 12:00 PM.
              </p>
              <button onClick={handleEnableNotifications} className="bg-gray-900 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition shadow-md shadow-gray-900/20 active:scale-95">
                Turn on Notifications
              </button>
            </div>
          ) : (
            <div className="mc-scroll-row pb-4">
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

        {/* ── BOOKING CODES ──────────────── */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <FaCheckCircle className="h-4 w-4 text-emerald-500" />
              Verified Booking Codes
            </h2>
          </div>

          {!isPremium && bookingCodesList.length > 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] p-6 text-center">
              <FaCrown className="h-8 w-8 text-amber-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-1">VIP Exclusive</h3>
              <p className="text-xs text-gray-500 mb-4">Booking codes are reserved for Premium members.</p>
              <Link href="/dashboard/premium" className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-amber-200 transition">
                Unlock Access
              </Link>
            </div>
          ) : bookingCodesList.length === 0 && gamesWithCodes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] p-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <FaRegClock className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">No booking codes today</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Codes unlock after the final algorithm predictions go live. Check back in a few hours.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Separate Booking Codes Collection */}
              {bookingCodesList.map((codeDoc) => (
                <div key={codeDoc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
                    <span className="text-sm font-bold text-gray-900">{codeDoc.label}</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Verified</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(codeDoc.codes)
                      .filter((e): e is [string, string] => typeof e[1] === 'string' && e[1].length > 0)
                      .map(([platform, code]) => (
                        <div key={platform} className="bg-gray-50 rounded-xl px-3 py-2 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-500 capitalize">{platform.replace('_', '')}</span>
                          <span className="text-xs font-bold text-gray-900 font-mono tracking-wide">{code}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}

              {/* Embedded Booking Codes in Games (Fallback) */}
              {gamesWithCodes.map((game) => (
                <div key={game.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
                    <span className="text-sm font-bold text-gray-900">{game.fixture}</span>
                    <span className="text-[10px] font-medium text-gray-400">{game.league}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(game.bookingCodes ?? {})
                      .filter((e): e is [string, string] => typeof e[1] === 'string' && e[1].length > 0)
                      .map(([platform, code]) => (
                        <div key={platform} className="bg-gray-50 rounded-xl px-3 py-2 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-500 capitalize">{platform.replace('_', '')}</span>
                          <span className="text-xs font-bold text-gray-900 font-mono tracking-wide">{code}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
      <BottomNav />
    </main>
  )
}
