import { useEffect, useState, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, ArrowLeft } from "lucide-react"
import Header from "./homepage/Header"
import { useAuth } from "@/context/AuthContext"
import { getUserDatabaseKey } from "@/utils/authUtils"
import Confetti from "react-confetti"

export default function RapidMathSummary() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user, userData } = useAuth()
    const [results, setResults] = useState<any[]>([])
    const [score, setScore] = useState(0)
    const [accuracy, setAccuracy] = useState(0)
    const [saving, setSaving] = useState(false)
    const [isAdminView, setIsAdminView] = useState(false)
    const [loading, setLoading] = useState(true)
    const saveAttempted = useRef(false)

    useEffect(() => {
        const loadReport = async () => {
            const phoneParam = searchParams.get("phone")
            const adminView = searchParams.get("adminView")
            const reportIdParam = searchParams.get("reportId")

            // Admin View: load from API
            if (phoneParam && adminView === 'true') {
                setIsAdminView(true)
                try {
                    let reportData = null;

                    // Try to fetch by reportId first
                    if (reportIdParam) {
                        const response = await fetch(`/api/reports/${reportIdParam}`)
                        if (response.ok) {
                            const res = await response.json()
                            if (res.success && res.data) {
                                reportData = JSON.parse(res.data.report_json)
                            }
                        }
                    }

                    // Fallback: fetch by phone and find matching report
                    if (!reportData) {
                        const normalizedPhone = phoneParam.replace(/\D/g, '').slice(-10)
                        const response = await fetch(`/api/reports/?uid=${encodeURIComponent(normalizedPhone)}`)
                        if (response.ok) {
                            const res = await response.json()
                            if (res.success && res.data && res.data.length > 0) {
                                // Find Rapid Math reports
                                const rapidReports = res.data
                                    .map((r: any) => ({ ...JSON.parse(r.report_json), reportId: r.report_id }))
                                    .filter((r: any) => r.type === 'RAPID_MATH')
                                    .sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())

                                if (reportIdParam) {
                                    reportData = rapidReports.find((r: any) => r.reportId == reportIdParam) || rapidReports[0]
                                } else {
                                    reportData = rapidReports[0]
                                }
                            }
                        }
                    }

                    if (reportData) {
                        const details = reportData.details || []
                        setResults(details)
                        setScore(reportData.summary?.correct || 0)
                        setAccuracy(reportData.summary?.accuracyPercent || 0)
                    } else {
                        navigate("/rapid-math")
                    }
                } catch (error) {
                    console.error("Error loading rapid math report:", error)
                    navigate("/rapid-math")
                } finally {
                    setLoading(false)
                }
                return
            }

            // Normal user view: load from sessionStorage
            const stored = sessionStorage.getItem("testResults")
            if (!stored) {
                navigate("/rapid-math")
                return
            }

            try {
                const parsedResults = JSON.parse(stored)
                setResults(parsedResults)

                // Calculate Stats
                const correctCount = parsedResults.filter((r: any) => r.isCorrect).length
                const total = parsedResults.length
                const calculatedAccuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0

                setScore(correctCount)
                setAccuracy(calculatedAccuracy)

                // Save Report (if user is logged in)
                if (user && !saveAttempted.current) {
                    saveReport(parsedResults, correctCount, total, calculatedAccuracy)
                    saveAttempted.current = true
                }

            } catch (e) {
                console.error("Failed to parse results", e)
                navigate("/rapid-math")
            } finally {
                setLoading(false)
            }
        }

        loadReport()
    }, [user, navigate, searchParams])

    const saveReport = async (resultData: any[], correct: number, total: number, acc: number) => {
        try {
            setSaving(true)
            const userKey = getUserDatabaseKey(user)
            if (!userKey) return

            // Get Active Child ID
            let childId = "default"
            // Try to find active child from localStorage or userData
            if (typeof window !== "undefined") {
                const storedChild = window.localStorage.getItem(`activeChild_${userKey}`)
                if (storedChild) childId = storedChild
            }
            // Fallback to first child if available
            if (childId === "default" && userData?.children) {
                const keys = Object.keys(userData.children)
                if (keys.length > 0) childId = keys[0]
            }

            const sanitizedUserKey = userKey.replace(/\./g, '_')

            const totalTime = resultData.reduce((acc: number, curr: any) => acc + (curr.timeTaken || 0), 0)

            const reportData = {
                type: 'RAPID_MATH',
                timestamp: new Date().toISOString(),
                summary: {
                    totalQuestions: total,
                    attempted: resultData.filter(r => !r.skipped).length,
                    correct: correct,
                    wrong: total - correct, // simplistic
                    accuracyPercent: acc,
                    totalTime: totalTime,
                    score: correct
                },
                details: resultData
            }

            console.log("Saving Rapid Math Report to API...");

            const currentUid = userKey; // userKey is derived from getUserDatabaseKey(user) which returns phone or email. 
            // Ideally we need the actual user.uid if available for the API if the backend relies on it for `uid` column.
            const uidToSend = user?.uid || userKey;

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: uidToSend,
                    childId: childId,
                    reportData: reportData,
                    category: 'RAPID_MATH'
                })
            });

            const result = await response.json();
            if (result.success) {
                console.log("Rapid Math Report Saved to DB via API!", reportData);
            } else {
                console.error("API Error saving rapid math report:", result);
            }

        } catch (error) {
            console.error("Error saving rapd math report:", error)
        } finally {
            setSaving(false)
        }
    }

    const handlePlayAgain = () => {
        sessionStorage.removeItem("testResults")
        navigate("/rapid-math")
    }

    const { width, height } = typeof window !== 'undefined' ? { width: window.innerWidth, height: window.innerHeight } : { width: 0, height: 0 }

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-500">Loading report...</p>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans">
            <Header />
            {accuracy >= 80 && !isAdminView && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

            {isAdminView && (
                <div className="container mx-auto px-4 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin-dashboard')}
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                        <ArrowLeft className="mr-2" size={16} />
                        Back to Admin Dashboard
                    </Button>
                </div>
            )}

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-3xl w-full animate-in zoom-in-95 duration-500">
                    <Card className="shadow-2xl border-t-4 border-t-blue-500">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                                {accuracy >= 80 ? (
                                    <>
                                        <Trophy className="text-yellow-500 fill-yellow-500" size={32} />
                                        <span>Excellent!</span>
                                    </>
                                ) : (
                                    <span>Well Done!</span>
                                )}
                            </CardTitle>
                            <p className="text-slate-500">Here is how you performed</p>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score}/{results.length}</div>
                                    <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mt-1">Score</div>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{accuracy}%</div>
                                    <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mt-1">Accuracy</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                                    <div className="flex items-center gap-1 text-3xl font-bold text-green-600 dark:text-green-400">
                                        <CheckCircle2 size={24} /> {score}
                                    </div>
                                    <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mt-1">Correct</div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                                    <div className="flex items-center gap-1 text-3xl font-bold text-red-600 dark:text-red-400">
                                        <XCircle size={24} /> {results.length - score}
                                    </div>
                                    <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mt-1">Incorrect</div>
                                </div>
                            </div>

                            {/* Detailed List */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Question Review</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {results.map((res, idx) => (
                                        <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${res.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-sm text-slate-400 w-6">#{idx + 1}</span>
                                                <span className="font-bold text-lg text-slate-700">{res.question}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className={`font-bold ${res.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                        {res.userAnswer}
                                                    </div>
                                                    {!res.isCorrect && (
                                                        <div className="text-xs text-slate-500">Ans: {res.correctAnswer}</div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                                                    <Clock size={12} /> {res.timeTaken}s
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button size="lg" variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                                    <Home className="mr-2" size={18} /> Dashboard
                                </Button>
                                <Button size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handlePlayAgain}>
                                    <RotateCcw className="mr-2" size={18} /> Practice Again
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
