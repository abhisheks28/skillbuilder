"use client";
import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { QuizSessionContext } from "@/features/quiz/context/QuizSessionContext";
import { completeAssessment } from "../services/skillPracticeApi";
import { SecureTestEnvironment } from "@/components/Security";
import Timer from "@/components/Timer/Timer.component";
import TypeMCQ from "@/components/QuestionTypes/TypeMCQ/TypeMCQ.component";
import TypeUserInput from "@/components/QuestionTypes/TypeUserInput/TypeUserInput.component";
import QuestionPalette from "@/components/QuestionPalette/QuestionPalette.component";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";
import { toast } from "react-toastify";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import Styles from "@/features/quiz/components/Quiz.module.css";

// Import grade generators
import { Grade1GeneratorMap } from "@/questionBook/Grade1/GetGrade1Question";

// Category to topic mapping 
const CATEGORY_TOPIC_MAP = {
    "Number Sense / Counting": ["Number Sense / Counting Forwards", "Number Sense / Counting Backwards", "Number Sense / Counting Objects"],
    "Number Sense / Place Value": ["Number Sense / Place Value"],
    "Number Sense / Comparison": ["Number Sense / Comparison"],
    "Number Sense / Expanded Form": ["Number Sense / Place Value"],
    "Operations / Addition": ["Addition / Basics", "Addition / Word Problems"],
    "Operations / Subtraction": ["Subtraction / Basics", "Subtraction / Word Problems"],
    "Operations / Multiplication": ["Addition / Basics"],
    "Addition / Word Problems": ["Addition / Basics", "Addition / Word Problems"],
    "Subtraction / Basics": ["Subtraction / Basics"],
    "Subtraction / Word Problems": ["Subtraction / Word Problems"],
    "Geometry / Shapes": ["Geometry / Shapes"],
    "Geometry / Spatial": ["Geometry / Spatial"],
    "Measurement / Weight": ["Measurement / Weight"],
    "Measurement / Capacity": ["Measurement / Capacity"],
};

const generateQuestionsForCategory = (category, count, generatorMap) => {
    const questions = [];
    const topics = CATEGORY_TOPIC_MAP[category] || [category];

    const matchingGenerators = [];
    for (const topic of topics) {
        if (generatorMap[topic]) {
            matchingGenerators.push({ topic, generator: generatorMap[topic] });
        }
    }

    // Partial matching fallback
    if (matchingGenerators.length === 0) {
        const categoryParts = category.toLowerCase().split(/[\s\/]+/);
        for (const [topic, generator] of Object.entries(generatorMap)) {
            const topicLower = topic.toLowerCase();
            if (categoryParts.some(part => topicLower.includes(part))) {
                matchingGenerators.push({ topic, generator });
            }
        }
    }

    if (matchingGenerators.length === 0) {
        console.warn(`No generators found for category: ${category}`);
        return [];
    }

    for (let i = 0; i < count; i++) {
        const { topic, generator } = matchingGenerators[i % matchingGenerators.length];
        try {
            const question = generator();
            if (question) {
                questions.push({
                    ...question,
                    topic,
                    userAnswer: null
                });
            }
        } catch (err) {
            console.error(`Error generating question for ${topic}:`, err);
        }
    }

    return questions;
};

/**
 * SkillAssessmentSession - Assessment mode with anti-cheating like main quiz
 * Uses SecureTestEnvironment wrapper for tab-switch detection, right-click blocking, etc.
 */
