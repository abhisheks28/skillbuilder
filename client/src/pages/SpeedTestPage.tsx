"use client"

import Header from "@/pages/homepage/Header"
import { SpeedTestGame } from "@/features/rapid-math/components/SpeedTest/SpeedTestGame"

export default function SpeedTestPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans">
            <Header />
            <SpeedTestGame />
        </main>
    )
}
