'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Crown, Home, LayoutList, Trophy, User } from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/matches', label: 'Picks', icon: LayoutList },
    { href: '/dashboard/leaderboard', label: 'Leaders', icon: Trophy },
    { href: '/dashboard/premium', label: 'VIP', icon: Crown },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            {/* blur backdrop */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-border" />
            <div className="relative mx-auto flex max-w-md items-center justify-around px-1 py-2 pb-safe">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl relative group"
                        >
                            <Icon
                                className={`relative h-5 w-5 transition-all duration-200 ${active ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'
                                    }`}
                                strokeWidth={active ? 2.5 : 1.8}
                            />
                            <span className={`relative text-[10px] font-semibold transition-all duration-200 ${active ? 'text-primary' : 'text-muted-foreground'
                                }`}>
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
