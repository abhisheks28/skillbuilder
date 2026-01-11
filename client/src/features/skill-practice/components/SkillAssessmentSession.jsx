"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { completeAssessment } from "../services/skillPracticeApi";
import { SecureTestEnvironment } from "@/components/Security";
import Timer from "@/components/Timer/Timer.component";
import TypeMCQ from "@/components/QuestionTypes/TypeMCQ/TypeMCQ.component";
import TypeUserInput from "@/components/QuestionTypes/TypeUserInput/TypeUserInput.component";
import TypeTableInput from "@/components/QuestionTypes/TypeTableInput/TypeTableInput.component";
import TypeTrueAndFalse from "@/components/QuestionTypes/TypeTrueAndFalse/TypeTrueAndFalse.component";
import TypeFactorTree from "@/components/QuestionTypes/TypeFactorTree/TypeFactorTree.component";
import QuestionPalette from "@/components/QuestionPalette/QuestionPalette.component";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import Styles from "@/features/quiz/components/Quiz.module.css";

// Import all grade generator maps
import { Grade1GeneratorMap } from "@/questionBook/Grade1/GetGrade1Question";
import { Grade2GeneratorMap } from "@/questionBook/Grade2/GetGrade2Question";
import { Grade3GeneratorMap } from "@/questionBook/Grade3/GetGrade3Question";
import { Grade4GeneratorMap } from "@/questionBook/Grade4/GetGrade4Question";
import { Grade5GeneratorMap } from "@/questionBook/Grade5/GetGrade5Question";
import { Grade6GeneratorMap } from "@/questionBook/Grade6/GetGrade6Question";
import { Grade7GeneratorMap } from "@/questionBook/Grade7/GetGrade7Question";
import { Grade8GeneratorMap } from "@/questionBook/Grade8/GetGrade8Question";
import { Grade9GeneratorMap } from "@/questionBook/Grade9/GetGrade9Question";
import { Grade10GeneratorMap } from "@/questionBook/Grade10/GetGrade10Question";

// Map grade string to generator map
const GRADE_GENERATOR_MAP = {
    "Grade 1": Grade1GeneratorMap,
    "Grade 2": Grade2GeneratorMap,
    "Grade 3": Grade3GeneratorMap,
    "Grade 4": Grade4GeneratorMap,
    "Grade 5": Grade5GeneratorMap,
    "Grade 6": Grade6GeneratorMap,
    "Grade 7": Grade7GeneratorMap,
    "Grade 8": Grade8GeneratorMap,
    "Grade 9": Grade9GeneratorMap,
    "Grade 10": Grade10GeneratorMap,
    "Grade 11": Grade10GeneratorMap,
    "Grade 12": Grade10GeneratorMap,
};

