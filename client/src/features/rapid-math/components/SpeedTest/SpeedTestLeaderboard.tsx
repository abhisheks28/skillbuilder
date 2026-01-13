"use client"

import { useEffect, useState, memo } from "react"
// Firebase removed during backend migration
// import { db } from "@/backend/firebaseHandler"
// import { collection, query, orderBy, limit, getDocs, where, getCountFromServer } from "firebase/firestore"
import { Trophy, Timer, TrendingUp, Sparkles, AlertTriangle } from "lucide-react"
import { useAuth } from "@/features/auth/context/AuthContext"

interface LeaderboardEntry {
    id: string
    displayName: string
    avgTime: number
    totalQuestions: number
    userId: string
    childId?: string | null
    parentEmail?: string | null
}

interface UserRankData {
    rank: number
    entry: LeaderboardEntry
}

export const SpeedTestLeaderboard = memo(function SpeedTestLeaderboard({
    limitCount = 10,
    lastUpdated = 0
}: {
    limitCount?: number
    lastUpdated?: number
}) {
    const { user, activeChildId } = useAuth()
    const [topScores, setTopScores] = useState<LeaderboardEntry[]>([])
    const [userRank, setUserRank] = useState<UserRankData | null>(null)
    const [loading, setLoading] = useState(false) // Changed to false for mock

    // Mock implementation or temporarily disabled
    useEffect(() => {
        // Leaderboard fetch disabled for migration
        setTopScores([]);
        setUserRank(null);
    }, [limitCount, lastUpdated, user?.uid])

    return (
        <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-900/50 dark:to-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-500 fill-yellow-500" size={20} />
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Top Speedsters</h3>
                </div>
            </div>

            <div className="p-8 text-center text-slate-500">
                <AlertTriangle className="mx-auto mb-3 text-orange-400" size={32} />
                <p className="font-medium text-slate-800 dark:text-slate-200">Leaderboard Maintenance</p>
                <p className="text-sm mt-1">We are migrating our backend. The leaderboard will be back soon!</p>
            </div>
        </div>
    )
})
