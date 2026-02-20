import { useEffect, useState } from 'react'
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
    QuerySnapshot,
    DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface BookingCodes {
    sportybet?: string
    bet9ja?: string
    betway?: string
    bet365?: string
    _1xbet?: string
    [key: string]: string | undefined
}

export interface Game {
    id: string
    fixture: string
    league: string
    sport: string
    time: string
    tier: 'free' | 'premium'
    prediction: string
    bookingCodes: BookingCodes
    confidence: number
    active: boolean
    createdAt: Timestamp | null
}

// ── Shared listener cache ────────────────────────────────
// Prevents multiple React components from creating duplicate
// onSnapshot listeners on the same Firestore collection.
// This is the root cause of the INTERNAL ASSERTION FAILED error.

type Listener<T> = {
    data: T[]
    subscribers: Set<(data: T[]) => void>
    unsub: (() => void) | null
}

const gamesListener: Listener<Game> = { data: [], subscribers: new Set(), unsub: null }
const leaderboardListener: Listener<LeaderboardEntry> = { data: [], subscribers: new Set(), unsub: null }

function ensureGamesListener() {
    if (gamesListener.unsub) return // already listening

    const q = query(collection(db, 'games'), orderBy('createdAt', 'desc'))
    gamesListener.unsub = onSnapshot(
        q,
        (snap: QuerySnapshot<DocumentData>) => {
            gamesListener.data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Game))
            gamesListener.subscribers.forEach((cb) => cb(gamesListener.data))
        },
        () => {
            // On error, just notify with empty array; don't crash
            gamesListener.subscribers.forEach((cb) => cb([]))
        }
    )
}

function subscribeGames(cb: (data: Game[]) => void): () => void {
    ensureGamesListener()
    gamesListener.subscribers.add(cb)
    // Immediately send current data
    cb(gamesListener.data)

    return () => {
        gamesListener.subscribers.delete(cb)
        // If no more subscribers, tear down the listener
        if (gamesListener.subscribers.size === 0 && gamesListener.unsub) {
            gamesListener.unsub()
            gamesListener.unsub = null
            gamesListener.data = []
        }
    }
}

// ── Free games ──────────────────────────────────────────────
export function useFreeGames() {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = subscribeGames((all) => {
            setGames(all.filter((g) => g.active && g.tier === 'free'))
            setLoading(false)
        })
        return unsub
    }, [])

    return { games, loading }
}

// ── All games ───────────────────────────────────────────────
export function useAllGames() {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = subscribeGames((all) => {
            setGames(all.filter((g) => g.active))
            setLoading(false)
        })
        return unsub
    }, [])

    return { games, loading }
}

// Admin: post a new game pick
export async function postGame(data: Omit<Game, 'id' | 'createdAt' | 'active'>) {
    await addDoc(collection(db, 'games'), {
        ...data,
        active: true,
        createdAt: serverTimestamp(),
    })
}

export async function deactivateGame(id: string) {
    await updateDoc(doc(db, 'games', id), { active: false })
}

export async function deleteGame(id: string) {
    await deleteDoc(doc(db, 'games', id))
}

// ── Leaderboard ─────────────────────────────────────────────
export interface LeaderboardEntry {
    id: string
    username: string
    score: number
    streak: number
    plan: 'free' | 'premium'
    rank?: number
}

function ensureLeaderboardListener() {
    if (leaderboardListener.unsub) return

    const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'))
    leaderboardListener.unsub = onSnapshot(
        q,
        (snap: QuerySnapshot<DocumentData>) => {
            leaderboardListener.data = snap.docs.map((d, i) => ({
                id: d.id,
                rank: i + 1,
                ...d.data(),
            } as LeaderboardEntry))
            leaderboardListener.subscribers.forEach((cb) => cb(leaderboardListener.data))
        },
        () => {
            leaderboardListener.subscribers.forEach((cb) => cb([]))
        }
    )
}

function subscribeLeaderboard(cb: (data: LeaderboardEntry[]) => void): () => void {
    ensureLeaderboardListener()
    leaderboardListener.subscribers.add(cb)
    cb(leaderboardListener.data)

    return () => {
        leaderboardListener.subscribers.delete(cb)
        if (leaderboardListener.subscribers.size === 0 && leaderboardListener.unsub) {
            leaderboardListener.unsub()
            leaderboardListener.unsub = null
            leaderboardListener.data = []
        }
    }
}

