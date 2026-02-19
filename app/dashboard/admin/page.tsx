'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Copy, Check, LayoutDashboard } from 'lucide-react'
import { FaPlus, FaKey, FaClipboardList, FaCrown, FaBullseye, FaPaperPlane } from 'react-icons/fa'
import Swal from 'sweetalert2'
import { useAuth } from '@/lib/auth-context'
import { postGame, deactivateGame, useAllGames, BookingCodes } from '@/lib/use-games'
import { createVipCode, generateVipCode } from '@/lib/vip-codes'

const SPORTS = ['Football', 'Basketball', 'Tennis', 'American Football', 'Baseball', 'Ice Hockey', 'Other']
const LEAGUES = ['EPL', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'UEFA CL', 'NBA', 'NFL', 'ATP', 'Other']

const EMPTY_FORM = {
  fixture: '', league: 'EPL', sport: 'Football', time: '',
  tier: 'free' as 'free' | 'premium', prediction: '', confidence: 75,
  sportybet: '', bet9ja: '', betway: '', bet365: '', _1xbet: '',
}

export default function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const { games } = useAllGames()
  const [form, setForm] = useState(EMPTY_FORM)
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

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fixture || !form.time || !form.prediction) {
      Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Fill in fixture, time, and prediction.', confirmButtonColor: '#7c3aed' })
      return
    }
    setPosting(true)
    const codes: BookingCodes = {}
    if (form.sportybet) codes.sportybet = form.sportybet
    if (form.bet9ja) codes.bet9ja = form.bet9ja
    if (form.betway) codes.betway = form.betway
    if (form.bet365) codes.bet365 = form.bet365
    if (form._1xbet) codes._1xbet = form._1xbet
    try {
      await postGame({ fixture: form.fixture, league: form.league, sport: form.sport, time: form.time, tier: form.tier, prediction: form.prediction, confidence: form.confidence, bookingCodes: codes })
      Swal.fire({ icon: 'success', title: 'Pick posted!', text: `${form.fixture} — ${form.tier} pick is now live.`, confirmButtonColor: '#7c3aed', timer: 2500 })
      setForm(EMPTY_FORM)
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Check Firebase connection.', confirmButtonColor: '#7c3aed' })
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

  const handleDeactivate = async (gameId: string, fixture: string) => {
    const result = await Swal.fire({
      icon: 'warning', title: 'Remove pick?', text: `"${fixture}" will be deactivated.`,
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, remove', cancelButtonText: 'Cancel',
    })
    if (result.isConfirmed) {
      await deactivateGame(gameId)
      Swal.fire({ icon: 'success', title: 'Removed!', timer: 1500, showConfirmButton: false })
    }
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
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
            <h1 className="text-xl font-extrabold tracking-tight"><span className="text-primary">Control</span> Panel</h1>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5">
            <LayoutDashboard className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">Admin</span>
          </div>
        </header>

        {/* POST A PICK */}
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-violet-50 flex items-center gap-2">
            <FaPlus className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-sm font-extrabold">Post a Pick</h2>
          </div>
          <form onSubmit={handlePost} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Fixture *</label>
              <input value={form.fixture} onChange={(e) => setForm({ ...form, fixture: e.target.value })} placeholder="e.g. Arsenal vs Chelsea" className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Sport</label>
                <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40">
                  {SPORTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">League</label>
                <select value={form.league} onChange={(e) => setForm({ ...form, league: e.target.value })} className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40">
                  {LEAGUES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Match Time *</label>
              <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. Today 20:30" className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tier</label>
              <div className="flex gap-2">
                {(['free', 'premium'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, tier: t })}
                    className={`flex-1 rounded-2xl border py-2.5 text-xs font-bold capitalize transition flex items-center justify-center gap-1.5 ${form.tier === t ? t === 'premium' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                      }`}>
                    {t === 'premium' ? <><FaCrown className="h-3 w-3" /> Premium</> : <><FaBullseye className="h-3 w-3" /> Free</>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Prediction *</label>
              <textarea value={form.prediction} onChange={(e) => setForm({ ...form, prediction: e.target.value })} placeholder="e.g. Home Win — Arsenal strong form" rows={2} className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Confidence</label>
                <span className="text-xs font-extrabold text-primary bg-primary/10 rounded-full px-2 py-0.5">{form.confidence}%</span>
              </div>
              <input type="range" min={50} max={99} value={form.confidence} onChange={(e) => setForm({ ...form, confidence: parseInt(e.target.value) })} className="w-full accent-primary" />
            </div>
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Booking Codes (optional)</p>
              {[{ key: 'sportybet', label: 'SportyBet' }, { key: 'bet9ja', label: 'Bet9ja' }, { key: 'betway', label: 'Betway' }, { key: 'bet365', label: 'Bet365' }, { key: '_1xbet', label: '1xBet' }].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-semibold text-muted-foreground shrink-0">{label}</span>
                  <input value={form[key as keyof typeof form] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder="Code" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={posting} className="w-full rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2">
              <FaPaperPlane className="h-3.5 w-3.5" /> {posting ? 'Posting…' : 'Post Pick'}
            </button>
          </form>
        </div>

        {/* VIP CODE GENERATOR */}
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-amber-50 to-yellow-50 flex items-center gap-2">
            <FaKey className="h-3.5 w-3.5 text-amber-600" />
            <h2 className="text-sm font-extrabold">Generate VIP Code</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Valid for (days)</label>
                <input type="number" min={1} max={365} value={vipExpiry} onChange={(e) => setVipExpiry(parseInt(e.target.value))} className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <button onClick={handleGenerateCode} disabled={savingCode} className="rounded-2xl bg-amber-400 px-5 py-2.5 text-sm font-extrabold text-amber-900 hover:opacity-90 disabled:opacity-50 transition whitespace-nowrap">
                {savingCode ? '…' : 'Generate'}
              </button>
            </div>
            {generatedCode && (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/8 px-4 py-3">
                <span className="flex-1 text-lg font-extrabold tracking-[0.25em] text-primary font-mono">{generatedCode}</span>
                <button onClick={handleCopy} className="rounded-xl bg-primary/10 p-2 hover:bg-primary/20 transition">
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-primary" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE PICKS */}
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-extrabold flex items-center gap-2">
              <FaClipboardList className="h-3.5 w-3.5 text-primary" /> Active Picks
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{games.length}</span>
          </div>
          <div className="p-4">
            {games.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No active picks yet.</p>
            ) : (
              <div className="space-y-2">
                {games.map((game) => (
                  <div key={game.id} className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{game.fixture}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {game.league} · <span className={game.tier === 'premium' ? 'text-amber-600' : 'text-emerald-600'}>{game.tier}</span> · {game.time}
                      </p>
                    </div>
                    <button onClick={() => handleDeactivate(game.id, game.fixture)} className="rounded-xl p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition" title="Deactivate pick">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </section>
    </main>
  )
}
