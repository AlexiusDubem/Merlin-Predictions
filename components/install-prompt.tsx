'use client'

import { useState, useEffect } from 'react'
import { FaDownload, FaTimes } from 'react-icons/fa'

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)

            // Only show if they haven't dismissed it recently
            const dismissed = localStorage.getItem('pwaPromptDismissed')
            if (!dismissed || (Date.now() - parseInt(dismissed)) > 7 * 24 * 60 * 60 * 1000) {
                setShowPrompt(true)
            }
        }
        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setShowPrompt(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwaPromptDismissed', Date.now().toString())
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl bg-primary text-primary-foreground p-4 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
            <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm">Install Merlin Predictions</p>
                <p className="text-xs text-primary-foreground/80 mt-0.5">Add to home screen for a premium experience.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleInstall} className="bg-white text-primary rounded-xl px-4 py-2 text-xs font-bold hover:bg-white/90 transition flex items-center gap-1.5 shadow-sm">
                    <FaDownload className="h-3 w-3" /> Install
                </button>
                <button onClick={handleDismiss} className="p-2 text-primary-foreground/60 hover:text-white rounded-lg transition" aria-label="Dismiss">
                    <FaTimes className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
