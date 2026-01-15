export const regenerateQuestion = async (currentQuestion, generatorMap) => {
    if (!currentQuestion || !generatorMap) return null;

    // 1. Direct topic match (case-insensitive)
    let topicKey = Object.keys(generatorMap).find(k => k.toLowerCase() === currentQuestion.topic?.toLowerCase());
    let generator = topicKey ? generatorMap[topicKey] : null;

    // Resolve specific Grade 1 "fixes" like Counting Backwards vs Forwards
    const topicLower = currentQuestion.topic?.toLowerCase() || "";
    if (topicLower === "number sense / counting") {
        if (currentQuestion.question.toLowerCase().includes("backwards") && generatorMap["Number Sense / Counting Backwards"]) {
            const gen = generatorMap["Number Sense / Counting Backwards"];
            return await gen();
        }
        if (generatorMap["Number Sense / Counting Forwards"]) {
            const gen = generatorMap["Number Sense / Counting Forwards"];
            return await gen();
        }
        if (generator) return await generator();
    }

    // "Number Sense / Skip Counting" -> Needs step inference
    if (currentQuestion.topic === "Number Sense / Skip Counting" && generatorMap["Number Sense / Skip Counting"]) {
        const msg = currentQuestion.question;
        const step = msg.includes("2s") ? 2 : msg.includes("5s") ? 5 : msg.includes("10s") ? 10 : 2;
        return await generatorMap["Number Sense / Skip Counting"](step);
    }

    // "Number Sense / Comparison" -> Greatest vs Smallest
    if (currentQuestion.topic === "Number Sense / Comparison" && generatorMap["Number Sense / Comparison"]) {
        const type = currentQuestion.question.toLowerCase().includes("smallest") ? 'smallest' : 'greatest';
        return await generatorMap["Number Sense / Comparison"](type);
    }

    if (generator) {
        return await generator();
    }

    return null;
};

