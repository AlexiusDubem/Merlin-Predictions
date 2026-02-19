'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
    onAuthStateChanged,
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export interface UserProfile {
    email: string
    plan: 'free' | 'premium'
    planExpiry?: Date | null
    isAdmin: boolean
    username?: string
}

interface AuthContextType {
    user: User | null
    profile: UserProfile | null
    loading: boolean
    isPremium: boolean
    isAdmin: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser)
            if (firebaseUser) {
                const ref = doc(db, 'users', firebaseUser.uid)
                const snap = await getDoc(ref)

                if (snap.exists()) {
                    const data = snap.data()
                    setProfile({
                        email: data.email ?? firebaseUser.email ?? '',
                        plan: data.plan ?? 'free',
                        planExpiry: data.planExpiry?.toDate() ?? null,
                        isAdmin: firebaseUser.email === adminEmail,
                        username: data.username ?? firebaseUser.email?.split('@')[0] ?? 'User',
                    })
                } else {
                    // User exists in Auth but no Firestore doc yet — create it
                    const defaultProfile = {
                        email: firebaseUser.email ?? '',
                        plan: 'free',
                        username: firebaseUser.email?.split('@')[0] ?? 'User',
                        createdAt: serverTimestamp(),
                    }
                    await setDoc(ref, defaultProfile)
                    setProfile({
                        email: firebaseUser.email ?? '',
                        plan: 'free',
                        planExpiry: null,
                        isAdmin: firebaseUser.email === adminEmail,
                        username: firebaseUser.email?.split('@')[0] ?? 'User',
                    })
                }
            } else {
                setProfile(null)
            }
            setLoading(false)
        })
        return unsub
    }, [adminEmail])

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password)
    }

    const signUp = async (email: string, password: string) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        const username = email.split('@')[0]
        await setDoc(doc(db, 'users', cred.user.uid), {
            email,
            plan: 'free',
            username,
            createdAt: serverTimestamp(),
        })
    }

    const signOut = async () => {
        await firebaseSignOut(auth)
    }

    const isPremium = profile?.plan === 'premium'
    const isAdmin = firebaseUser_email_check(user, adminEmail)

    return (
        <AuthContext.Provider value={{ user, profile, loading, isPremium, isAdmin, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

function firebaseUser_email_check(user: User | null, adminEmail: string) {
    return !!user && !!adminEmail && user.email === adminEmail
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
