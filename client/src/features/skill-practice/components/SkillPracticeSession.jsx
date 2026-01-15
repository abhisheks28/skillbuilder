"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { logPracticeSession } from "../services/skillPracticeApi";
import PracticeSession from "@/features/practice/components/PracticeSession";

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
    "Grade 11": Grade10GeneratorMap, // Use Grade 10 for Grade 11
    "Grade 12": Grade10GeneratorMap, // Use Grade 10 for Grade 12
};

// Category to topic mapping for dynamic question generation
const CATEGORY_TOPIC_MAP = {
    // Number Sense topics
    "Number Sense / Counting": ["Number Sense / Counting Forwards", "Number Sense / Counting Backwards", "Number Sense / Counting Objects"],
    "Number Sense / Place Value": ["Number Sense / Place Value"],
    "Number Sense / Comparison": ["Number Sense / Comparison"],
    "Number Sense / Expanded Form": ["Number Sense / Expanded Form"],
    // Operations
    "Operations / Addition": ["Operations / Addition"],
    "Operations / Subtraction": ["Operations / Subtraction"],
    "Operations / Multiplication": ["Operations / Multiplication"],
    "Operations / Division": ["Operations / Division"],
    // Addition and Subtraction
    "Addition / Basics": ["Addition / Basics"],
    "Addition / Word Problems": ["Addition / Basics", "Addition / Word Problems"],
    "Subtraction / Basics": ["Subtraction / Basics"],
    "Subtraction / Word Problems": ["Subtraction / Basics", "Subtraction / Word Problems"],
    // Geometry
    "Geometry / Shapes": ["Geometry / Shapes"],
    "Geometry / Spatial": ["Geometry / Spatial"],
    "Geometry / Area": ["Geometry / Area"],
    "Geometry / Perimeter": ["Geometry / Perimeter"],
    "Measurement / Area": ["Geometry / Area"],
    "Measurement / Perimeter": ["Geometry / Perimeter"],
    // Measurement
    "Measurement / Weight": ["Measurement / Weight"],
    "Measurement / Capacity": ["Measurement / Capacity"],
    "Measurement / Length": ["Measurement / Length"],
    "Measurement / Time": ["Measurement / Time"],
    // Fractions and Decimals (for higher grades)
    "Fractions / Basics": ["Fractions / Basics"],
    "Fractions / Operations": ["Fractions / Operations"],
    "Decimals / Basics": ["Decimals / Basics"],
    "Decimals / Operations": ["Decimals / Operations"],

    // --- Grade 6 Mappings ---
    "Integers / Understanding": ["Integers / Understanding"],
    "Integers / Operations": ["Integers / Add"], // Default to Add or Mixed if available
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
    // Mensuration Area/Perimeter merged into general section
    "Data Handling / Mean": ["Data Handling / Mean"],
    "Data Handling / Median": ["Data Handling / Median"],
    "Data Handling / Mode": ["Data Handling / Mode"],
    "Geometry / 3D Shapes": ["Geometry / 3D Shapes"],
    "Geometry / Faces, Vertices, Edges": ["Geometry / Faces Vertices Edges"],
    "3D Shapes / Faces, Vertices, Edges": ["Geometry / Faces Vertices Edges"], // Likely format
    "Symmetry": ["Symmetry / Alphabet"],
    "Measurement / Clock": ["Measurement / Clock"],
    "Clock": ["Clock"],

    // --- Grade 7 Mappings ---
    "Integers / Basics": ["Integers / Mixed Operations"],
    "Rational Numbers / Operations": ["Rational Numbers / Operations"],
    "Exponents / Laws": ["Exponents / Product Law"], // Represents general laws
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
    "Coordinate Geometry": ["Coordinate Geometry / Basics", "Coordinate Geometry"], // Merged G10
    "Linear Equations in Two Variables": ["Linear Equations / Solutions"],
    "Lines and Angles": ["Lines and Angles"],
    "Triangles": ["Triangles", "Geometry / Pythagoras Theorem"], // Merged G10
    "Quadrilaterals": ["Quadrilaterals"],
    "Area of Parallelograms and Triangles": ["Area of Plane Figures"],
    "Circles": ["Area of Plane Figures", "Circles"],
    "Constructions": ["Constructions"],
    "Heron's Formula": ["Mensuration / Triangle Area"],
    "Surface Areas and Volumes": ["Mensuration / Volume & SA", "Surface Areas and Volumes"],
    "Statistics": ["Statistics"],
    "Probability": ["Probability"],

    // --- Grade 10 Mappings ---
    "Real Numbers": ["Real Numbers / Natural & Whole"],
    "Pair of Linear Equations in Two Variables": ["Simultaneous Equations"],
    "Quadratic Equations": ["Quadratic Equations"],
    // Duplicates removed (Polynomials, Triangles, Coordinate Geometry, Circles, Constructions, Surface Areas and Volumes, Statistics, Probability)
    "Introduction to Trigonometry": ["Trigonometry / Standard Angles"],
    "Some Applications of Trigonometry": ["Trigonometry"],
    "Areas Related to Circles": ["Area of Plane Figures"],
};

