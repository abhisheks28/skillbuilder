"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getNeetQuestions } from '@/services/neetQuestionService';
import { getUserDatabaseKey } from "@/utils/authUtils";

const NeetPracticeClient = () => {
    const { subject } = useParams();
    const [searchParams] = useSearchParams();
    const topic = searchParams.get('topic');
    const subTopic = searchParams.get('sub_topic');
    const navigate = useNavigate();
    const { user, userData, activeChildId } = useAuth();
    const [status, setStatus] = useState("Initializing...");
    const location = useLocation();

    useEffect(() => {
        const startSession = async () => {
            if (!user) {
                // Redirect or handle auth
                alert("Please login first");
                navigate('/neet');
                return;
            }

            setStatus("Preparing session...");

            try {
                let filtered = [];
                let duration = 1800; // Default 30 mins

                // Check for custom assessment payload
                if (location.state && location.state.mode === 'assessment' && location.state.questions) {
                    filtered = location.state.questions;
                    if (location.state.duration) {
                        duration = location.state.duration * 60; // Convert mins to seconds
                    }
                    setStatus("Loading assessment...");
                } else {
                    // Standard fetch
                    setStatus("Fetching questions...");
                    filtered = await getNeetQuestions(subject, topic, subTopic);
                }

                if (!filtered || filtered.length === 0) {
                    alert(`No questions found.`);
                    navigate(`/neet/topics/${subject}`);
                    return;
                }

                setStatus("Generating paper...");

                // Sort and Shuffle Logic: Group by type, shuffle inside group, then concat groups in order
                const typeOrder = ['MCQ', 'Statement', 'Assertion', 'Previous', 'General'];
                const normalizeType = (t) => {
                    const l = (t || 'general').toLowerCase();
                    if (l.includes('mcq')) return 'MCQ';
                    if (l.includes('statement')) return 'Statement';
                    if (l.includes('assertion')) return 'Assertion';
                    if (l.includes('previous') || l.includes('pyq')) return 'Previous';
                    return 'General';
                };

                // Helper to shuffle array
                const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

                // Group by normalized type
                const grouped = filtered.reduce((acc, q) => {
                    const type = normalizeType(q.questionType);
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(q);
                    return acc;
                }, {});

                // Combine in specific order
                let finalQuestions = [];
                typeOrder.forEach(type => {
                    if (grouped[type]) {
                        // Shuffle questions strictly within their type group
                        const shuffledGroup = shuffleArray(grouped[type]);
                        finalQuestions = [...finalQuestions, ...shuffledGroup];
                    }
                });

                // Handle any remaining types not in order (e.g. typos, unknowns) - append to end
                Object.keys(grouped).forEach(key => {
                    if (!typeOrder.includes(key)) {
                        finalQuestions = [...finalQuestions, ...shuffleArray(grouped[key])];
                    }
                });

                const generatedPaper = finalQuestions.map(q => ({
                    id: q.id,
                    type: q.questionType || "mcq", // Keep original string for rendering logic
                    question: q.question || (q.question_content ? q.question_content.question : ""), // Handle potential structure diffs
                    options: (q.options || (q.question_content ? [q.question_content.option_a, q.question_content.option_b, q.question_content.option_c, q.question_content.option_d] : [])).map(opt => ({ label: opt, value: opt })),
                    answer: q.correctAnswer || q.correct_answer || (q.question_content ? q.question_content.correct_answer : ""),
                    solution: q.explanation || (q.question_content ? q.question_content.explanation : ""),
                    topic: q.topic || subject,
                    questionId: q.id,
                    hint: ""
                }));

                const userKey = getUserDatabaseKey(user);
                const childId = activeChildId || "default";
                const activeChild = userData?.children?.[childId];
                const studentName = activeChild?.name || userData?.name || user?.displayName || "Student";

                const userDetails = {
                    name: studentName,
                    grade: `NEET ${subject}`,
                    userKey: userKey,
                    childId: childId,
                    activeChildId: childId,
                    testType: 'NEET',
                    activeChild: activeChild,
                    attemptCount: 1
                };

                const sessionData = {
                    userDetails,
                    questionPaper: generatedPaper,
                    activeQuestionIndex: 0,
                    remainingTime: duration
                };

                localStorage.setItem("quizSession", JSON.stringify(sessionData));
                navigate('/quiz');

            } catch (err) {
                console.error(err);
                setStatus("Error starting session");
                alert("Failed to start. See console.");
            }
        };

        startSession();
    }, [subject, topic, subTopic, user, location]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-slate-700">{status}</h2>
            </div>
        </div>
    );
};

export default NeetPracticeClient;
