'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, ChevronRight, LogOut,
    User2, LayoutList
} from 'lucide-react'
import { FaCrown, FaStar, FaMedal, FaBolt, FaChartLine, FaBell } from 'react-icons/fa'
import Swal from 'sweetalert2'
import BottomNav from '@/components/bottom-nav'
import { useAuth } from '@/lib/auth-context'
import { useAllGames, useLeaderboard } from '@/lib/use-games'

export default function ProfilePage() {
    const { user, profile, loading, isPremium, signOut } = useAuth()
    const router = useRouter()
    const { games } = useAllGames()
    const { entries } = useLeaderboard()

    useEffect(() => {
        if (!loading && !user) router.push('/auth/login')
    }, [loading, user, router])

    const username = profile?.username ?? profile?.email?.split('@')[0] ?? user?.email?.split('@')[0] ?? 'User'
    const email = profile?.email ?? user?.email ?? ''
    const initials = username.slice(0, 2).toUpperCase()

    const myEntry = entries.find(e => e.username === username || e.username === email)
    const myRank = myEntry ? `#${myEntry.rank}` : entries.length > 0 ? `#${entries.length + 1}` : '—'
    const myStreak = myEntry?.streak ?? 0
    const totalPicks = games.length

    const handleSignOut = async () => {
        const result = await Swal.fire({
            title: 'Sign out?',
            text: 'Are you sure you want to sign out?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, sign out',
        })
        if (result.isConfirmed) {
            await signOut()
            router.push('/onboarding')
        }
    }

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#FDFCFB] pb-28 text-foreground font-sans selection:bg-primary/20">
            <div className="mx-auto max-w-md px-5 pt-5 space-y-5">

                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <button className="h-9 w-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition">
                            <ArrowLeft className="h-4 w-4 text-gray-500" />
                        </button>
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">Profile</h1>
                </div>

                {/* AVATAR HERO CARD */}
                <div className="rounded-3xl overflow-hidden shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] bg-white border border-gray-100">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 h-16 relative flex items-center px-4">
                        {isPremium && (
                            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-1 text-[9px] font-bold text-amber-900 shadow-md uppercase tracking-wider">
                                <FaCrown className="h-3 w-3" /> VIP Profile
                            </span>
                        )}
                    </div>
                    <div className="px-5 pb-5 relative">
                        <div className="absolute -top-10 left-5">
                            <div className="h-20 w-20 rounded-2xl border-4 border-white bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-md">
                                <span className="text-3xl font-black text-white">{initials}</span>
                            </div>
                        </div>
                        <div className="pt-12">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{username}</h2>
                            <p className="text-sm text-gray-400 mt-0.5 truncate">{email}</p>

                            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100">
                                <div className="flex-1">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Member since</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">Feb 2026</p>
                                </div>
                                <div className="w-px h-8 bg-gray-100" />
                                <div className="flex-1 text-center">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Picks Used</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">84</p>
                                </div>
                                <div className="w-px h-8 bg-gray-100" />
                                <div className="flex-1 text-right">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Win Rate</p>
                                    <p className="text-sm font-black text-emerald-600 mt-0.5">85%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PLAN CARD */}
                {!isPremium ? (
                    <Link href="/dashboard/premium">
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] flex items-center justify-between group">
                            <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <FaCrown className="h-4 w-4 text-amber-500" />
                                    <p className="text-sm font-bold text-gray-900">Upgrade to VIP</p>
                                </div>
                                <p className="text-[11px] font-medium text-gray-400">Unlock booking codes & predictions</p>
                            </div>
                            <button className="bg-gray-900 text-white text-[11px] font-bold px-4 py-2 rounded-xl shadow-sm group-hover:bg-gray-800 transition">
                                Upgrade Plan
                            </button>
                        </div>
                    </Link>
                ) : (
                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)]">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 text-amber-500 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                    <FaCrown className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">VIP Subscription</p>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Active Member</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Plan</p>
                                <p className="text-sm font-black text-gray-900 mt-0.5">$39/mo</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Next Renewal</p>
                                <p className="text-xs font-bold text-gray-900 mt-0.5">In 24 days</p>
                            </div>
                            <Link href="/dashboard/premium">
                                <button className="bg-amber-50 text-amber-800 border border-amber-100 text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-100 transition shadow-sm">
                                    Manage Plan
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* STATS */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: <LayoutList className="h-4 w-4 text-gray-900" />, label: "Today's Picks", value: String(totalPicks) },
                        { icon: <FaBolt className="h-4 w-4 text-orange-500" />, label: 'Win Streak', value: String(myStreak) },
                        { icon: <FaMedal className="h-4 w-4 text-amber-500" />, label: 'My Rank', value: myRank },
                    ].map(({ icon, label, value }) => (
                        <div key={label} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 text-center flex flex-col items-center">
                            <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center mb-2">{icon}</div>
                            <p className="text-base font-black text-gray-900">{value}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* MENU LIST */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden divide-y divide-gray-50">
                    <Link href="/dashboard/notifications">
                        <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition group cursor-pointer">
                            <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                <FaBell className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900">Notifications</p>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">Alerts & updates</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition shrink-0" />
                        </div>
                    </Link>

                    <Link href="/dashboard/matches">
                        <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition group cursor-pointer">
                            <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                                <FaStar className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900">All Picks</p>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">Browse today's predictions</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition shrink-0" />
                        </div>
                    </Link>

                    <Link href="/dashboard/leaderboard">
                        <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition group cursor-pointer">
                            <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                                <FaChartLine className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900">Leaderboard</p>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">My global ranking: <span className="font-bold text-primary">{myRank}</span></p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition shrink-0" />
                        </div>
                    </Link>

                    {!isPremium && (
                        <Link href="/dashboard/premium">
                            <div className="flex items-center gap-3 px-5 py-4 hover:bg-amber-50/50 transition group cursor-pointer">
                                <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                                    <FaCrown className="h-4 w-4 text-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900">Unlock VIP</p>
                                    <p className="text-xs font-medium text-amber-700/70 mt-0.5">Access exclusive premium picks</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-amber-200 group-hover:text-amber-500 transition shrink-0" />
                            </div>
                        </Link>
                    )}
                </div>

                <button onClick={handleSignOut} className="w-full rounded-2xl border border-gray-200 bg-white text-gray-600 py-3.5 text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.98] transition shadow-sm mt-4">
                    <LogOut className="h-3.5 w-3.5" /> Secure Sign Out
                </button>

                <p className="text-center text-[10px] text-gray-400 font-medium pb-4 pt-2">Merlin Predictions · v1.0</p>
            </div>
            <BottomNav />
        </main>
    )
}