/**
 * Get the generator map for a given grade
 */
const getGeneratorMapForGrade = (grade) => {
    if (!grade) return Grade1GeneratorMap;
    return GRADE_GENERATOR_MAP[grade] || Grade1GeneratorMap;
};

/**
 * Generate questions for a given category
 * @param {string} category - The skill category from learning plan
 * @param {number} count - Number of questions to generate
 * @param {object} generatorMap - Map of topic to generator functions
 */
const generateQuestionsForCategory = async (category, count, generatorMap) => {
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

    // Also try partial matching if no exact match
    if (matchingGenerators.length === 0) {
        const categoryParts = category.toLowerCase().split(/[\s\/]+/);
        for (const [topic, generator] of Object.entries(generatorMap)) {
            const topicLower = topic.toLowerCase();
            if (categoryParts.some(part => topicLower.includes(part))) {
                matchingGenerators.push({ topic, generator });
            }
        }
    }

    // Fallback: use any available generator from the map
    if (matchingGenerators.length === 0) {
        const allGenerators = Object.entries(generatorMap);
        if (allGenerators.length > 0) {
            console.warn(`No specific generators found for category: ${category}. Using fallback generators.`);
            for (let i = 0; i < Math.min(3, allGenerators.length); i++) {
                const [topic, generator] = allGenerators[i];
                matchingGenerators.push({ topic, generator });
            }
        }
    }

    if (matchingGenerators.length === 0) {
        console.error(`No generators available for category: ${category}`);
        return [];
    }

    // Generate questions round-robin from matching generators
    for (let i = 0; i < count; i++) {
        const { topic, generator } = matchingGenerators[i % matchingGenerators.length];
        try {
            // Some generators might be async (like Grade 1 now)
            const questionRaw = generator();
            const question = questionRaw instanceof Promise ? await questionRaw : questionRaw;

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
 * Uses the student's grade to generate appropriate difficulty questions
 */
const SkillPracticeSession = () => {
    const { reportId, day } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const category = location.state?.category || "Practice";
    const grade = location.state?.grade || "Grade 1"; // Get grade from navigation state
    const dayNumber = parseInt(day, 10);

    const [questions, setQuestions] = useState([]);
    const [startTime] = useState(Date.now());
    const [correctCount, setCorrectCount] = useState(0);
    const [sessionLogged, setSessionLogged] = useState(false);

    // Get generator map based on student's grade
    const generatorMap = useMemo(() => {
        console.log(`[SkillPracticeSession] Using generators for grade: ${grade}`);
        return getGeneratorMapForGrade(grade);
    }, [grade]);

    // Generate 10 questions on mount
    useEffect(() => {
        const loadQuestions = async () => {
            const generated = await generateQuestionsForCategory(category, 10, generatorMap);
            console.log(`[SkillPracticeSession] Generated ${generated.length} questions for ${category} (${grade})`);
            setQuestions(generated);
        };
        loadQuestions();
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
                <div>Loading practice questions for {category} ({grade})...</div>
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
