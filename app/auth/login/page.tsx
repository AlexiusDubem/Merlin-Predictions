'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-primary/10 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center justify-center">
            <img src="/logo.png" alt="Merlin" className="h-20 w-20 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-primary">MERLIN</h1>
          <p className="text-sm text-muted-foreground">Sports Predictions</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
          <h2 className="mb-1 text-lg font-bold">Welcome Back</h2>
          <p className="mb-5 text-xs text-muted-foreground">Sign in to your MERLIN account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none ring-primary/50 transition focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none ring-primary/50 transition focus:ring-2"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-2 text-xs text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/onboarding" className="hover:text-foreground">← Back to home</Link>
        </p>
      </div>
    </main>
  )
}
