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
import NeetUploadClient from "@/features/neet/components/NeetUploadClient";
import NeetAssessmentClient from "@/features/neet/components/NeetAssessmentClient";
import LotteryPage from "@/features/lottery/components/LotteryPage.component";
import NeetClient from "@/features/neet/components/NeetClient";
import NeetTopicSelection from "@/features/neet/components/NeetTopicSelection";
import NeetPracticeClient from "@/features/neet/components/NeetPracticeClient";
import PracticeClient from "@/features/practice/components/PracticeClient";
import QuizClient from "@/features/quiz/components/QuizClient";
import QuizResultClient from "@/features/quiz/components/QuizResultClient";
import TutorBookingsClient from "@/features/tutor-bookings/components/TutorBookingsClient";
import RapidMath from "@/pages/RapidMath";
import RapidMathTest from "@/pages/RapidMathTest";
import RapidMathSummary from "@/pages/RapidMathSummary";
import SpeedTestPage from "@/pages/SpeedTestPage";
import SkillPracticeSession from "@/features/skill-practice/components/SkillPracticeSession";
import SkillAssessmentSession from "@/features/skill-practice/components/SkillAssessmentSession";

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
                            <Route path="/neet/topics/:subject" element={<NeetTopicSelection />} />
                            <Route path="/neet/practice/:subject" element={<NeetPracticeClient />} />
                            <Route path="/practice" element={<PracticeClient />} />

                            {/* Rapid Math Routes */}
                            <Route path="/rapid-math" element={<RapidMath />} />
                            <Route path="/rapid-math/test" element={<RapidMathTest />} />
                            <Route path="/rapid-math/test/summary" element={<RapidMathSummary />} />
                            <Route path="/rapid-math/speed-test" element={<SpeedTestPage />} />

                            {/* Skill Practice Routes (Learning Plan) */}
                            <Route path="/skill-practice/:reportId/:day" element={<SkillPracticeSession />} />
                            <Route path="/skill-assessment/:reportId/:day" element={<SkillAssessmentSession />} />

                            {/* Protected Routes (Logic handled within components for now, can add ProtectedRoute wrapper later) */}
                            <Route path="/dashboard" element={<DashboardClient />} />
                            <Route path="/admin-dashboard" element={<AdminDashboard />} />
                            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                            <Route path="/teacher-dashboard/student/:uid" element={<TeacherStudentView />} />
                            <Route path="/teacher-dashboard/neet-upload" element={<NeetUploadClient />} />
                            <Route path="/teacher-dashboard/neet-assessment" element={<NeetAssessmentClient />} />
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
