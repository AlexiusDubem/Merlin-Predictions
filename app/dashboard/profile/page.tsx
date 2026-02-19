'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, ChevronRight, LogOut,
    User2, LayoutList
} from 'lucide-react'
import { FaCrown, FaStar, FaMedal, FaBolt, FaBell, FaShieldAlt, FaChartLine } from 'react-icons/fa'
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

    const showComingSoon = (feature: string) => {
        Swal.fire({
            icon: 'info',
            title: `${feature}`,
            text: 'This feature is coming soon!',
            confirmButtonColor: '#7c3aed',
            timer: 2500,
        })
    }

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
        <main className="min-h-screen bg-background pb-28 text-foreground">
            <div className="mx-auto max-w-md px-4 pt-5 space-y-4">

                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <button className="h-9 w-9 rounded-2xl bg-secondary flex items-center justify-center hover:bg-border transition">
                            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </Link>
                    <h1 className="text-lg font-extrabold tracking-tight">My Profile</h1>
                </div>

                {/* AVATAR HERO CARD */}
                <div className="rounded-3xl overflow-hidden border border-border shadow-sm">
                    <div className="bg-gradient-to-br from-primary via-violet-500 to-purple-600 h-24 relative">
                        <div className="absolute -bottom-10 left-5">
                            <div className="h-20 w-20 rounded-3xl border-4 border-card bg-gradient-to-br from-primary/40 to-violet-500/40 flex items-center justify-center shadow-lg">
                                <span className="text-3xl font-extrabold text-white">{initials}</span>
                            </div>
                        </div>
                        {isPremium && (
                            <div className="absolute top-3 right-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm">
                                    <FaCrown className="h-3 w-3" /> VIP
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="bg-card pt-14 pb-5 px-5">
                        <h2 className="text-xl font-extrabold tracking-tight">{username}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{email}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border ${isPremium ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-secondary text-muted-foreground border-border'}`}>
                                {isPremium ? <><FaCrown className="h-2.5 w-2.5" /> VIP Premium</> : 'Free Plan'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-xs font-bold">
                                <FaBolt className="h-2.5 w-2.5" /> Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: <LayoutList className="h-4 w-4 text-primary" />, label: "Today's Picks", value: String(totalPicks) },
                        { icon: <FaBolt className="h-4 w-4 text-orange-500" />, label: 'Win Streak', value: String(myStreak) },
                        { icon: <FaMedal className="h-4 w-4 text-amber-500" />, label: 'My Rank', value: myRank },
                    ].map(({ icon, label, value }) => (
                        <div key={label} className="rounded-3xl border border-border bg-card shadow-sm p-4 text-center">
                            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">{icon}</div>
                            <p className="text-base font-extrabold">{value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
                        </div>
                    ))}
                </div>

                {/* PLAN CARD */}
                {!isPremium ? (
                    <Link href="/dashboard/premium">
                        <div className="rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:opacity-95 transition">
                            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-5 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <FaCrown className="h-5 w-5 text-amber-900" />
                                        <p className="text-base font-extrabold text-amber-900">Upgrade to VIP</p>
                                    </div>
                                    <p className="text-sm text-amber-800/80">Unlock booking codes + all premium picks</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-amber-900/60 shrink-0" />
                            </div>
                        </div>
                    </Link>
                ) : (
                    <div className="rounded-3xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 flex items-center gap-3 shadow-sm">
                        <div className="h-11 w-11 rounded-2xl bg-amber-400/20 flex items-center justify-center shrink-0">
                            <FaCrown className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-amber-800">VIP Member</p>
                            <p className="text-xs text-amber-700/70">Full access to all premium predictions & codes</p>
                        </div>
                    </div>
                )}

                {/* MENU LIST */}
                <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
                    <Link href="/dashboard/profile/account">
                        <div className="flex items-center gap-3 px-4 py-4 hover:bg-secondary/40 transition group cursor-pointer">
                            <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                <User2 className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">Account Details</p>
                                <p className="text-xs text-muted-foreground">Username & email</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition shrink-0" />
                        </div>
                    </Link>

                    <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/40 transition group" onClick={() => showComingSoon('Notifications')}>
                        <div className="h-9 w-9 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                            <FaBell className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold">Notifications</p>
                            <p className="text-xs text-muted-foreground">Alerts & updates</p>
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground/50 border border-border rounded-full px-2 py-0.5 shrink-0">Soon</span>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/40 transition group" onClick={() => showComingSoon('Security')}>
                        <div className="h-9 w-9 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                            <FaShieldAlt className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold">Security</p>
                            <p className="text-xs text-muted-foreground">Password & privacy</p>
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground/50 border border-border rounded-full px-2 py-0.5 shrink-0">Soon</span>
                    </button>

                    <Link href="/dashboard/matches">
                        <div className="flex items-center gap-3 px-4 py-4 hover:bg-secondary/40 transition group cursor-pointer">
                            <div className="h-9 w-9 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0">
                                <FaStar className="h-4 w-4 text-violet-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">All Picks</p>
                                <p className="text-xs text-muted-foreground">Browse today's predictions</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition shrink-0" />
                        </div>
                    </Link>

                    <Link href="/dashboard/leaderboard">
                        <div className="flex items-center gap-3 px-4 py-4 hover:bg-secondary/40 transition group cursor-pointer">
                            <div className="h-9 w-9 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                                <FaChartLine className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">Leaderboard</p>
                                <p className="text-xs text-muted-foreground">My rank: <span className="font-bold text-primary">{myRank}</span></p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition shrink-0" />
                        </div>
                    </Link>

                    {!isPremium && (
                        <Link href="/dashboard/premium">
                            <div className="flex items-center gap-3 px-4 py-4 hover:bg-amber-50/60 transition group cursor-pointer">
                                <div className="h-9 w-9 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                                    <FaCrown className="h-4 w-4 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-amber-700">Upgrade to VIP</p>
                                    <p className="text-xs text-amber-600/70">Unlock all premium features</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-amber-400/60 group-hover:text-amber-500 transition shrink-0" />
                            </div>
                        </Link>
                    )}
                </div>

                <button onClick={handleSignOut} className="w-full rounded-3xl border border-red-100 bg-red-50 text-red-600 py-4 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 active:scale-[0.98] transition">
                    <LogOut className="h-4 w-4" /> Sign Out
                </button>

                <p className="text-center text-[10px] text-muted-foreground/50 pb-2">Merlin Predictions · v1.0</p>
            </div>
            <BottomNav />
        </main>
    )
}
