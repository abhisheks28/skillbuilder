"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Timer } from "@/features/rapid-math/components/timer"
import { SpeedTestQuestionCard } from "@/features/rapid-math/components/SpeedTest/SpeedTestQuestionCard"
// import { QuestionCard } from "@/features/rapid-math/components/question-card"
import { Loader2 } from "lucide-react"
import Header from "@/pages/homepage/Header"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Question {
    id: number
    question: string
    correctAnswer: number
    operation: string
    num1: number
    num2: number
}

interface TestResult {
    question: string
    correctAnswer: number
    userAnswer: number
    timeTaken: number
    isCorrect: boolean
    operation: string
    num1: number
    num2: number
    skipped: boolean
}

function TestContent() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const difficulty = (searchParams.get("difficulty") as any) || "easy"
    const totalQuestions = Number(searchParams.get("questions") || 10)

    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [results, setResults] = useState<TestResult[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [timerActive, setTimerActive] = useState(true)
    const [questionStartTime, setQuestionStartTime] = useState(Date.now())
    const [questionTimer, setQuestionTimer] = useState(0)

    useEffect(() => {
        const fetchQuestions = async () => {
            const diffMap: Record<string, string> = { normal: "medium", easy: "easy", medium: "medium", hard: "hard" }
            const apiDiff = diffMap[difficulty] || "medium"

            try {
                const response = await fetch(`${API_URL}/api/rapid-math/question?difficulty=${apiDiff}&count=${totalQuestions}`)
                if (!response.ok) throw new Error("Failed to fetch")
                const data = await response.json()
                setQuestions(data)
                setIsLoading(false)
                setQuestionStartTime(Date.now())
            } catch (error) {
                console.error("Error loading questions:", error)
            }
        }

        fetchQuestions()
    }, [totalQuestions, difficulty])

    useEffect(() => {
        if (!timerActive) return
        const interval = setInterval(() => {
            setQuestionTimer(Math.floor((Date.now() - questionStartTime) / 1000))
        }, 100)
        return () => clearInterval(interval)
    }, [timerActive, questionStartTime])

    const currentQuestion = questions[currentQuestionIndex]

    const handleSubmitAnswer = useCallback(
        (userAnswer: number) => {
            if (!currentQuestion) return

            const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)
            const isCorrect = userAnswer === currentQuestion.correctAnswer

            const result: TestResult = {
                question: currentQuestion.question,
                correctAnswer: currentQuestion.correctAnswer,
                userAnswer: userAnswer,
                timeTaken: timeTaken,
                isCorrect: isCorrect,
                operation: currentQuestion.operation,
                num1: currentQuestion.num1,
                num2: currentQuestion.num2,
                skipped: false,
            }

            const newResults = [...results, result]
            setResults(newResults)
            moveToNextQuestion(newResults)
        },
        [currentQuestion, currentQuestionIndex, totalQuestions, questionStartTime],
    )

    const handleSkipQuestion = useCallback(() => {
        if (!currentQuestion) return
        const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)
        const result: TestResult = {
            question: currentQuestion.question,
            correctAnswer: currentQuestion.correctAnswer,
            userAnswer: 0,
            timeTaken: timeTaken,
            isCorrect: false,
            operation: currentQuestion.operation,
            num1: currentQuestion.num1,
            num2: currentQuestion.num2,
            skipped: true,
        }
        const newResults = [...results, result]
        setResults(newResults)
        moveToNextQuestion(newResults)
    }, [currentQuestion, currentQuestionIndex, totalQuestions, questionStartTime])

    const moveToNextQuestion = (newResults: TestResult[]) => {
        const nextIndex = currentQuestionIndex + 1
        if (nextIndex < totalQuestions) {
            setCurrentQuestionIndex(nextIndex)
            setQuestionStartTime(Date.now())
            setQuestionTimer(0)
        } else {
            setTimerActive(false)
            sessionStorage.setItem("testResults", JSON.stringify(newResults))
            navigate("/rapid-math/test/summary")
        }
    }

    // Pre-load results to session storage on unload to prevent data loss on accidental refresh/close
    useEffect(() => {
        const handleUnload = () => {
            if (results.length > 0) {
                sessionStorage.setItem("testResults", JSON.stringify(results))
            }
        }
        window.addEventListener("beforeunload", handleUnload)
        return () => window.removeEventListener("beforeunload", handleUnload)
    }, [results])

    const labels: any = { normal: "Normal", easy: "Easy", medium: "Medium", hard: "Hard" }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col font-sans overflow-hidden">
            <Header />

            {/* Floating Header */}
            <div className="fixed top-20 left-0 right-0 z-10 px-4 md:px-8 pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-between items-start">
                    <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 pointer-events-auto">
                        <span className="text-sm uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mr-2">Mode</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{labels[difficulty]}</span>
                    </div>

                    <div className="pointer-events-auto">
                        <Timer isActive={timerActive} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center p-4">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 text-slate-500 animate-pulse">
                        <Loader2 size={48} className="animate-spin text-blue-500" />
                        <span className="text-xl font-medium">Preparing your quiz...</span>
                    </div>
                ) : (
                    currentQuestion && (
                        <div className="w-full max-w-5xl animate-in zoom-in-95 duration-500">
                            <SpeedTestQuestionCard
                                question={currentQuestion}
                                onSubmit={handleSubmitAnswer}
                                questionNumber={currentQuestionIndex + 1}
                            />
                        </div>
                    )
                )}
            </div>
        </main>
    )
}

export default function RapidMathTest() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4 text-slate-500 animate-pulse">
                    <Loader2 size={48} className="animate-spin text-blue-500" />
                    <span className="text-xl font-medium">Loading test...</span>
                </div>
            </div>
        }>
            <TestContent />
        </Suspense>
    )
}
