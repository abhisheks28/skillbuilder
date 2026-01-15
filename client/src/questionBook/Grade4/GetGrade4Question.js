const API_URL = "http://localhost:8000/api/question-book";

export const fetchAllGrade4Questions = async (count = 10) => {
    try {
        const response = await fetch(`${API_URL}/grade4/all?count=${count}`);
        if (!response.ok) throw new Error("Failed to fetch Grade 4 questions");
        return await response.json();
    } catch (error) {
        console.error("Error fetching Grade 4 questions:", error);
        return null;
    }
};

export const fetchGrade4QuestionsByTopic = async (topic, count = 10) => {
    try {
        const response = await fetch(`${API_URL}/grade4/topic?topic=${encodeURIComponent(topic)}&count=${count}`);
        if (!response.ok) throw new Error(`Failed to fetch Grade 4 questions for topic: ${topic}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Grade 4 questions for topic ${topic}:`, error);
        return [];
    }
};

const Grade4Questions = {
    q1: [], q2: [], q3: [], q4: [], q5: [], q6: [], q7: [], q8: [], q9: [], q10: [],
    q11: [], q12: [], q13: [], q14: [], q15: [], q16: [], q17: [], q18: [], q19: [], q20: [],
    q21: [], q22: [], q23: [], q24: [], q25: [], q26: [], q27: [], q28: []
};

const questionCache = {};

const getGeneratorForTopic = (topic) => {
    return async () => {
        if (!questionCache[topic] || questionCache[topic].length === 0) {
            const batch = await fetchGrade4QuestionsByTopic(topic, 10);
            questionCache[topic] = batch || [];
        }
        return questionCache[topic].length > 0 ? questionCache[topic].pop() : null;
    };
};

export const Grade4GeneratorMap = {
    "Number Sense / Place Value": getGeneratorForTopic("Number Sense / Place Value"),
    "Number Sense / Place Value Visual": getGeneratorForTopic("Number Sense / Place Value Visual"),
    "Number Sense / Expanded Form": getGeneratorForTopic("Number Sense / Expanded Form"),
    "Addition / With Carry": getGeneratorForTopic("Addition / With Carry"),
    "Addition / With Carry Application": getGeneratorForTopic("Addition / With Carry Application"),
    "Subtraction / With Borrow": getGeneratorForTopic("Subtraction / With Borrow"),
    "Subtraction / With Borrow Application": getGeneratorForTopic("Subtraction / With Borrow Application"),
    "Number Sense / Multiplication": getGeneratorForTopic("Number Sense / Multiplication"),
    "Multiplication / 2-digit × 2-digit": getGeneratorForTopic("Multiplication / 2-digit × 2-digit"),
    "Number Sense / Division": getGeneratorForTopic("Number Sense / Division"),
    "Division / 3-digit ÷ 1-digit": getGeneratorForTopic("Division / 3-digit ÷ 1-digit"),
    "Number Sense / Estimation": getGeneratorForTopic("Number Sense / Estimation"),
    "Number Sense / LCM": getGeneratorForTopic("Number Sense / LCM"),
    "Fractions / Types": getGeneratorForTopic("Fractions / Types"),
    "Fractions / Types Mixed": getGeneratorForTopic("Fractions / Types Mixed"),
    "Fractions / Operations": getGeneratorForTopic("Fractions / Operations"),
    "Geometry / Angles": getGeneratorForTopic("Geometry / Angles"),
    "Geometry / Triangles": getGeneratorForTopic("Geometry / Triangles"),
    "Measurement / Area": getGeneratorForTopic("Measurement / Area"),
    "Measurement / Perimeter": getGeneratorForTopic("Measurement / Perimeter"),
    "Measurement / Conversion": getGeneratorForTopic("Measurement / Conversion"),
    "Measurement / Conversion Application": getGeneratorForTopic("Measurement / Conversion Application"),
    "Measurement / Time": getGeneratorForTopic("Measurement / Time"),
    "Data Handling / Bar Graph": getGeneratorForTopic("Data Handling / Bar Graph"),
    "Logical Thinking / Patterns": getGeneratorForTopic("Logical Thinking / Patterns"),
    "Number Patterns": getGeneratorForTopic("Number Patterns"),
    "Geometry / 3D Shapes": getGeneratorForTopic("Geometry / 3D Shapes"),
    "Geometry / 3D Shapes - FVE": getGeneratorForTopic("Geometry / 3D Shapes - FVE")
};

export default Grade4Questions;
