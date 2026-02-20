'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Copy, Check, LayoutDashboard } from 'lucide-react'
import { FaPlus, FaKey, FaClipboardList, FaCrown, FaBullseye, FaPaperPlane, FaReceipt, FaBell } from 'react-icons/fa'
import Swal from 'sweetalert2'
import { useAuth } from '@/lib/auth-context'
import {
  postGame, deactivateGame, useAllGames,
  postSeparateBookingCode, deleteBookingCode, useSeparateBookingCodes,
  postNotification, deleteNotification, useNotifications
} from '@/lib/use-games'
import { createVipCode, generateVipCode } from '@/lib/vip-codes'

const SPORTS = ['Football', 'Basketball', 'Tennis', 'American Football', 'Baseball', 'Ice Hockey', 'Other']
const LEAGUES = ['EPL', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'UEFA CL', 'NBA', 'NFL', 'ATP', 'Other']

const EMPTY_GAME_FORM = {
  fixture: '', league: 'EPL', sport: 'Football', time: '',
  tier: 'free' as 'free' | 'premium', prediction: '', confidence: 75,
}

const EMPTY_CODE_FORM = {
  label: '', tier: 'free' as 'free' | 'premium',
  sportybet: '', bet9ja: '', betway: '', bet365: '', _1xbet: ''
}

const EMPTY_NOTIF_FORM = {
  title: '', message: '', type: 'info' as 'info' | 'success' | 'warning'
}