// Category to topic mapping 
const CATEGORY_TOPIC_MAP = {
    "Number Sense / Counting": ["Number Sense / Counting Forwards", "Number Sense / Counting Backwards", "Number Sense / Counting Objects"],
    "Number Sense / Place Value": ["Number Sense / Place Value"],
    "Number Sense / Comparison": ["Number Sense / Comparison"],
    "Number Sense / Expanded Form": ["Number Sense / Expanded Form"],
    "Operations / Addition": ["Operations / Addition"],
    "Operations / Subtraction": ["Operations / Subtraction"],
    "Operations / Multiplication": ["Operations / Multiplication"],
    "Operations / Division": ["Operations / Division"],
    "Addition / Basics": ["Addition / Basics"],
    "Addition / Word Problems": ["Addition / Word Problems"],
    "Subtraction / Basics": ["Subtraction / Basics"],
    "Subtraction / Word Problems": ["Subtraction / Word Problems"],
    "Geometry / Shapes": ["Geometry / Shapes"],
    "Geometry / Spatial": ["Geometry / Spatial"],
    "Geometry / Area": ["Geometry / Area"],
    "Geometry / Perimeter": ["Geometry / Perimeter"],
    "Measurement / Area": ["Geometry / Area"],
    "Measurement / Perimeter": ["Geometry / Perimeter"],
    "Measurement / Weight": ["Measurement / Weight"],
    "Measurement / Capacity": ["Measurement / Capacity"],
    "Measurement / Length": ["Measurement / Length"],
    "Fractions / Basics": ["Fractions / Basics"],
    "Decimals / Basics": ["Decimals / Basics"],

    // --- Grade 6 Mappings ---
    "Integers / Understanding": ["Integers / Understanding"],
    "Integers / Operations": ["Integers / Add"],
    "Integers / Add": ["Integers / Add"],
    "Integers / Subtract": ["Integers / Subtract"],
    "Integers / Multiply": ["Integers / Multiply"],
    "Integers / Divide": ["Integers / Divide"],
    "Fractions / Add": ["Fractions / Add"],
    "Fractions / Subtract": ["Fractions / Subtract"],
    "Fractions / Multiply": ["Fractions / Multiply"],
    "Fractions / Divide": ["Fractions / Divide"],
    "Decimals / Conversion": ["Decimals / Conversion"],
    "Algebra / Expressions": ["Algebra / Expressions"],
    "Algebra / Equations": ["Algebra / Equations"],
    // Mensuration Area/Perimeter duplicates removed
    "Mensuration / Area": ["Mensuration / Area"],
    "Mensuration / Perimeter": ["Mensuration / Perimeter"],
    "Data Handling / Mean": ["Data Handling / Mean"],
    "Geometry / 3D Shapes": ["Geometry / 3D Shapes"],
    "Geometry / Faces, Vertices, Edges": ["Geometry / Faces Vertices Edges"],
    "Symmetry": ["Symmetry / Alphabet"],
    "Measurement / Clock": ["Measurement / Clock"],
    "Clock": ["Clock"],

    // --- Grade 7 Mappings ---
    "Integers / Basics": ["Integers / Mixed Operations"],
    "Rational Numbers / Operations": ["Rational Numbers / Operations"],
    "Exponents / Laws": ["Exponents / Product Law"],
    "Algebra / Basics": ["Algebra / Basics"],
    "Algebra / Linear Equations": ["Algebra / Linear Equations"],
    "Algebra / Word Problems": ["Algebra / Word Problems"],
    "Geometry / Lines and Angles": ["Geometry / Lines and Angles"],
    "Geometry / Triangles": ["Geometry / Triangles"],
    "Geometry / Solid Shapes": ["Geometry / Solid Shapes"],
    "Mensuration / Perimeter & Area": ["Mensuration / Perimeter & Area"],
    "Commercial Math / Percentage": ["Commercial Math / Percentage"],
    "Commercial Math / Profit & Loss": ["Commercial Math / Profit & Loss"],
    "Commercial Math / Simple Interest": ["Commercial Math / Simple Interest"],

    // --- Grade 8 Mappings ---
    "Rational Numbers": ["Rational Numbers"],
    "Linear Equations": ["Linear Equations"],
    "Understanding Quadrilaterals": ["Understanding Quadrilaterals"],
    "Practical Geometry": ["Practical Geometry"],
    "Data Handling": ["Data Handling"],
    "Squares and Square Roots": ["Squares and Square Roots"],
    "Cubes and Cube Roots": ["Cubes and Cube Roots"],
    "Comparing Quantities": ["Comparing Quantities"],
    "Algebraic Expressions": ["Algebraic Expressions"],
    "Visualising Solid Shapes": ["Visualising Solid Shapes"],
    "Mensuration": ["Mensuration"],
    "Exponents & Powers": ["Exponents & Powers"],
    "Direct and Inverse Proportions": ["Direct and Inverse Proportions"],
    "Factorisation": ["Factorisation"],
    "Introduction to Graphs": ["Introduction to Graphs"],
    "Playing with Numbers": ["Playing with Numbers"],

    // --- Grade 9 Mappings ---
    "Number Systems": ["Number System / Real Numbers"],
    "Polynomials": ["Polynomials / Basics", "Quadratic Equations"], // Merged G10
    "Coordinate Geometry": ["Coordinate Geometry / Basics", "Coordinate Geometry"],
    "Linear Equations in Two Variables": ["Linear Equations / Solutions"],
    "Lines and Angles": ["Lines and Angles"],
    "Triangles": ["Triangles", "Geometry / Pythagoras Theorem"],
    "Quadrilaterals": ["Quadrilaterals"],
    "Area of Parallelograms and Triangles": ["Area of Plane Figures"],
    "Circles": ["Area of Plane Figures", "Circles"],
    "Heron's Formula": ["Mensuration / Triangle Area"],
    "Surface Areas and Volumes": ["Mensuration / Volume & SA", "Surface Areas and Volumes"],
    "Statistics": ["Statistics"],
    "Probability": ["Probability"],

    // --- Grade 10 Mappings ---
    "Real Numbers": ["Real Numbers / Natural & Whole"],
    "Pair of Linear Equations in Two Variables": ["Simultaneous Equations"],
    "Quadratic Equations": ["Quadratic Equations"],
    // Duplicates removed
    "Introduction to Trigonometry": ["Trigonometry / Standard Angles"],
    "Some Applications of Trigonometry": ["Trigonometry"],
    "Areas Related to Circles": ["Area of Plane Figures"],
};

