import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Generate random VIP code
export function generateVipCode(length = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// Admin: save a generated VIP code to Firestore
export async function createVipCode(code: string, expiryDays: number) {
    await setDoc(doc(collection(db, 'vip_codes'), code), {
        used: false,
        usedBy: null,
        createdAt: serverTimestamp(),
        expiryDays,
    })
}

// User: redeem a VIP code
export async function redeemVipCode(code: string, uid: string): Promise<{ success: boolean; error?: string }> {
    const ref = doc(db, 'vip_codes', code)
    const snap = await getDoc(ref)

    if (!snap.exists()) return { success: false, error: 'Invalid code. Please try again.' }

    const data = snap.data()
    if (data.used) return { success: false, error: 'This code has already been used.' }

    // Mark code as used
    await updateDoc(ref, { used: true, usedBy: uid })

    // Calculate plan expiry
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + (data.expiryDays ?? 30))

    // Upgrade user plan
    await updateDoc(doc(db, 'users', uid), {
        plan: 'premium',
        planExpiry: expiry,
    })

    return { success: true }
}