export default function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  const { games } = useAllGames()
  const { bookingCodesList } = useSeparateBookingCodes()
  const { notifications } = useNotifications()

  const [activeTab, setActiveTab] = useState<'games' | 'codes' | 'notifs' | 'vip'>('games')

  // Forms
  const [gameForm, setGameForm] = useState(EMPTY_GAME_FORM)
  const [codeForm, setCodeForm] = useState(EMPTY_CODE_FORM)
  const [notifForm, setNotifForm] = useState(EMPTY_NOTIF_FORM)

  // State
  const [posting, setPosting] = useState(false)
  const [vipExpiry, setVipExpiry] = useState(30)
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [savingCode, setSavingCode] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/auth/login'); return }
    if (!isAdmin) { router.replace('/dashboard') }
  }, [loading, user, isAdmin, router])

  const handlePostGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gameForm.fixture || !gameForm.time || !gameForm.prediction) {
      Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Fill in fixture, time, and prediction.', confirmButtonColor: '#7c3aed' })
      return
    }
    setPosting(true)
    try {
      await postGame({
        fixture: gameForm.fixture, league: gameForm.league, sport: gameForm.sport,
        time: gameForm.time, tier: gameForm.tier, prediction: gameForm.prediction,
        confidence: gameForm.confidence, bookingCodes: {}
      })
      Swal.fire({ icon: 'success', title: 'Pick posted!', timer: 2500, showConfirmButton: false })
      setGameForm(EMPTY_GAME_FORM)
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Check Firebase connection.', confirmButtonColor: '#7c3aed' })
    }
    setPosting(false)
  }

  const handlePostCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeForm.label) {
      Swal.fire({ icon: 'warning', title: 'Missing label', confirmButtonColor: '#7c3aed' })
      return
    }
    setPosting(true)
    try {
      await postSeparateBookingCode({
        label: codeForm.label,
        tier: codeForm.tier,
        codes: {
          ...(codeForm.sportybet && { sportybet: codeForm.sportybet }),
          ...(codeForm.bet9ja && { bet9ja: codeForm.bet9ja }),
          ...(codeForm.betway && { betway: codeForm.betway }),
          ...(codeForm.bet365 && { bet365: codeForm.bet365 }),
          ...(codeForm._1xbet && { _1xbet: codeForm._1xbet }),
        }
      })
      Swal.fire({ icon: 'success', title: 'Codes posted!', timer: 2500, showConfirmButton: false })
      setCodeForm(EMPTY_CODE_FORM)
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Check Firebase.', confirmButtonColor: '#7c3aed' })
    }
    setPosting(false)
  }

  const handlePostNotif = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notifForm.title || !notifForm.message) {
      Swal.fire({ icon: 'warning', title: 'Missing fields', confirmButtonColor: '#7c3aed' })
      return
    }
    setPosting(true)
    try {
      await postNotification({
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type
      })
      Swal.fire({ icon: 'success', title: 'Notification sent!', timer: 2500, showConfirmButton: false })
      setNotifForm(EMPTY_NOTIF_FORM)
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', confirmButtonColor: '#7c3aed' })
    }
    setPosting(false)
  }

  const handleGenerateCode = async () => {
    setSavingCode(true)
    const code = generateVipCode()
    try {
      await createVipCode(code, vipExpiry)
      setGeneratedCode(code)
      Swal.fire({ icon: 'success', title: 'VIP Code Created!', html: `<p class="text-lg font-bold tracking-widest">${code}</p><p class="text-sm mt-1">Valid for ${vipExpiry} days</p>`, confirmButtonColor: '#7c3aed' })
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Check Firebase.', confirmButtonColor: '#7c3aed' })
    }
    setSavingCode(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-2 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-xs text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-6 text-foreground">
      <section className="mx-auto max-w-md space-y-5">

        <header className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="h-9 w-9 rounded-2xl bg-secondary flex items-center justify-center hover:bg-border transition">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Admin<span className="text-primary">Panel</span></h1>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5">
            <LayoutDashboard className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">Admin</span>
          </div>
        </header>

        {/* Action Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setActiveTab('games')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition ${activeTab === 'games' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>Picks</button>
          <button onClick={() => setActiveTab('codes')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition ${activeTab === 'codes' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>Booking Codes</button>
          <button onClick={() => setActiveTab('notifs')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition ${activeTab === 'notifs' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>Notifications</button>
          <button onClick={() => setActiveTab('vip')} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition ${activeTab === 'vip' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>VIP Code</button>
        </div>

        {activeTab === 'games' && (
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-violet-50 flex items-center gap-2">
              <FaPlus className="h-3.5 w-3.5 text-primary" />
              <h2 className="text-sm font-extrabold">Post a Pick</h2>
            </div>
            <form onSubmit={handlePostGame} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Fixture *</label>
                <input value={gameForm.fixture} onChange={(e) => setGameForm({ ...gameForm, fixture: e.target.value })} placeholder="e.g. Arsenal vs Chelsea" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Sport</label>
                  <select value={gameForm.sport} onChange={(e) => setGameForm({ ...gameForm, sport: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40">
                    {SPORTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">League</label>
                  <select value={gameForm.league} onChange={(e) => setGameForm({ ...gameForm, league: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40">
                    {LEAGUES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Match Time *</label>
                <input value={gameForm.time} onChange={(e) => setGameForm({ ...gameForm, time: e.target.value })} placeholder="e.g. Today 20:30" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tier</label>
                <div className="flex gap-2">
                  {(['free', 'premium'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setGameForm({ ...gameForm, tier: t })}
                      className={`flex-1 rounded-xl border py-2 text-xs font-bold capitalize transition flex items-center justify-center gap-1.5 ${gameForm.tier === t ? t === 'premium' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:border-primary/30'}`}>
                      {t === 'premium' ? <><FaCrown className="h-3 w-3" /> Premium</> : <><FaBullseye className="h-3 w-3" /> Free</>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Prediction *</label>
                <textarea value={gameForm.prediction} onChange={(e) => setGameForm({ ...gameForm, prediction: e.target.value })} placeholder="e.g. Home Win" rows={2} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Confidence</label>
                  <span className="text-xs font-extrabold text-primary">{gameForm.confidence}%</span>
                </div>
                <input type="range" min={50} max={99} value={gameForm.confidence} onChange={(e) => setGameForm({ ...gameForm, confidence: parseInt(e.target.value) })} className="w-full accent-primary" />
              </div>
              <button type="submit" disabled={posting} className="w-full rounded-xl bg-primary py-3 text-sm font-extrabold text-white">
                {posting ? 'Posting…' : 'Post Pick'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'codes' && (
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-emerald-50 to-green-50 flex items-center gap-2">
              <FaReceipt className="h-3.5 w-3.5 text-emerald-600" />
              <h2 className="text-sm font-extrabold">Post Booking Codes</h2>
            </div>
            <form onSubmit={handlePostCode} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Label *</label>
                <input value={codeForm.label} onChange={(e) => setCodeForm({ ...codeForm, label: e.target.value })} placeholder="e.g. Today's VIP Accumulator" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tier</label>
                <div className="flex gap-2">
                  {(['free', 'premium'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setCodeForm({ ...codeForm, tier: t })}
                      className={`flex-1 rounded-xl border py-2 text-xs font-bold capitalize transition flex items-center justify-center gap-1.5 ${codeForm.tier === t ? t === 'premium' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-border bg-background text-muted-foreground hover:border-emerald-500/30'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {[{ key: 'sportybet', label: 'SportyBet' }, { key: 'bet9ja', label: 'Bet9ja' }, { key: 'betway', label: 'Betway' }, { key: 'bet365', label: 'Bet365' }, { key: '_1xbet', label: '1xBet' }].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-16 text-xs font-semibold text-muted-foreground shrink-0">{label}</span>
                    <input value={codeForm[key as keyof typeof codeForm] as string} onChange={(e) => setCodeForm({ ...codeForm, [key]: e.target.value })} placeholder="Code" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500/40" />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={posting} className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-extrabold text-white">
                {posting ? 'Posting…' : 'Post Codes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'notifs' && (
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center gap-2">
              <FaBell className="h-3.5 w-3.5 text-blue-600" />
              <h2 className="text-sm font-extrabold">Send Notification</h2>
            </div>
            <form onSubmit={handlePostNotif} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Title *</label>
                <input value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })} placeholder="e.g. Games are LIVE!" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/40" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Message *</label>
                <textarea value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })} placeholder="Write message to users..." rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Type</label>
                <div className="flex gap-2">
                  {(['info', 'success', 'warning'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setNotifForm({ ...notifForm, type: t })}
                      className={`flex-1 rounded-xl border py-2 text-xs font-bold capitalize transition ${notifForm.type === t ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-border bg-background text-muted-foreground'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={posting} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-extrabold text-white">
                {posting ? 'Sending…' : 'Send'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'vip' && (
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-amber-50 to-yellow-50 flex items-center gap-2">
              <FaKey className="h-3.5 w-3.5 text-amber-600" />
              <h2 className="text-sm font-extrabold">Generate VIP Code</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Valid for (days)</label>
                  <input type="number" min={1} max={365} value={vipExpiry} onChange={(e) => setVipExpiry(parseInt(e.target.value))} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/40" />
                </div>
                <button onClick={handleGenerateCode} disabled={savingCode} className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-extrabold text-amber-900 transition">
                  {savingCode ? '…' : 'Generate'}
                </button>
              </div>
              {generatedCode && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
                  <span className="flex-1 text-lg font-extrabold tracking-widest text-primary font-mono">{generatedCode}</span>
                  <button onClick={handleCopy} className="rounded-xl bg-primary/10 p-2 hover:bg-primary/20 transition">
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-primary" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE ITEMS LIST */}
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-extrabold flex items-center gap-2">
              <FaClipboardList className="h-3.5 w-3.5 text-primary" /> Active Picks
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{games.length}</span>
          </div>
          <div className="p-4 space-y-2">
            {games.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                <div>
                  <p className="text-sm font-bold">{g.fixture}</p>
                  <p className="text-[10px] text-muted-foreground">{g.tier} • {g.time}</p>
                </div>
                <button onClick={() => deactivateGame(g.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-extrabold flex items-center gap-2">
              <FaReceipt className="h-3.5 w-3.5 text-emerald-600" /> Active Codes
            </h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">{bookingCodesList.length}</span>
          </div>
          <div className="p-4 space-y-2">
            {bookingCodesList.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                <div>
                  <p className="text-sm font-bold">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground">{c.tier}</p>
                </div>
                <button onClick={() => deleteBookingCode(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-extrabold flex items-center gap-2">
              <FaBell className="h-3.5 w-3.5 text-blue-600" /> Active Notifications
            </h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">{notifications.length}</span>
          </div>
          <div className="p-4 space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                <div>
                  <p className="text-sm font-bold">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{n.message}</p>
                </div>
                <button onClick={() => deleteNotification(n.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  )
}
