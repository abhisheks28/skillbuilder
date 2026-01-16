const API_URL = "http://localhost:8000/api/question-book";

export const fetchAllGrade3Questions = async (count = 10) => {
    try {
        const response = await fetch(`${API_URL}/grade3/all?count=${count}`);
        if (!response.ok) throw new Error("Failed to fetch Grade 3 questions");
        return await response.json();
    } catch (error) {
        console.error("Error fetching Grade 3 questions:", error);
        return null;
    }
};

export const fetchGrade3QuestionsByTopic = async (topic, count = 10) => {
    try {
        const response = await fetch(`${API_URL}/grade3/topic?topic=${encodeURIComponent(topic)}&count=${count}`);
        if (!response.ok) throw new Error(`Failed to fetch Grade 3 questions for topic: ${topic}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Grade 3 questions for topic ${topic}:`, error);
        return [];
    }
};

const Grade3Questions = {
    q1: [], q2: [], q3: [], q4: [], q5: [], q6: [], q7: [], q8: [], q9: [], q10: [],
    q11: [], q12: [], q13: [], q14: [], q15: [], q16: [], q17: [], q18: [], q19: [], q20: [],
    q21: [], q22: [], q23: [], q24: [], q25: [], q26: [], q27: [], q28: []
};

const questionCache = {};

const getGeneratorForTopic = (topic) => {
    return async () => {
        if (!questionCache[topic] || questionCache[topic].length === 0) {
            const batch = await fetchGrade3QuestionsByTopic(topic, 10);
            questionCache[topic] = batch || [];
        }
        return questionCache[topic].length > 0 ? questionCache[topic].pop() : null;
    };
};

export const Grade3GeneratorMap = {
    "Number Sense / Addition": getGeneratorForTopic("Number Sense / Addition"),
    "Number Sense / Subtraction": getGeneratorForTopic("Number Sense / Subtraction"),
    "Number Sense / Multiplication": getGeneratorForTopic("Number Sense / Multiplication"),
    "Number Sense / Division": getGeneratorForTopic("Number Sense / Division"),
    "Number Sense / Missing Number": getGeneratorForTopic("Number Sense / Missing Number"),
    "Number Sense / Mixed Operations": getGeneratorForTopic("Number Sense / Mixed Operations"),
    "Number Sense / Fractions": getGeneratorForTopic("Number Sense / Fractions"),
    "Number Sense / Compare Fractions": getGeneratorForTopic("Number Sense / Compare Fractions"),
    "Number Sense / Number Names": getGeneratorForTopic("Number Sense / Number Names"),
    "Number Sense / Number Reading": getGeneratorForTopic("Number Sense / Number Reading"),
    "Number Sense / Doubling": getGeneratorForTopic("Number Sense / Doubling"),
    "Number Sense / Halving": getGeneratorForTopic("Number Sense / Halving"),
    "Geometry / 3D Shapes": getGeneratorForTopic("Geometry / 3D Shapes"),
    "Geometry / Symmetry": getGeneratorForTopic("Geometry / Symmetry"),
    "Geometry / Shape Recognition": getGeneratorForTopic("Geometry / Shape Recognition"),
    "Measurement / Length": getGeneratorForTopic("Measurement / Length"),
    "Measurement / Weight": getGeneratorForTopic("Measurement / Weight"),
    "Measurement / Capacity": getGeneratorForTopic("Measurement / Capacity"),
    "Measurement / Time": getGeneratorForTopic("Measurement / Time"),
    "Money / Basics": getGeneratorForTopic("Money / Basics"),
    "Money / Operations": getGeneratorForTopic("Money / Operations"),
    "Data Handling / Tally": getGeneratorForTopic("Data Handling / Tally"),
    "Patterns / Number Patterns": getGeneratorForTopic("Patterns / Number Patterns")
};

export default Grade3Questions;
