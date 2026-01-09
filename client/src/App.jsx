import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from "@/features/auth/context/AuthContext";
import QuizProvider, { QuizSessionContext } from "@/features/quiz/context/QuizSessionContext";
import MuiProvider from "@/components/MuiProvider/MuiProvider";

// Pages
import Home from "@/pages/Home";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLoginClient from "@/features/auth/components/AdminLogin/AdminLoginClient";
import DashboardClient from "@/features/dashboard/components/DashboardClient";
import TeacherDashboard from "@/features/dashboard/components/TeacherDashboard";
import TeacherStudentView from "@/features/dashboard/components/TeacherStudentView";
import LotteryPage from "@/features/lottery/components/LotteryPage.component";
import NeetClient from "@/features/neet/components/NeetClient";
import PracticeClient from "@/features/practice/components/PracticeClient";
import QuizClient from "@/features/quiz/components/QuizClient";
import QuizResultClient from "@/features/quiz/components/QuizResultClient";
import TutorBookingsClient from "@/features/tutor-bookings/components/TutorBookingsClient";
import RapidMath from "@/pages/RapidMath";
import RapidMathTest from "@/pages/RapidMathTest";
import RapidMathSummary from "@/pages/RapidMathSummary";
import SpeedTestPage from "@/pages/SpeedTestPage";

// ScrollToTop Component
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <QuizProvider>
                    <MuiProvider>
                        <ScrollToTop />
                        <Toaster position="top-center" />
                        <ToastContainer position="top-right" autoClose={5000} />

                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/admin-login" element={<AdminLoginClient />} />
                            <Route path="/lottery" element={<LotteryPage />} />
                            <Route path="/neet" element={<NeetClient />} />
                            <Route path="/practice" element={<PracticeClient />} />

                            {/* Rapid Math Routes */}
                            <Route path="/rapid-math" element={<RapidMath />} />
                            <Route path="/rapid-math/test" element={<RapidMathTest />} />
                            <Route path="/rapid-math/test/summary" element={<RapidMathSummary />} />
                            <Route path="/rapid-math/speed-test" element={<SpeedTestPage />} />

                            {/* Protected Routes (Logic handled within components for now, can add ProtectedRoute wrapper later) */}
                            <Route path="/dashboard" element={<DashboardClient />} />
                            <Route path="/admin-dashboard" element={<AdminDashboard />} />
                            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                            <Route path="/teacher-dashboard/student/:uid" element={<TeacherStudentView />} />
                            <Route path="/tutor-bookings" element={<TutorBookingsClient />} />

                            {/* Quiz Routes */}
                            <Route path="/quiz" element={<QuizClient />} />
                            <Route path="/quiz/quiz-result" element={<QuizResultClient />} />

                            {/* Fallback Route */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>

                    </MuiProvider>
                </QuizProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
