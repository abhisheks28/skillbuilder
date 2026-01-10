"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { logPracticeSession } from "../services/skillPracticeApi";
import PracticeSession from "@/features/practice/components/PracticeSession";

// Import all grade generator maps
import { Grade1GeneratorMap } from "@/questionBook/Grade1/GetGrade1Question";

// Category to topic mapping for dynamic question generation
const CATEGORY_TOPIC_MAP = {
    // Number Sense / Counting maps to counting-related generators
    "Number Sense / Counting": [
        "Number Sense / Counting Forwards",
        "Number Sense / Counting Backwards",
        "Number Sense / Counting Objects"
    ],
    // Addition / Word Problems
    "Addition / Word Problems": [
        "Addition / Basics",
        "Addition / Word Problems"
    ],
    // Subtraction / Basics
    "Subtraction / Basics": [
        "Subtraction / Basics",
        "Subtraction / Word Problems"
    ],
    // Subtraction / Word Problems
    "Subtraction / Word Problems": [
        "Subtraction / Basics",
        "Subtraction / Word Problems"
    ],
    // Geometry / Shapes
    "Geometry / Shapes": [
        "Geometry / Shapes",
        "Geometry / Spatial"
    ],
    // Geometry / Spatial
    "Geometry / Spatial": [
        "Geometry / Shapes",
        "Geometry / Spatial"
    ]
};

/**
 * Generate questions for a given category
 * @param {string} category - The skill category from learning plan
 * @param {number} count - Number of questions to generate
 * @param {object} generatorMap - Map of topic to generator functions
 */
const generateQuestionsForCategory = (category, count, generatorMap) => {
    const questions = [];

    // Get relevant topics for this category
    const topics = CATEGORY_TOPIC_MAP[category] || [category];

    // Find generators that match
    const matchingGenerators = [];
    for (const topic of topics) {
        if (generatorMap[topic]) {
            matchingGenerators.push({ topic, generator: generatorMap[topic] });
        }
    }

    // Also try partial matching
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

    // Generate questions round-robin from matching generators
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
 * SkillPracticeSession - Practice mode with 10 dynamic questions for a category
 */
const SkillPracticeSession = () => {
    const { reportId, day } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const category = location.state?.category || "Practice";
    const dayNumber = parseInt(day, 10);

    const [questions, setQuestions] = useState([]);
    const [startTime] = useState(Date.now());
    const [correctCount, setCorrectCount] = useState(0);
    const [sessionLogged, setSessionLogged] = useState(false);

    // Get generator map (currently Grade 1, can be extended based on user's grade)
    const generatorMap = useMemo(() => {
        // TODO: Get user's grade and return appropriate generator map
        return Grade1GeneratorMap;
    }, []);

    // Generate 10 questions on mount
    useEffect(() => {
        const generated = generateQuestionsForCategory(category, 10, generatorMap);
        setQuestions(generated);
    }, [category, generatorMap]);

    // Log practice session when user exits or completes
    const handleSessionEnd = async () => {
        if (sessionLogged || !user?.uid) return;

        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const attempted = questions.filter(q => q.userAnswer !== null).length;

        try {
            await logPracticeSession(user.uid, {
                report_id: parseInt(reportId, 10),
                day_number: dayNumber,
                category,
                questions_attempted: attempted,
                correct_answers: correctCount,
                time_taken_seconds: timeSpent
            });
            setSessionLogged(true);
        } catch (err) {
            console.error("Error logging practice session:", err);
        }
    };

    // Track correct answers
    const handleCorrectAnswer = () => {
        setCorrectCount(prev => prev + 1);
    };

    // Handle exit - log session before leaving
    useEffect(() => {
        return () => {
            handleSessionEnd();
        };
    }, []);

    if (questions.length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: '1rem'
            }}>
                <div>Loading practice questions for {category}...</div>
            </div>
        );
    }

    return (
        <PracticeSession
            initialQuestions={questions}
            generatorMap={generatorMap}
            gradeTitle={`Day ${dayNumber}: ${category}`}
        />
    );
};

export default SkillPracticeSession;
