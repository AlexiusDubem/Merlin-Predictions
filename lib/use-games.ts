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
