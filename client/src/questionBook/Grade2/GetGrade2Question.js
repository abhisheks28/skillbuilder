const API_URL = "http://localhost:8000/api/question-book";

export const fetchAllGrade2Questions = async (count = 10) => {
    try {
        const response = await fetch(`${API_URL}/grade2/all?count=${count}`);
        if (!response.ok) throw new Error("Failed to fetch Grade 2 questions");
        return await response.json();
    } catch (error) {
        console.error("Error fetching Grade 2 questions:", error);
        return null;
    }
};

export const fetchGrade2QuestionsByTopic = async (topic, count = 10) => {
    try {
        const response = await fetch(`${API_URL}/grade2/topic?topic=${encodeURIComponent(topic)}&count=${count}`);
        if (!response.ok) throw new Error(`Failed to fetch Grade 2 questions for topic: ${topic}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Grade 2 questions for topic ${topic}:`, error);
        return [];
    }
};

const Grade2Questions = {
    q1: [], q2: [], q3: [], q4: [], q5: [], q6: [], q7: [], q8: [], q9: [], q10: [],
    q11: [], q12: [], q13: [], q14: [], q15: [], q16: [], q17: [], q18: [], q19: [], q20: [],
    q21: [], q22: [], q23: [], q24: [], q25: [], q26: [], q27: [], q28: [], q29: [], q30: []
};

const questionCache = {};

const getGeneratorForTopic = (topic) => {
    return async () => {
        if (!questionCache[topic] || questionCache[topic].length === 0) {
            const batch = await fetchGrade2QuestionsByTopic(topic, 10);
            questionCache[topic] = batch || [];
        }
        return questionCache[topic].length > 0 ? questionCache[topic].pop() : null;
    };
};

export const Grade2GeneratorMap = {
    // Number Sense
    "Number Sense / Counting": getGeneratorForTopic("Number Sense / Counting"),
    "Number Sense / Place Value": getGeneratorForTopic("Number Sense / Place Value"),
    "Number Sense / Value": getGeneratorForTopic("Number Sense / Value"),
    "Number Sense / Expanded Form": getGeneratorForTopic("Number Sense / Expanded Form"),
    "Number Sense / Comparison": getGeneratorForTopic("Number Sense / Comparison"),
    "Number Sense / Ordering": getGeneratorForTopic("Number Sense / Ordering"),
    "Number Sense / Number Names": getGeneratorForTopic("Number Sense / Number Names"),
    "Number Sense / Skip Counting": getGeneratorForTopic("Number Sense / Skip Counting"),
    "Number Sense / Even & Odd": getGeneratorForTopic("Number Sense / Even & Odd"),

    // Addition
    "Addition / Without Carry": getGeneratorForTopic("Addition / Without Carry"),
    "Addition / With Carry": getGeneratorForTopic("Addition / With Carry"),
    "Addition / Word Problems": getGeneratorForTopic("Addition / Word Problems"),

    // Subtraction
    "Subtraction / Without Borrow": getGeneratorForTopic("Subtraction / Without Borrow"),
    "Subtraction / With Borrow": getGeneratorForTopic("Subtraction / With Borrow"),
    "Subtraction / Word Problems": getGeneratorForTopic("Subtraction / Word Problems"),

    // Multiplication
    "Multiplication / Repeated Addition": getGeneratorForTopic("Multiplication / Repeated Addition"),
    "Multiplication / Tables": getGeneratorForTopic("Multiplication / Tables"),

    // Money
    "Money / Basics": getGeneratorForTopic("Money / Basics"),
    "Money / Addition": getGeneratorForTopic("Money / Addition"),
    "Money / Subtraction": getGeneratorForTopic("Money / Subtraction"),

    // Measurement
    "Measurement / Length": getGeneratorForTopic("Measurement / Length"),
    "Measurement / Weight": getGeneratorForTopic("Measurement / Weight"),
    "Measurement / Capacity": getGeneratorForTopic("Measurement / Capacity"),
    "Measurement / Time": getGeneratorForTopic("Measurement / Time"),

    // Geometry
    "Geometry / Shapes": getGeneratorForTopic("Geometry / Shapes"),
    "Geometry / Patterns": getGeneratorForTopic("Geometry / Patterns"),

    // Data Handling
    "Data Handling / Tally": getGeneratorForTopic("Data Handling / Tally"),
    "Data Handling / Pictograph": getGeneratorForTopic("Data Handling / Pictograph"),

    // Logical
    "Logical / Sequences": getGeneratorForTopic("Logical / Sequences"),
    "Logical / Missing Numbers": getGeneratorForTopic("Logical / Missing Numbers")
};

export default Grade2Questions;
