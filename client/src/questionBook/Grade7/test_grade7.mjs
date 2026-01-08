import Grade7Questions from './GetGrade7Question.mjs';

console.log("Testing Grade 7 Questions...");
let totalQuestions = 0;
let errorCount = 0;

const checkQuestion = (key, question, index) => {
    // Check for essential fields
    if (!question.question || !question.answer || !question.type) {
        console.error(`FAILURE: Missing fields in ${key} question ${index}`);
        errorCount++;
        return;
    }

    if (question.type === 'mcq') {
        if (!question.options) {
            console.error(`FAILURE: Missing options in ${key} question ${index} (MCQ)`);
            errorCount++;
            return;
        }

        // Check option count (MCQ should generally have 4)
        let expectedOptions = 4;

        if (question.options.length !== expectedOptions) {
            console.warn(`WARNING: ${key} question ${index} has ${question.options.length} options, expected ${expectedOptions}. Topic: ${question.topic}`);
        }

        // Check for duplicate options
        const optionValues = question.options.map(o => o.value);
        const uniqueValues = new Set(optionValues);
        if (uniqueValues.size !== question.options.length) {
            console.error(`FAILURE: Duplicate options found in ${key} question ${index}:`, optionValues);
            errorCount++;
        }

        // Check if answer is in options
        const answerInOptions = question.options.some(o => o.value === question.answer);
        if (!answerInOptions) {
            console.error(`FAILURE: Answer "${question.answer}" not found in options for ${key} question ${index}`);
            errorCount++;
        }
    }
};

for (const [key, questions] of Object.entries(Grade7Questions)) {
    console.log(`Checking ${key} (${questions[0]?.topic || 'Unknown'})...`);
    questions.forEach((q, i) => {
        checkQuestion(key, q, i);
        totalQuestions++;
    });
}

console.log(`\nTotal verified: ${totalQuestions}`);
if (errorCount === 0) {
    console.log("SUCCESS: All questions valid.");
} else {
    console.error(`FAILURE: Found ${errorCount} errors.`);
    process.exit(1);
}