export function useLeaderboard() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = subscribeLeaderboard((data) => {
            setEntries(data)
            setLoading(false)
        })
        return unsub
    }, [])

    return { entries, loading }
}

// ── Notifications ───────────────────────────────────────────
export interface AppNotification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning'
    createdAt: Timestamp | null
}

const notificationsListener: Listener<AppNotification> = { data: [], subscribers: new Set(), unsub: null }

function ensureNotificationsListener() {
    if (notificationsListener.unsub) return

    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
    notificationsListener.unsub = onSnapshot(
        q,
        (snap: QuerySnapshot<DocumentData>) => {
            notificationsListener.data = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            } as AppNotification))
            notificationsListener.subscribers.forEach((cb) => cb(notificationsListener.data))
        },
        () => {
            notificationsListener.subscribers.forEach((cb) => cb([]))
        }
    )
}

function subscribeNotifications(cb: (data: AppNotification[]) => void): () => void {
    ensureNotificationsListener()
    notificationsListener.subscribers.add(cb)
    cb(notificationsListener.data)

    return () => {
        notificationsListener.subscribers.delete(cb)
        if (notificationsListener.subscribers.size === 0 && notificationsListener.unsub) {
            notificationsListener.unsub()
            notificationsListener.unsub = null
            notificationsListener.data = []
        }
    }
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = subscribeNotifications((data) => {
            setNotifications(data)
            setLoading(false)
        })
        return unsub
    }, [])

    return { notifications, loading }
}

export async function postNotification(data: Omit<AppNotification, 'id' | 'createdAt'>) {
    await addDoc(collection(db, 'notifications'), {
        ...data,
        createdAt: serverTimestamp(),
    })
}

export async function deleteNotification(id: string) {
    await deleteDoc(doc(db, 'notifications', id))
}

// ── Booking Codes ───────────────────────────────────────────
export interface SeparateBookingCode {
    id: string
    label: string // e.g., "Today's VIP Accumulator"
    tier: 'free' | 'premium'
    codes: BookingCodes
    createdAt: Timestamp | null
}

const bookingCodesListener: Listener<SeparateBookingCode> = { data: [], subscribers: new Set(), unsub: null }

function ensureBookingCodesListener() {
    if (bookingCodesListener.unsub) return

    const q = query(collection(db, 'booking_codes'), orderBy('createdAt', 'desc'))
    bookingCodesListener.unsub = onSnapshot(
        q,
        (snap: QuerySnapshot<DocumentData>) => {
            bookingCodesListener.data = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            } as SeparateBookingCode))
            bookingCodesListener.subscribers.forEach((cb) => cb(bookingCodesListener.data))
        },
        () => {
            bookingCodesListener.subscribers.forEach((cb) => cb([]))
        }
    )
}

function subscribeBookingCodes(cb: (data: SeparateBookingCode[]) => void): () => void {
    ensureBookingCodesListener()
    bookingCodesListener.subscribers.add(cb)
    cb(bookingCodesListener.data)

    return () => {
        bookingCodesListener.subscribers.delete(cb)
        if (bookingCodesListener.subscribers.size === 0 && bookingCodesListener.unsub) {
            bookingCodesListener.unsub()
            bookingCodesListener.unsub = null
            bookingCodesListener.data = []
        }
    }
}

export function useSeparateBookingCodes() {
    const [bookingCodesList, setBookingCodes] = useState<SeparateBookingCode[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = subscribeBookingCodes((data) => {
            setBookingCodes(data)
            setLoading(false)
        })
        return unsub
    }, [])

    return { bookingCodesList, loading }
}

export async function postSeparateBookingCode(data: Omit<SeparateBookingCode, 'id' | 'createdAt'>) {
    await addDoc(collection(db, 'booking_codes'), {
        ...data,
        createdAt: serverTimestamp(),
    })
}

export async function deleteBookingCode(id: string) {
    await deleteDoc(doc(db, 'booking_codes', id))
}
