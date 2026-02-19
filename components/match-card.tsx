import Link from 'next/link'
import { FaCrown, FaFutbol, FaBasketballBall, FaTableTennis, FaFootballBall, FaBaseballBall, FaHockeyPuck, FaBullseye, FaLock } from 'react-icons/fa'

interface MatchCardProps {
    id: string
    fixture: string
    league: string
    sport: string
    time: string
    prediction?: string
    confidence: number
    tier: 'free' | 'premium'
    locked?: boolean
    bookingCodes?: Record<string, string | undefined>
}

const SPORT_ICON: Record<string, React.ReactNode> = {
    'Football': <FaFutbol className="h-4 w-4 text-white" />,
    'Basketball': <FaBasketballBall className="h-4 w-4 text-white" />,
    'Tennis': <FaTableTennis className="h-4 w-4 text-white" />,
    'American Football': <FaFootballBall className="h-4 w-4 text-white" />,
    'Baseball': <FaBaseballBall className="h-4 w-4 text-white" />,
    'Ice Hockey': <FaHockeyPuck className="h-4 w-4 text-white" />,
}

const BOOKING_LABELS: Record<string, string> = {
    sportybet: 'SB',
    bet9ja: 'B9',
    betway: 'BW',
    bet365: 'B3',
    _1xbet: '1X',
}

export default function MatchCard({ id, fixture, league, sport, time, prediction, confidence, tier, locked = false, bookingCodes = {} }: MatchCardProps) {
    const sportIcon = SPORT_ICON[sport] ?? <FaBullseye className="h-4 w-4 text-white" />
    const isPremium = tier === 'premium'
    const codes = Object.entries(bookingCodes).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0)

    return (
        <div className={`mc-parent ${isPremium ? 'mc-parent--premium' : ''}`}>
            <div className="mc-card">

                {/* Depth circles — top right */}
                <div className="mc-logo">
                    <span className="mc-circle mc-c1" />
                    <span className="mc-circle mc-c2" />
                    <span className="mc-circle mc-c3" />
                    <span className="mc-circle mc-c4" />
                    <span className="mc-circle mc-c5">
                        {locked
                            ? <FaLock style={{ width: 14, height: 14, color: 'white' }} />
                            : sportIcon
                        }
                    </span>
                </div>

                {/* Glass sheen */}
                <div className="mc-glass" />

                {/* Main content */}
                <div className="mc-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        {isPremium ? (
                            <span className="mc-badge mc-badge--premium">
                                <FaCrown style={{ width: 10, height: 10, display: 'inline', marginRight: 2 }} />
                                Premium
                            </span>
                        ) : (
                            <span className="mc-badge mc-badge--free">Free</span>
                        )}
                    </div>
                    <span className="mc-fixture">{fixture}</span>
                    <span className="mc-meta">{league} · {time}</span>

                    {locked ? (
                        <span className="mc-locked">
                            <FaLock style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                            Subscribe to unlock prediction
                        </span>
                    ) : (
                        <>
                            <span className="mc-prediction">{prediction}</span>
                            <div className="mc-conf-wrap">
                                <div className="mc-conf-row">
                                    <span>Confidence</span>
                                    <span className="mc-conf-pct">{confidence}%</span>
                                </div>
                                <div className="mc-conf-track">
                                    <div className="mc-conf-fill" style={{ width: `${confidence}%` }} />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Bottom */}
                <div className="mc-bottom">
                    <div className="mc-codes">
                        {!locked && codes.slice(0, 3).map(([platform, code]) => (
                            <span key={platform} className="mc-code-chip" title={`${BOOKING_LABELS[platform] ?? platform}: ${code}`}>
                                <b>{BOOKING_LABELS[platform] ?? platform}</b>&nbsp;{code}
                            </span>
                        ))}
                        {locked && (
                            <span className="mc-code-chip mc-code-chip--locked">
                                <FaLock className="h-2.5 w-2.5 inline mr-1" /> Codes locked
                            </span>
                        )}
                    </div>
                    <div className="mc-actions">
                        <Link href={`/dashboard/matches/${id}`} className="mc-btn-outline">Detail</Link>
                        {locked
                            ? <Link href="/dashboard/premium" className="mc-btn-upgrade">Upgrade</Link>
                            : <button className="mc-btn-primary">+ Watch</button>
                        }
                    </div>
                </div>

            </div>
        </div>
    )
}
