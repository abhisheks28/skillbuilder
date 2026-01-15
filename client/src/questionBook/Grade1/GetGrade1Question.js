const API_URL = "http://localhost:8000/api/question-book";

export const fetchAllGrade1Questions = async (count = 10) => {
    try {
        const response = await fetch(`${API_URL}/grade1/all?count=${count}`);
        if (!response.ok) throw new Error("Failed to fetch Grade 1 questions");
        return await response.json();
    } catch (error) {
        console.error("Error fetching Grade 1 questions:", error);
        return null; // Handle appropriately in UI
    }
};

export const fetchGrade1QuestionsByTopic = async (topic, count = 10) => {
    try {
        const response = await fetch(`${API_URL}/grade1/topic?topic=${encodeURIComponent(topic)}&count=${count}`);
        if (!response.ok) throw new Error(`Failed to fetch Grade 1 questions for topic: ${topic}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Grade 1 questions for topic ${topic}:`, error);
        return [];
    }
};

// For backward compatibility with existing code that might expect the Grade1Questions object
// We can export a function to load it, or a placeholder that components can use to trigger a fetch.
const Grade1Questions = {
    // These will be empty initially and should be fetched
    q1: [], q2: [], q3: [], q4: [], q5: [], q6: [], q7: [], q8: [], q9: [], q10: [],
    q11: [], q12: [], q13: [], q14: [], q15: [], q16: [], q17: [], q18: [], q19: [], q20: [],
    q21: [], q22: [], q23: [], q24: [], q25: []
};

const questionCache = {};

const getGeneratorForTopic = (topic) => {
    return async () => {
        if (!questionCache[topic] || questionCache[topic].length === 0) {
            const batch = await fetchGrade1QuestionsByTopic(topic, 10);
            questionCache[topic] = batch || [];
        }
        return questionCache[topic].length > 0 ? questionCache[topic].pop() : null;
    };
};

export const Grade1GeneratorMap = {
    "Number Sense / Counting Objects": getGeneratorForTopic("Number Sense / Counting Objects"),
    "Number Sense / Place Value": getGeneratorForTopic("Number Sense / Place Value"),
    "Number Sense / Even & Odd": getGeneratorForTopic("Number Sense / Even & Odd"),
    "Number Sense / Before & After": getGeneratorForTopic("Number Sense / Before & After"),
    "Number Sense / Between": getGeneratorForTopic("Number Sense / Between"),
    "Number Sense / Counting Forwards": getGeneratorForTopic("Number Sense / Counting Forwards"),
    "Number Sense / Counting Backwards": getGeneratorForTopic("Number Sense / Counting Backwards"),
    "Number Sense / Skip Counting": getGeneratorForTopic("Number Sense / Skip Counting"),
    "Number Sense / Comparison": getGeneratorForTopic("Number Sense / Comparison"),
    "Addition / Basics": getGeneratorForTopic("Addition / Basics"),
    "Addition / Word Problems": getGeneratorForTopic("Addition / Word Problems"),
    "Subtraction / Basics": getGeneratorForTopic("Subtraction / Basics"),
    "Subtraction / Word Problems": getGeneratorForTopic("Subtraction / Word Problems"),
    "Geometry / Shapes": getGeneratorForTopic("Geometry / Shapes"),
    "Geometry / Spatial": getGeneratorForTopic("Geometry / Spatial"),
    "Measurement / Length": getGeneratorForTopic("Measurement / Length"),
    "Measurement / Weight": getGeneratorForTopic("Measurement / Weight"),
    "Measurement / Capacity": getGeneratorForTopic("Measurement / Capacity"),
    "Time / Basics": getGeneratorForTopic("Time / Basics"),
    "Time / Days of Week": getGeneratorForTopic("Time / Days of Week"),
    "Money / Basics": getGeneratorForTopic("Money / Basics"),
    "Patterns / Basics": getGeneratorForTopic("Patterns / Basics"),
    "Patterns / Sequences": getGeneratorForTopic("Patterns / Sequences"),
    "Data Handling / Tally": getGeneratorForTopic("Data Handling / Tally"),
    "Data Handling / Picture Graph": getGeneratorForTopic("Data Handling / Picture Graph")
};

export default Grade1Questions;
