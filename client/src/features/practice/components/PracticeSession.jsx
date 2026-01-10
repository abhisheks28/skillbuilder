"use client";
import React, { useState, useEffect, useContext } from "react";
import Styles from "./PracticeSession.module.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PracticeMCQ from "./PracticeMCQ.component";
import PracticeUserInput from "./PracticeUserInput.component";
import PracticeTableInput from "./PracticeTableInput.component";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";
import getRandomInt from "@/utils/workload/GetRandomInt";
import QuestionPalette from "@/components/QuestionPalette/QuestionPalette.component";
import { regenerateQuestion } from "./PracticeGeneratorHelper";
import { validateFractionValue } from "./fractionValidator";
import motivationData from "@/features/quiz/components/Assets/motivation.json";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "@/features/auth/context/AuthContext";
import { QuizSessionContext } from "@/features/quiz/context/QuizSessionContext";
import { getUserDatabaseKey } from "@/utils/authUtils";

const PracticeSession = ({
    initialQuestions = [],
    generatorMap,
    gradeTitle = "Practice",
    mode = "practice", // 'practice' | 'assessment'
    onAssessmentComplete
}) => {
    const navigate = useNavigate();
    const { user, userData } = useAuth();
    const [quizContext, setQuizContext] = useContext(QuizSessionContext);
    const [questions, setQuestions] = useState([]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [assessmentScore, setAssessmentScore] = useState(0);
    const [assessmentResults, setAssessmentResults] = useState([]);

    useEffect(() => {
        if (initialQuestions && initialQuestions.length > 0) {
            setQuestions(initialQuestions);
            setLoading(false);
        }
    }, [initialQuestions]);

    const handleNext = () => {
        if (activeQuestionIndex < questions.length - 1) {
            setActiveQuestionIndex(prev => prev + 1);
        } else {
            // Last question - Go to Home or Finish
            navigate('/');
        }
    };

    const handleJumpToQuestion = (index) => {
        // In assessment mode, maybe disable jumping forward?
        // But for now, allow it or let Palette handle disable
        setActiveQuestionIndex(index);
    };

    const handleCorrectAnswer = (index) => {
        // Used in Practice Mode
        const updatedQuestions = [...questions];
        updatedQuestions[index].userAnswer = "correct";
        setQuestions(updatedQuestions);

        const motivations = motivationData.quiz;
        const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)].motivation;
        toast.success(randomMotivation, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });

        setTimeout(() => {
            if (activeQuestionIndex === index && index < questions.length - 1) {
                setActiveQuestionIndex(prev => prev + 1);
            } else if (index === questions.length - 1) {
                navigate('/practice/complete'); // Or callback?
            }
        }, 2500);
    };

    const handleWrongAnswer = () => {
        // No op
    };

    const handleAssessmentAnswer = (userAnswer) => {
        const currentQ = questions[activeQuestionIndex];
        let isCorrect = false;

        const correctVal = String(currentQ.answer).trim();
        const checkVal = String(userAnswer).trim();

        if (currentQ.type === 'mcq') {
            isCorrect = checkVal === correctVal;
        } else {
            // User Input
            isCorrect = checkVal === correctVal || validateFractionValue(checkVal, correctVal);
        }

        const newResults = [...assessmentResults, { ...currentQ, userAnswer, isCorrect }];
        setAssessmentResults(newResults);

        let newScore = assessmentScore;
        if (isCorrect) {
            newScore += 1;
            setAssessmentScore(prev => prev + 1);
        }

        // Move Next
        if (activeQuestionIndex < questions.length - 1) {
            setActiveQuestionIndex(prev => prev + 1);
        } else {
            // Finish
            if (onAssessmentComplete) {
                onAssessmentComplete({
                    score: newScore,
                    total: questions.length,
                    results: newResults
                });
            }
        }
    };

    const handleRepeat = (index) => {
        if (mode === 'assessment') return;
        const currentQ = questions[index];
        const newQ = regenerateQuestion(currentQ, generatorMap);

        if (newQ) {
            const updatedQuestions = [...questions];
            updatedQuestions[index] = { ...newQ, userAnswer: null };
            setQuestions(updatedQuestions);
        } else {
            toast.error("Could not regenerate this question.");
        }
    };

    const handleExit = () => {
        navigate('/');
    };

    if (loading) {
        return <LoadingScreen title={`Loading ${gradeTitle} Mode`} />;
    }

    if (questions.length === 0) {
        return <div className={Styles.error}>No questions found.</div>;
    }

    const currentQuestion = questions[activeQuestionIndex];

    return (
        <div className={Styles.page}>
            <ToastContainer />
            <div className={Styles.mainLayout}>
                {/* Sidebar Palette - Hide in Assessment Mode? Or make read only? */}
                <div className={Styles.paletteColumn}>
                    <div className={Styles.sidebarHeader}>
                        <h2>{gradeTitle}</h2>
                    </div>
                    <QuestionPalette
                        questions={questions}
                        activeQuestionIndex={activeQuestionIndex}
                        onSelect={handleJumpToQuestion}
                        onPrevious={() => activeQuestionIndex > 0 && setActiveQuestionIndex(activeQuestionIndex - 1)}
                        onNext={handleNext} // This might need to be assessment specific if Palette has "Next"
                        isLastQuestion={activeQuestionIndex === questions.length - 1}
                        nextDisabled={mode === 'assessment' ? false : questions[activeQuestionIndex].userAnswer !== "correct"}
                    // In assessment, we can move freely? Or blocked until answer?
                    // Let's assume Palette is just navigation.
                    />

                    <button onClick={handleExit} className={Styles.exitButtonSidebar}>
                        <ArrowLeft size={20} />
                        <span>Exit {mode === 'assessment' ? 'Assessment' : 'Practice'}</span>
                    </button>
                </div>

                <div className={Styles.contentArea}>
                    <div className={Styles.mobileHeader}>
                        <button onClick={handleExit} className={Styles.backButton}>
                            <ArrowLeft size={24} />
                            <span>Exit</span>
                        </button>
                        <span className={Styles.progressText}>Q{activeQuestionIndex + 1}/{questions.length}</span>
                    </div>

                    {currentQuestion.type === "mcq" && (
                        <PracticeMCQ
                            key={`${activeQuestionIndex}-${currentQuestion.question}`}
                            activeQuestionIndex={activeQuestionIndex}
                            question={currentQuestion.question}
                            topic={currentQuestion.topic}
                            options={currentQuestion.options}
                            answer={currentQuestion.answer}
                            image={currentQuestion.image}
                            onNext={handleNext}
                            onCorrect={() => handleCorrectAnswer(activeQuestionIndex)}
                            onWrong={handleWrongAnswer}
                            onRepeat={() => handleRepeat(activeQuestionIndex)}
                            isLastQuestion={activeQuestionIndex === questions.length - 1}
                            mode={mode}
                            onSubmitAnswer={handleAssessmentAnswer}
                        />
                    )}
                    {currentQuestion.type === "userInput" && (
                        <PracticeUserInput
                            key={`${activeQuestionIndex}-${currentQuestion.question}`}
                            activeQuestionIndex={activeQuestionIndex}
                            question={currentQuestion.question}
                            topic={currentQuestion.topic}
                            answer={currentQuestion.answer}
                            image={currentQuestion.image}
                            grade={gradeTitle}
                            keypadMode={currentQuestion.keypadMode}
                            onNext={handleNext}
                            onCorrect={() => handleCorrectAnswer(activeQuestionIndex)}
                            onWrong={handleWrongAnswer}
                            onRepeat={() => handleRepeat(activeQuestionIndex)}
                            isLastQuestion={activeQuestionIndex === questions.length - 1}
                            mode={mode}
                            onSubmitAnswer={handleAssessmentAnswer}
                        />
                    )}
                    {currentQuestion.type === "tableInput" && (
                        <PracticeTableInput
                            key={`${activeQuestionIndex}-${currentQuestion.topic}`}
                            activeQuestionIndex={activeQuestionIndex}
                            question={currentQuestion}
                            topic={currentQuestion.topic}
                            rows={currentQuestion.rows}
                            variant={currentQuestion.variant}
                            answer={currentQuestion.answer}
                            onNext={handleNext}
                            onCorrect={() => handleCorrectAnswer(activeQuestionIndex)}
                            onWrong={handleWrongAnswer}
                            onRepeat={() => handleRepeat(activeQuestionIndex)}
                            isLastQuestion={activeQuestionIndex === questions.length - 1}
                            mode={mode} // Passed but might need implementation inside
                            onSubmitAnswer={handleAssessmentAnswer}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeSession;
