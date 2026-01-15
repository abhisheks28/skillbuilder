"use client"

import { useEffect, useState, memo } from "react"
import { Trophy, Timer, TrendingUp, Sparkles, AlertTriangle, Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/context/AuthContext"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface LeaderboardEntry {
    id: number
    rank: number
    user_name: string
    measure_value: number
    metric_type: string
}

export const SpeedTestLeaderboard = memo(function SpeedTestLeaderboard({
    limitCount = 10,
    lastUpdated = 0
}: {
    limitCount?: number
    lastUpdated?: number
}) {
    const { user } = useAuth()
    const [topScores, setTopScores] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true)
                const response = await fetch(`${API_URL}/api/rapid-math/leaderboard?metric_type=avg_time&limit=${limitCount}`)
                if (response.ok) {
                    const data = await response.json()
                    setTopScores(data)
                }
            } catch (error) {
                console.error("Error fetching leaderboard", error)
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [limitCount, lastUpdated])

    return (
        <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-900/50 dark:to-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-500 fill-yellow-500" size={20} />
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Top Speedsters</h3>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <span className="text-sm">Loading scores...</span>
                    </div>
                ) : topScores.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Sparkles className="mx-auto mb-2 text-yellow-400" size={24} />
                        <p className="text-sm">Be the first to set a record!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {topScores.map((entry) => (
                            <div
                                key={entry.rank}
                                className={`
                                    flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors
                                    ${entry.user_name === user?.displayName ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                        ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            entry.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                                                entry.rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}
                                    `}>
                                        {entry.rank}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                                            {entry.user_name}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-sm">
                                    <Timer size={14} className="opacity-50" />
                                    <span>{entry.measure_value.toFixed(2)}s</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
})
