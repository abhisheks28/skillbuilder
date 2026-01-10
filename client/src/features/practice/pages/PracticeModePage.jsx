import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PracticeSession from '../components/PracticeSession';
import { Grade1GeneratorMap } from '@/questionBook/Grade1/GetGrade1Question';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen.component';

const PracticeModePage = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const day = searchParams.get('day');
    const grade = searchParams.get('grade') || '1'; // Default Grade 1
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!category) {
            navigate('/');
            return;
        }

        // Logic to select generator map based on grade if multiple grades exist
        // For now only Grade 1
        const map = Grade1GeneratorMap;
        const generator = map[category];

        if (generator) {
            try {
                // Generate 10 initial questions
                const generated = Array.from({ length: 10 }, () => generator());
                // Assign topics if missing (generators usually add them)
                const finalQuestions = generated.map(q => ({
                    ...q,
                    topic: q.topic || category
                }));
                setQuestions(finalQuestions);
            } catch (e) {
                console.error("Error generating questions", e);
            }
        }
        setLoading(false);
    }, [category, grade, navigate]);

    if (loading) return <LoadingScreen title="Preparing Practice Session..." />;

    if (questions.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Topic Not Found</h2>
                <p>Could not generate questions for category: {category}</p>
                <button onClick={() => navigate('/')}>Go Back</button>
            </div>
        );
    }

    return (
        <PracticeSession
            initialQuestions={questions}
            generatorMap={Grade1GeneratorMap}
            gradeTitle={`Practice: ${category}`}
            mode="practice"
        />
    );
};

export default PracticeModePage;
