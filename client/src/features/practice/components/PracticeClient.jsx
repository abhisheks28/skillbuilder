"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PracticeSession from "./PracticeSession";
import SATSession from "@/components/SAT/SATSession";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";
import getRandomInt from "@/utils/workload/GetRandomInt";
import SATInstructions from "@/components/SAT/SATInstructions.component";

import { GRADE_LOADERS } from "../utils/gradeLoaders";

const PracticeClientContent = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const gradeParam = searchParams.get('grade');
    const categoryParam = searchParams.get('category');
    let grade = 1;
    if (gradeParam === 'SAT') {
        grade = 'SAT';
    } else if (gradeParam) {
        // Handle "Grade 2" or just "2"
        const cleanGrade = gradeParam.replace(/Grade\s*/i, '');
        grade = parseInt(cleanGrade);
    }
    const [questions, setQuestions] = useState(null);
    const [generatorMap, setGeneratorMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasStartedSAT, setHasStartedSAT] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setQuestions(null);
            setError(null);

            const loader = GRADE_LOADERS[grade];
            if (!loader) {
                setLoading(false);
                return;
            }

            try {
                // Load Frontend Module for Generator Map (needed for Repeat functionality and fallback)
                const module = await loader();
                const questionBook = module.default;
                const mapKey = grade === 'SAT' ? 'GradeSATGeneratorMap' : `Grade${grade}GeneratorMap`;
                const map = module[mapKey];
                setGeneratorMap(map);

                // Attempt to fetch from Backend API
                let backendQuestions = null;
                if (categoryParam) {
                    try {
                        const res = await fetch(`/api/practice/generate?grade=${grade}&category=${encodeURIComponent(categoryParam)}&count=10`);
                        if (res.ok) {
                            backendQuestions = await res.json();
                            // Ensure options are properly formatted if needed, backend sends consistent JSON
                        }
                    } catch (apiErr) {
                        console.warn("Backend fetch failed, falling back to frontend", apiErr);
                    }
                }

                if (backendQuestions && backendQuestions.length > 0) {
                    setQuestions(backendQuestions);
                } else {
                    // Fallback to Frontend Generation
                    if (!questionBook) {
                        throw new Error(`No question book found for Grade ${grade}`);
                    }

                    if (categoryParam) {
                        if (map && map[categoryParam]) {
                            const generator = map[categoryParam];
                            const generated = Array.from({ length: 10 }, () => generator());
                            const finalQs = generated.map(q => ({ ...q, topic: q.topic || categoryParam, userAnswer: null }));
                            setQuestions(finalQs);
                        } else {
                            // If backend failed and frontend doesn't have it, error
                            throw new Error(`Category '${categoryParam}' not found for Grade ${grade}`);
                        }
                    } else {
                        // Mixed Paper (Frontend Only)
                        const generatedPaper = [];
                        let qIndex = 1;
                        while (questionBook[`q${qIndex}`]) {
                            const qs = questionBook[`q${qIndex}`];
                            if (qs && qs.length > 0) {
                                const randomInt = getRandomInt(0, qs.length - 1);
                                generatedPaper.push({ ...qs[randomInt], userAnswer: null });
                            }
                            qIndex++;
                        }
                        if (generatedPaper.length === 0) console.warn("Generated paper is empty");
                        setQuestions(generatedPaper);
                    }
                }
            } catch (err) {
                console.error("Failed to load grade data", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [grade]);

    const getTitle = (g) => {
        if (g === 'SAT') return "SAT Practice";
        return `Grade ${g} Practice`;
    };

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                <h2>Error Loading {getTitle(grade)}</h2>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!loading && !questions) {
        if (grade === 'SAT' && !hasStartedSAT) {
            return (
                <SATInstructions
                    onStart={() => setHasStartedSAT(true)}
                    onExit={() => navigate('/')}
                />
            );
        }

        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>{getTitle(grade)}</h2>
                <p>Coming Soon!</p>
            </div>
        );
    }

    if (loading) {
        return <LoadingScreen title={`Loading ${getTitle(grade)}`} />;
    }

    if (grade === 'SAT') {
        return (
            <SATSession
                initialQuestions={questions}
                generatorMap={generatorMap}
                gradeTitle={getTitle(grade)}
            />
        );
    }

    return (
        <PracticeSession
            initialQuestions={questions}
            generatorMap={generatorMap}
            gradeTitle={getTitle(grade)}
        />
    );
};

const PracticeClient = () => {
    return (
        <Suspense fallback={<LoadingScreen title="Loading Practice Mode" />}>
            <PracticeClientContent />
        </Suspense>
    );
};

export default PracticeClient;
