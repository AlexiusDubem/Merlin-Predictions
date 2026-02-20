'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FaBell, FaBolt } from 'react-icons/fa'
import BottomNav from '@/components/bottom-nav'
import { useAuth } from '@/lib/auth-context'
import { useNotifications } from '@/lib/use-games'

export default function NotificationsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const { notifications, loading: notifsLoading } = useNotifications()

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
        <main className="min-h-screen bg-[#FDFCFB] pb-28 text-foreground font-sans selection:bg-primary/20">
            <div className="mx-auto max-w-md px-5 pt-5 space-y-5">

                {/* ── HEADER ────────────── */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <button className="h-9 w-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition">
                            <ArrowLeft className="h-4 w-4 text-gray-500" />
                        </button>
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">Notifications</h1>
                </div>

                {/* ── ALERTS LIST ────────────── */}
                <div className="space-y-3 mt-4">
                    {notifsLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] p-8 text-center flex flex-col items-center">
                            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                                <FaBell className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-2">No New Alerts</h3>
                            <p className="text-sm text-gray-500 max-w-[250px] mx-auto leading-relaxed">
                                You are completely caught up. We will notify you when predictions or important updates drop.
                            </p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div key={n.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-4 flex gap-4 items-start relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl"></div>
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <FaBolt className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="text-sm font-bold text-gray-900">{n.title}</h3>
                                        <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap ml-2">
                                            {n.createdAt.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                        {n.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <BottomNav />
        </main>
    )
}
