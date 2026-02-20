'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const { user } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    }, 2200)
    return () => clearTimeout(timer)
  }, [router, user])

  return (
    <main className="min-h-screen">
      <Loader isLoading={isLoading} />
    </main>
  )
}
