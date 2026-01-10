import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PracticeSession from '../components/PracticeSession';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen.component';
import { useAuth } from '@/features/auth/context/AuthContext';
import { QuizSessionContext } from '@/features/quiz/context/QuizSessionContext';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GRADE_LOADERS } from '../utils/gradeLoaders';

const AssessmentModePage = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const day = searchParams.get('day');
    const gradeParam = searchParams.get('grade');
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quizContext] = useContext(QuizSessionContext);

    let grade = 1;
    if (gradeParam === 'SAT') {
        grade = 'SAT';
    } else if (gradeParam) {
        const cleanGrade = gradeParam.replace(/Grade\s*/i, '');
        grade = parseInt(cleanGrade);
    }

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [generatorMap, setGeneratorMap] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!category) {
                navigate('/');
                return;
            }
            setLoading(true);
            setError(null);

            const loader = GRADE_LOADERS[grade];
            if (!loader) {
                setError(`Grade ${grade} not supported.`);
                setLoading(false);
                return;
            }

            try {
                const module = await loader();
                const mapKey = grade === 'SAT' ? 'GradeSATGeneratorMap' : `Grade${grade}GeneratorMap`;
                const map = module[mapKey];
                setGeneratorMap(map);

                // Attempt Backend Fetch
                let backendQuestions = null;
                try {
                    const res = await fetch(`/api/practice/generate?grade=${grade}&category=${encodeURIComponent(category)}&count=5`);
                    if (res.ok) {
                        backendQuestions = await res.json();
                    }
                } catch (apiErr) {
                    console.warn("Backend fetch failed", apiErr);
                }

                if (backendQuestions && backendQuestions.length > 0) {
                    setQuestions(backendQuestions);
                } else {
                    // Fallback to Frontend
                    const generator = map ? map[category] : null;

                    if (!generator) {
                        throw new Error(`Assessment not found for Category: '${category}' in Grade ${grade}`);
                    }

                    // Generate EXACTLY 5 questions for assessment
                    const generated = Array.from({ length: 5 }, () => generator());
                    const finalQuestions = generated.map(q => ({
                        ...q,
                        topic: q.topic || category
                    }));

                    setQuestions(finalQuestions);
                }
            } catch (err) {
                console.error("Assessment Generation Error", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [category, grade, navigate]);

    const handleComplete = async ({ score, total, results }) => {
        const passed = score === total;
        setResultData({ score, total, passed });
        setShowResultModal(true);

        if (passed) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Save Progress
            if (user) {
                try {
                    const childId = quizContext?.userDetails?.activeChildId || quizContext?.userDetails?.childId || 'default';
                    const dayNum = parseInt(day, 10);

                    if (!isNaN(dayNum)) {
                        await fetch('/api/learning-plan/complete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                uid: user.uid,
                                child_id: childId,
                                day_number: dayNum,
                                category: category,
                                score: score,
                                status: 'completed'
                            })
                        });
                    }
                } catch (e) {
                    console.error("Error saving progress", e);
                }
            }
        }
    };

    if (loading) return <LoadingScreen title="Preparing Assessment..." />;

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                <h2>Assessment Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/')}>Go Back</button>
            </div>
        );
    }

    return (
        <>
            <PracticeSession
                initialQuestions={questions}
                generatorMap={generatorMap}
                gradeTitle={`Assessment: ${category} (Grade ${grade})`}
                mode="assessment"
                onAssessmentComplete={handleComplete}
            />

            <Dialog open={showResultModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    {resultData?.passed ? (
                        <CheckCircle size={48} color="#22c55e" />
                    ) : (
                        <XCircle size={48} color="#ef4444" />
                    )}
                    <Typography variant="h5" component="div">
                        {resultData?.passed ? "Assessment Passed!" : "Assessment Failed"}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ marginBottom: 2 }}>
                        You scored <strong>{resultData?.score}</strong> out of <strong>{resultData?.total}</strong>.
                    </Typography>
                    {resultData?.passed ? (
                        <Typography color="text.secondary">
                            Great job! You have unlocked the next day's content.
                        </Typography>
                    ) : (
                        <Typography color="text.secondary">
                            You need to answer all questions correctly to pass. Don't give up, try again!
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', padding: 3 }}>
                    {resultData?.passed ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/quiz/quiz-result')} // Go back to learning plan? Or Dashboard?
                            size="large"
                        >
                            Return to Plan
                        </Button>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/quiz/quiz-result')}
                            >
                                Quit
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => window.location.reload()} // Simple retry
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AssessmentModePage;