const SkillAssessmentSession = () => {
    const { reportId, day } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const category = location.state?.category || "Assessment";
    const dayNumber = parseInt(day, 10);

    const [questionPaper, setQuestionPaper] = useState([]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState(300); // 5 minutes for 5 questions
    const [isInitializing, setIsInitializing] = useState(true);
    const [showIntro, setShowIntro] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);

    const timeTakeRef = useRef(300);
    const lastTimeRef = useRef(300);
    const startTimeRef = useRef(Date.now());

    const generatorMap = useMemo(() => Grade1GeneratorMap, []);

    // Generate 5 questions on mount
    useEffect(() => {
        const generated = generateQuestionsForCategory(category, 5, generatorMap);
        setQuestionPaper(generated);
        setTimeout(() => setIsInitializing(false), 1000);
    }, [category, generatorMap]);

    // Timer callback
    const getTimeTaken = (time) => {
        timeTakeRef.current = time;
        setRemainingTime(time);
    };

    // Auto-submit when timer finishes
    const handleTimerFinished = () => {
        handleSubmitAssessment();
    };

    // Start assessment
    const handleStartAssessment = () => {
        setShowIntro(false);
        startTimeRef.current = Date.now();
    };

    // Exit without completing
    const handleExit = () => {
        navigate(-1);
    };

    // Save current question progress
    const saveCurrentProgress = (answer) => {
        if (!questionPaper[activeQuestionIndex]) return;

        const currentQuestion = { ...questionPaper[activeQuestionIndex] };
        if (answer !== undefined) {
            currentQuestion.userAnswer = answer;
        }

        const newPaper = [...questionPaper];
        newPaper[activeQuestionIndex] = currentQuestion;
        setQuestionPaper(newPaper);

        return newPaper;
    };

    // Navigate to next question
    const handleNext = (answer) => {
        saveCurrentProgress(answer);

        if (activeQuestionIndex + 1 >= questionPaper.length) {
            // Last question - submit
            handleSubmitAssessment();
            return;
        }

        setActiveQuestionIndex(prev => prev + 1);
    };

    // Navigate to previous question
    const handlePrevious = () => {
        if (activeQuestionIndex > 0) {
            saveCurrentProgress();
            setActiveQuestionIndex(prev => prev - 1);
        }
    };

    // Jump to specific question
    const handleJumpToQuestion = (index) => {
        if (index >= 0 && index < questionPaper.length) {
            saveCurrentProgress();
            setActiveQuestionIndex(index);
        }
    };

    // Answer change handler
    const handleAnswerChange = (answer) => {
        if (!questionPaper[activeQuestionIndex]) return;
        const currentQuestion = { ...questionPaper[activeQuestionIndex] };
        currentQuestion.userAnswer = answer;

        const newPaper = [...questionPaper];
        newPaper[activeQuestionIndex] = currentQuestion;
        setQuestionPaper(newPaper);
    };

    // Submit assessment and unlock next day
    const handleSubmitAssessment = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

        // Calculate score
        let correctCount = 0;
        questionPaper.forEach(q => {
            if (q.userAnswer !== null && q.userAnswer !== undefined) {
                // Normalize answers for comparison
                const userAns = String(q.userAnswer).trim().toLowerCase();
                const correctAns = String(q.answer).trim().toLowerCase();
                if (userAns === correctAns) {
                    correctCount++;
                }
            }
        });

        try {
            await completeAssessment(user?.uid, {
                report_id: parseInt(reportId, 10),
                day_number: dayNumber,
                category,
                questions_attempted: questionPaper.length,
                correct_answers: correctCount,
                time_taken_seconds: timeSpent
            });

            setResult({
                correct: correctCount,
                total: questionPaper.length,
                timeSpent,
                passed: true
            });
            setShowResult(true);
        } catch (err) {
            console.error("Error completing assessment:", err);
            toast.error("Failed to submit assessment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Return to learning plan
    const handleViewResults = () => {
        navigate(`/quiz/quiz-result?reportId=${reportId}`);
    };

    // Calculate if last question
    const isLastQuestion = activeQuestionIndex === questionPaper.length - 1;

    // Palette component
    const paletteComponent = useMemo(() => (
        <QuestionPalette
            questions={questionPaper}
            activeQuestionIndex={activeQuestionIndex}
            onSelect={handleJumpToQuestion}
            onPrevious={handlePrevious}
            onNext={() => handleNext(questionPaper[activeQuestionIndex]?.userAnswer)}
            isLastQuestion={isLastQuestion}
        />
    ), [questionPaper, activeQuestionIndex, isLastQuestion]);

    // Loading state
    if (isInitializing || questionPaper.length === 0) {
        return (
            <LoadingScreen
                title={`Loading Day ${dayNumber} Assessment`}
                subtitle={`Preparing ${category} questions...`}
            />
        );
    }

    // Intro screen
    if (showIntro) {
        return (
            <div className={Styles.introOverlay}>
                <div className={Styles.introCard}>
                    <div className={Styles.introHeader}>
                        <h1>Day {dayNumber} Assessment</h1>
                        <p>{category}</p>
                    </div>

                    <div className={Styles.instructionBox}>
                        <h3>Assessment Instructions</h3>
                        <ul className={Styles.instructionList}>
                            <li>
                                <strong>Time Duration:</strong> You have <strong>5 minutes</strong> to complete 5 questions.
                            </li>
                            <li>
                                <strong>Purpose:</strong> Complete this assessment to unlock Day {dayNumber + 1}.
                            </li>
                            <li>
                                <strong>Anti-Cheating:</strong> Do not switch tabs or use keyboard shortcuts. The test may auto-submit if violations are detected.
                            </li>
                            <li>
                                <strong>No Going Back:</strong> Once submitted, you cannot retake this assessment for this day.
                            </li>
                        </ul>
                    </div>

                    <div className={Styles.introActions}>
                        <Button
                            variant="outlined"
                            size="large"
                            className={Styles.exitQuizBtn}
                            onClick={handleExit}
                        >
                            Exit
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            className={Styles.startQuizBtn}
                            onClick={handleStartAssessment}
                        >
                            Start Assessment
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Result screen
    if (showResult && result) {
        return (
            <div className={Styles.introOverlay}>
                <div className={Styles.introCard}>
                    <div className={Styles.introHeader} style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            fontSize: '2rem'
                        }}>
                            ✓
                        </div>
                        <h1>Day {dayNumber} Complete!</h1>
                        <p>{category}</p>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        margin: '2rem 0',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>
                                {result.correct}/{result.total}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Correct</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>
                                {Math.floor(result.timeSpent / 60)}:{String(result.timeSpent % 60).padStart(2, '0')}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Time Taken</div>
                        </div>
                    </div>

                    <p style={{
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        color: '#10b981',
                        fontWeight: 600,
                        margin: '1.5rem 0'
                    }}>
                        🎉 Day {dayNumber + 1} is now unlocked!
                    </p>

                    <div className={Styles.introActions} style={{ justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleViewResults}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                textTransform: 'none',
                                padding: '12px 32px',
                                borderRadius: 12,
                                fontSize: '1rem'
                            }}
                        >
                            View Learning Plan
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Main assessment UI with SecureTestEnvironment
    return (
        <SecureTestEnvironment
            testType="skill-assessment"
            testId={`skill-assessment-${reportId}-day${dayNumber}-${Date.now()}`}
            testName={`Day ${dayNumber} Assessment`}
            maxTabSwitches={3}
            onAutoSubmit={() => {
                console.log('🚨 Auto-submit triggered due to violations');
                handleSubmitAssessment();
            }}
        >
            <div className={Styles.quizPageWrapper}>
                {/* Main Question Section */}
                <div className={Styles.questionSection}>
                    {questionPaper[activeQuestionIndex]?.type === "mcq" && (
                        <TypeMCQ
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            question={questionPaper[activeQuestionIndex].question}
                            topic={questionPaper[activeQuestionIndex].topic}
                            options={questionPaper[activeQuestionIndex].options}
                            grade="Grade 1"
                            timeTakeRef={timeTakeRef}
                            image={questionPaper[activeQuestionIndex].image}
                        />
                    )}
                    {questionPaper[activeQuestionIndex]?.type === "userInput" && (
                        <TypeUserInput
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            question={questionPaper[activeQuestionIndex].question}
                            topic={questionPaper[activeQuestionIndex].topic}
                            grade="Grade 1"
                            timeTakeRef={timeTakeRef}
                        />
                    )}
                </div>

                {/* Sidebar with Timer and Palette */}
                <div className={Styles.sidebarSection}>
                    <div className={Styles.timerSection}>
                        <Timer
                            timerFinished={handleTimerFinished}
                            getTimeTaken={getTimeTaken}
                            initialTime={remainingTime}
                        />
                    </div>
                    <div className={Styles.paletteSection}>
                        {paletteComponent}
                    </div>
                </div>
            </div>
        </SecureTestEnvironment>
    );
};

export default SkillAssessmentSession;
