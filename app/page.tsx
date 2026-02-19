'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      router.push('/onboarding')
    }, 2200)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="min-h-screen">
      <Loader isLoading={isLoading} />
    </main>
  )
}