const getGeneratorMapForGrade = (grade) => {
    if (!grade) return Grade1GeneratorMap;
    return GRADE_GENERATOR_MAP[grade] || Grade1GeneratorMap;
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

    // Fallback to any available generators
    if (matchingGenerators.length === 0) {
        const allGenerators = Object.entries(generatorMap);
        if (allGenerators.length > 0) {
            console.warn(`No specific generators for category: ${category}. Using fallback.`);
            for (let i = 0; i < Math.min(3, allGenerators.length); i++) {
                const [topic, generator] = allGenerators[i];
                matchingGenerators.push({ topic, generator });
            }
        }
    }

    if (matchingGenerators.length === 0) {
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
 * SkillAssessmentSession - Assessment mode with anti-cheating
 * Uses SecureTestEnvironment wrapper and dynamic grade-based question generation
 */
const SkillAssessmentSession = () => {
    const { reportId, day } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const category = location.state?.category || "Assessment";
    const grade = location.state?.grade || "Grade 1"; // Get grade from navigation state
    const dayNumber = parseInt(day, 10);

    const [questionPaper, setQuestionPaper] = useState([]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState(300); // 5 minutes
    const [isInitializing, setIsInitializing] = useState(true);
    const [showIntro, setShowIntro] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);

    const timeTakeRef = useRef(300);
    const startTimeRef = useRef(Date.now());

    // Get generator map based on student's grade
    const generatorMap = useMemo(() => {
        console.log(`[SkillAssessmentSession] Using generators for grade: ${grade}`);
        return getGeneratorMapForGrade(grade);
    }, [grade]);

    // Generate 5 questions on mount
    useEffect(() => {
        const generated = generateQuestionsForCategory(category, 5, generatorMap);
        console.log(`[SkillAssessmentSession] Generated ${generated.length} questions for ${category} (${grade})`);
        setQuestionPaper(generated);
        setTimeout(() => setIsInitializing(false), 1000);
    }, [category, generatorMap]);

    const getTimeTaken = (time) => {
        timeTakeRef.current = time;
        setRemainingTime(time);
    };

    const handleTimerFinished = () => {
        handleSubmitAssessment();
    };

    const handleStartAssessment = () => {
        setShowIntro(false);
        startTimeRef.current = Date.now();
    };

    const handleExit = () => {
        navigate(-1);
    };

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

    const handleNext = (answer) => {
        saveCurrentProgress(answer);

        if (activeQuestionIndex + 1 >= questionPaper.length) {
            handleSubmitAssessment();
            return;
        }

        setActiveQuestionIndex(prev => prev + 1);
    };

    const handlePrevious = () => {
        if (activeQuestionIndex > 0) {
            saveCurrentProgress();
            setActiveQuestionIndex(prev => prev - 1);
        }
    };

    const handleJumpToQuestion = (index) => {
        if (index >= 0 && index < questionPaper.length) {
            saveCurrentProgress();
            setActiveQuestionIndex(index);
        }
    };

    const handleAnswerChange = (answer) => {
        if (!questionPaper[activeQuestionIndex]) return;
        const currentQuestion = { ...questionPaper[activeQuestionIndex] };
        currentQuestion.userAnswer = answer;

        const newPaper = [...questionPaper];
        newPaper[activeQuestionIndex] = currentQuestion;
        setQuestionPaper(newPaper);
    };

    const isSubmittingRef = useRef(false);

    const handleSubmitAssessment = async () => {
        // Use ref for synchronous check to prevent race conditions (double clicks, timer + manual)
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

        let correctCount = 0;
        questionPaper.forEach(q => {
            if (q.userAnswer !== null && q.userAnswer !== undefined) {
                const userAns = String(q.userAnswer).trim().toLowerCase();
                const correctAns = String(q.answer).trim().toLowerCase();
                if (userAns === correctAns) {
                    correctCount++;
                }
            }
        });

        try {
            const payload = {
                report_id: parseInt(reportId, 10),
                day_number: dayNumber,
                category,
                questions_attempted: questionPaper.length,
                correct_answers: correctCount,
                time_taken_seconds: timeSpent
            };
            console.log('[SkillAssessmentSession] Submitting assessment with payload:', payload);
            console.log('[SkillAssessmentSession] User UID:', user?.uid);

            await completeAssessment(user?.uid, payload);

            setResult({
                correct: correctCount,
                total: questionPaper.length,
                timeSpent,
                passed: true
            });
            setShowResult(true);
            // NOTE: We do NOT reset isSubmittingRef on success to prevent any further actions/retries
        } catch (err) {
            console.error("Error completing assessment:", err);
            toast.error("Failed to submit assessment. Please try again.");
            // Only reset on error to allow retry
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const handleViewResults = () => {
        navigate(`/quiz/quiz-result?reportId=${reportId}`);
    };

    const isLastQuestion = activeQuestionIndex === questionPaper.length - 1;

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

    if (isInitializing || questionPaper.length === 0) {
        return (
            <LoadingScreen
                title={`Loading Day ${dayNumber} Assessment`}
                subtitle={`Preparing ${category} questions for ${grade}...`}
            />
        );
    }

    if (showIntro) {
        return (
            <div className={Styles.introOverlay}>
                <div className={Styles.introCard}>
                    <div className={Styles.introHeader}>
                        <h1>Day {dayNumber} Assessment</h1>
                        <p>{category} • {grade}</p>
                    </div>

                    <div className={Styles.instructionBox}>
                        <h3>Assessment Instructions</h3>
                        <ul className={Styles.instructionList}>
                            <li><strong>Time Duration:</strong> You have <strong>5 minutes</strong> to complete 5 questions.</li>
                            <li><strong>Purpose:</strong> Complete this assessment to unlock Day {dayNumber + 1}.</li>
                            <li><strong>Anti-Cheating:</strong> Do not switch tabs or use keyboard shortcuts. The test may auto-submit if violations are detected.</li>
                            <li><strong>No Going Back:</strong> Once submitted, you cannot retake this assessment for this day.</li>
                        </ul>
                    </div>

                    <div className={Styles.introActions}>
                        <Button variant="outlined" size="large" className={Styles.exitQuizBtn} onClick={handleExit}>Exit</Button>
                        <Button variant="contained" size="large" className={Styles.startQuizBtn} onClick={handleStartAssessment}>Start Assessment</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (showResult && result) {
        return (
            <div className={Styles.introOverlay}>
                <div className={Styles.introCard}>
                    <div className={Styles.introHeader} style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem', fontSize: '2rem', color: 'white'
                        }}>✓</div>
                        <h1>Day {dayNumber} Complete!</h1>
                        <p>{category} • {grade}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '2rem 0', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{result.correct}/{result.total}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Correct</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>
                                {Math.floor(result.timeSpent / 60)}:{String(result.timeSpent % 60).padStart(2, '0')}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Time Taken</div>
                        </div>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#10b981', fontWeight: 600, margin: '1.5rem 0' }}>
                        🎉 Day {dayNumber + 1} is now unlocked!
                    </p>

                    <div className={Styles.introActions} style={{ justifyContent: 'center' }}>
                        <Button
                            variant="contained" size="large"
                            onClick={handleViewResults}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white', textTransform: 'none', padding: '12px 32px', borderRadius: 12, fontSize: '1rem'
                            }}
                        >View Learning Plan</Button>
                    </div>
                </div>
            </div>
        );
    }

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
                            grade={grade}
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
                            grade={grade}
                            timeTakeRef={timeTakeRef}
                        />
                    )}
                    {questionPaper[activeQuestionIndex]?.type === "tableInput" && (
                        <TypeTableInput
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            topic={questionPaper[activeQuestionIndex].topic}
                            grade={grade}
                            timeTakeRef={timeTakeRef}
                        />
                    )}
                    {questionPaper[activeQuestionIndex]?.type === "trueAndFalse" && (
                        <TypeTrueAndFalse
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            question={questionPaper[activeQuestionIndex].question}
                            topic={questionPaper[activeQuestionIndex].topic}
                            grade={grade}
                            timeTakeRef={timeTakeRef}
                        />
                    )}
                    {questionPaper[activeQuestionIndex]?.type === "factorTree" && (
                        <TypeFactorTree
                            onClick={handleNext}
                            onPrevious={handlePrevious}
                            onAnswerChange={handleAnswerChange}
                            questionPaper={questionPaper}
                            activeQuestionIndex={activeQuestionIndex}
                            topic={questionPaper[activeQuestionIndex].topic}
                            grade={grade}
                            timeTakeRef={timeTakeRef}
                        />
                    )}
                    {/* Fallback for unknown question types - render as text */}
                    {!["mcq", "userInput", "tableInput", "trueAndFalse", "factorTree"].includes(questionPaper[activeQuestionIndex]?.type) && (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                                {questionPaper[activeQuestionIndex]?.question || 'Loading question...'}
                            </p>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                Question type: {questionPaper[activeQuestionIndex]?.type || 'unknown'}
                            </p>
                            <Button variant="contained" onClick={() => handleNext(null)} style={{ marginTop: '1rem' }}>
                                Next Question
                            </Button>
                        </div>
                    )}
                </div>

                <div className={Styles.sidebarSection}>
                    <div className={Styles.timerSection}>
                        <Timer timerFinished={handleTimerFinished} getTimeTaken={getTimeTaken} initialTime={remainingTime} />
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
