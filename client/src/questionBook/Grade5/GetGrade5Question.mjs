const API_URL = "http://localhost:8000/api/question-book";

export const fetchAllGrade5Questions = async (count = 1) => {
    try {
        const response = await fetch(`${API_URL}/grade5/all?count=${count}`);
        if (!response.ok) throw new Error("Failed to fetch Grade 5 questions");
        return await response.json();
    } catch (error) {
        console.error("Error fetching Grade 5 questions:", error);
        return null;
    }
};

export const fetchGrade5QuestionsByTopic = async (topic, count = 10) => {
    try {
        // topic here is expected to be the key (e.g. q1, q2) or the friendly name?
        // In Grade 1, it used friendly names. But my backend Grade 5 uses keys (q1..q25).
        // However, the Grade1GeneratorMap uses friendly names as keys. 
        // Let's check how Grade 1 maps keys. 
        // In Grade 1 router: `if topic not in GRADE1_GENERATORS`. GRADE1_GENERATORS keys are friendly strings.
        // In Grade 5 router: `if topic not in GRADE5_GENERATORS`. GRADE5_GENERATORS keys are "q1", "q2", etc.

        // So the frontend needs to pass "q1", "q2" etc. to the API.
        // But the GeneratorMap keys usually need to match what the UI expects (often friendly names).

        const response = await fetch(`${API_URL}/grade5/topic?topic=${encodeURIComponent(topic)}&count=${count}`);
        if (!response.ok) throw new Error(`Failed to fetch Grade 5 questions for topic: ${topic}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Grade 5 questions for topic ${topic}:`, error);
        return [];
    }
};

const Grade5Questions = {
    q1: [], q2: [], q3: [], q4: [], q5: [],
    q6: [], q7: [], q8: [], q9: [], q10: [],
    q11: [], q12: [], q13: [], q14: [], q15: [],
    q16: [], q17: [], q18: [], q19: [], q20: [],
    q21: [], q22: [], q23: [], q24: [], q25: []
};

const questionCache = {};

const getGeneratorForTopic = (topicKey) => {
    return async () => {
        if (!questionCache[topicKey] || questionCache[topicKey].length === 0) {
            const batch = await fetchGrade5QuestionsByTopic(topicKey, 10);
            questionCache[topicKey] = batch || [];
        }
        return questionCache[topicKey].length > 0 ? questionCache[topicKey].pop() : null;
    };
};

export const Grade5GeneratorMap = {
    "Number Sense / Place Value": getGeneratorForTopic("q1"),
    "Number Sense / Comparison": getGeneratorForTopic("q2"),
    "Number Sense / Expanded Form": getGeneratorForTopic("q3"),
    "Operations / Addition": getGeneratorForTopic("q4"),
    "Operations / Subtraction": getGeneratorForTopic("q5"),
    "Operations / Multiplication": getGeneratorForTopic("q6"),
    "Operations / Division": getGeneratorForTopic("q7"),
    "Operations / Estimation": getGeneratorForTopic("q8"),
    "Fractions / Equivalent": getGeneratorForTopic("q9"),
    "Fractions / Simplify": getGeneratorForTopic("q10"),
    "Fractions / Mixed Addition": getGeneratorForTopic("q11"),
    "Decimals / Place Value": getGeneratorForTopic("q12"),
    "Decimals / Operations": getGeneratorForTopic("q13"),
    "Measurement / Length": getGeneratorForTopic("q14"),
    "Measurement / Time": getGeneratorForTopic("q15"),
    "Geometry / Angles": getGeneratorForTopic("q16"),
    "Geometry / Area": getGeneratorForTopic("q17"),
    "Geometry / Perimeter": getGeneratorForTopic("q18"),
    "Data Handling / Pie Chart": getGeneratorForTopic("q19"),
    "Number Theory / Factors": getGeneratorForTopic("q20"),
    "Number Theory / LCM": getGeneratorForTopic("q21"),
    "Number Theory / Factor Tree": getGeneratorForTopic("q22"),
    "Geometry / Symmetry": getGeneratorForTopic("q23"),
    "Patterns / Number Patterns": getGeneratorForTopic("q24"),
    "Patterns / Picture Patterns": getGeneratorForTopic("q25")
};

// Export specific generators for other grades to use
export const generateFactorTreeBackend = getGeneratorForTopic("q22");

export default Grade5Questions;
