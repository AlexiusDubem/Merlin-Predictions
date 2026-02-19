'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Mail, User2 } from 'lucide-react'
import BottomNav from '@/components/bottom-nav'
import { useAuth } from '@/lib/auth-context'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function AccountDetailPage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()

    const [username, setUsername] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!loading && !user) router.push('/auth/login')
    }, [loading, user, router])

    useEffect(() => {
        if (profile?.username) setUsername(profile.username)
        else if (user?.email) setUsername(user.email.split('@')[0])
    }, [profile, user])

    const handleSave = async () => {
        if (!user || !username.trim()) return
        setSaving(true)
        setError('')
        try {
            await updateDoc(doc(db, 'users', user.uid), { username: username.trim() })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch {
            setError('Failed to save. Please try again.')
        }
        setSaving(false)
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

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/profile">
                        <button className="h-9 w-9 rounded-2xl bg-secondary flex items-center justify-center hover:bg-border transition">
                            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </Link>
                    <h1 className="text-lg font-extrabold tracking-tight">Account Details</h1>
                </div>

                {/* Form */}
                <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">

                    {/* Username */}
                    <div className="p-5 space-y-2">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <User2 className="h-3.5 w-3.5" /> Username
                        </label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your display name"
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/40 transition"
                            maxLength={30}
                        />
                        <p className="text-[10px] text-muted-foreground">This is how you appear on the leaderboard</p>
                    </div>

                    {/* Email (read-only) */}
                    <div className="p-5 space-y-2">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" /> Email address
                        </label>
                        <div className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground select-all">
                            {user.email}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Email cannot be changed here</p>
                    </div>

                    {/* Plan */}
                    <div className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground">Current Plan</p>
                            <p className="text-sm font-extrabold mt-0.5">
                                {profile?.plan === 'premium' ? '👑 VIP Premium' : '🆓 Free'}
                            </p>
                        </div>
                        {profile?.plan !== 'premium' && (
                            <Link href="/dashboard/premium">
                                <button className="rounded-2xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-amber-900 hover:opacity-90 transition">
                                    Upgrade
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving || !username.trim()}
                    className="w-full rounded-3xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                    {saved ? (
                        <><Check className="h-4 w-4 text-white" /> Saved!</>
                    ) : saving ? 'Saving…' : 'Save Changes'}
                </button>

            </div>
            <BottomNav />
        </main>
    )
}
