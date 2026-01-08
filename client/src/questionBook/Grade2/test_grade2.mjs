import Grade2Questions from './GetGrade2Question.mjs';

console.log("Testing Grade 2 Questions...");
let totalQuestions = 0;
let errors = 0;

try {
    // Check q5 specifically
    const q5 = Grade2Questions.q5;
    console.log("Checking q5 (Ascending/Descending)...");
    q5.forEach((q, i) => {
        if (q.options.length !== 4) {
            console.error(`Error in q5[${i}]: Expected 4 options, got ${q.options.length}`);
            console.log(q.options);
            errors++;
        }
        // Check for "9H" in options
        q.options.forEach(opt => {
            if (opt.value.includes("9H") || opt.value.includes("H ")) {
                console.error(`Error in q5[${i}]: Found suspicious option: ${opt.value}`);
                errors++;
            }
        });
    });

    for (const [key, questions] of Object.entries(Grade2Questions)) {
        // console.log(`Checking ${key}: ${questions.length} questions`);
        totalQuestions += questions.length;
        if (questions.length === 0) {
            console.error(`Error: ${key} is empty`);
            errors++;
        }
        questions.forEach((q, i) => {
            if (!q.question || !q.answer) {
                console.error(`Error in ${key}[${i}]: Missing fields`, q);
                errors++;
            }

            if (q.type === 'mcq') {
                if (!q.options) {
                    console.error(`Error in ${key}[${i}]: Missing options for MCQ`, q);
                    errors++;
                } else {
                    if (q.options.length !== 4 && q.topic !== "Number Sense / Even & Odd" && q.topic !== "Measurement / Weight" && q.topic !== "Measurement / Capacity" && q.topic !== "Geometry / Patterns" && q.topic !== "Number Sense / Comparison") {
                        console.warn(`Warning in ${key}[${i}]: Expected 4 options, got ${q.options.length} (Topic: ${q.topic})`);
                    }

                    // Check for duplicate options
                    const values = q.options.map(o => o.value);
                    const uniqueValues = new Set(values);
                    if (uniqueValues.size !== values.length) {
                        console.error(`Error in ${key}[${i}]: Duplicate options found:`, values);
                        errors++;
                    }
                }
            }
        });
    }
    console.log(`Total verified: ${totalQuestions}`);
    if (errors === 0) {
        console.log("SUCCESS: All questions valid.");
    } else {
        console.log(`FAILURE: Found ${errors} errors.`);
        process.exit(1);
    }
} catch (e) {
    console.error("Exception:", e);
    process.exit(1);
}
