// Firebase imports removed

/**
 * Save questions for a specific subject
 * @param {string} subject - physics | chemistry | biology
 * @param {Array} questions - Array of question objects
 * @param {string} teacherUid - UID of the teacher uploading
 * @returns {Promise<boolean>}
 */
export const saveNeetQuestions = async (subject, questions, teacherUid) => {
    try {
        const response = await fetch(`/api/neet/${subject}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions, teacherUid })
        });
        return response.ok;
    } catch (error) {
        console.error(`Error saving NEET ${subject} questions:`, error);
        return false;
    }
};

/**
 * Fetch all questions for a specific subject, optionally filtered
 * @param {string} subject - physics | chemistry | biology
 * @param {string} [topic] 
 * @param {string} [subTopic]
 * @returns {Promise<Array>}
 */
export const getNeetQuestions = async (subject, topic, subTopic) => {
    try {
        const params = new URLSearchParams();
        if (topic) params.append('topic', topic);
        if (subTopic) params.append('sub_topic', subTopic);

        const response = await fetch(`/api/neet/${subject}?${params.toString()}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error(`Error fetching NEET ${subject} questions:`, error);
        return [];
    }
};

/**
 * Delete a single question
 * @param {string} subject 
 * @param {string} questionId 
 * @returns {Promise<boolean>}
 */
export const deleteNeetQuestion = async (subject, questionId) => {
    try {
        const response = await fetch(`/api/neet/${subject}/${questionId}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error(`Error deleting NEET ${subject} question:`, error);
        return false;
    }
};

/**
 * Update a single question
 * @param {string} subject 
 * @param {string} questionId 
 * @param {object} payload 
 * @returns {Promise<boolean>}
 */
export const updateNeetQuestion = async (subject, questionId, payload) => {
    try {
        const response = await fetch(`/api/neet/${subject}/${questionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return response.ok;
    } catch (error) {
        console.error(`Error updating NEET ${subject} question:`, error);
        return false;
    }
};

/**
 * Clear all questions for a subject
 * @param {string} subject 
 * @returns {Promise<boolean>}
 */
export const clearNeetQuestions = async (subject) => {
    try {
        const response = await fetch(`/api/neet/${subject}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error(`Error clearing NEET ${subject} questions:`, error);
        return false;
    }
};

/**
 * Delete questions by topic (and optional sub-topic)
 * @param {string} subject 
 * @param {string} topic 
 * @param {string} [subTopic] 
 * @returns {Promise<boolean>}
 */
export const deleteNeetTopic = async (subject, topic, subTopic) => {
    try {
        const params = new URLSearchParams();
        params.append('topic', topic);
        if (subTopic) params.append('sub_topic', subTopic);

        const response = await fetch(`/api/neet/${subject}/topic?${params.toString()}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error(`Error deleting NEET topic ${topic}:`, error);
        return false;
    }
};

/**
 * Rename a topic or sub-topic
 * @param {string} subject
 * @param {string} oldTopic
 * @param {string} newTopic
 * @param {string} [oldSubTopic]
 * @param {string} [newSubTopic]
 * @returns {Promise<boolean>}
 */
export const renameNeetTopic = async (subject, oldTopic, newTopic, oldSubTopic, newSubTopic) => {
    try {
        const response = await fetch(`/api/neet/${subject}/topic`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                old_topic: oldTopic,
                new_topic: newTopic,
                old_sub_topic: oldSubTopic,
                new_sub_topic: newSubTopic
            })
        });
        return response.ok;
    } catch (error) {
        console.error(`Error renaming topic:`, error);
        return false;
    }
};

/**
 * Get distinct topics for a subject
 * @param {string} subject 
 * @returns {Promise<{topic: string, sub_topics: string[]}[]>}
 */
export const getNeetTopics = async (subject) => {
    try {
        const response = await fetch(`/api/neet/${subject}/topics`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error(`Error fetching NEET topics for ${subject}:`, error);
        return [];
    }
};

/**
 * Upload questions via file
 * @param {string} subject 
 * @param {File} file 
 * @param {string} topic 
 * @param {string} questionType 
 * @param {string} teacherUid 
 * @returns {Promise<{success: boolean, count?: number}>}
 */
export const uploadNeetQuestionsFile = async (subject, file, topic, subTopic, questionType, teacherUid) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('topic', topic);
        if (subTopic) formData.append('sub_topic', subTopic);
        formData.append('question_type', questionType);
        if (teacherUid) formData.append('teacherUid', teacherUid);

        const response = await fetch(`/api/neet/${subject}/upload`, {
            method: 'POST',
            body: formData
        });

        return await response.json();
    } catch (error) {
        console.error(`Error uploading NEET questions file:`, error);
        return { success: false, error: error.message };
    }
};

/**
 * Generate assessment
 * @param {string} subject 
 * @param {string[]} topics 
 * @param {string[]} subTopics 
 * @param {number} totalQuestions 
 * @param {Array<{type: string, count: number}>} distribution 
 * @returns {Promise<Object>}
 */
export const generateNeetAssessment = async (subject, topics, subTopics = [], totalQuestions = 0, distribution = null) => {
    try {
        const payload = {
            subject,
            topics,
            sub_topics: subTopics,
            total_questions: totalQuestions,
        };

        if (distribution) {
            payload.distribution = distribution;
        }

        const response = await fetch(`/api/neet/assessment/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to generate assessment');
        return await response.json();
    } catch (error) {
        console.error(`Error generating assessment:`, error);
        return null; // Return null on failure
    }
};

/**
 * Save an assessment
 * @param {object} payload 
 * @param {string} teacherUid 
 * @returns {Promise<boolean>}
 */
export const saveNeetAssessment = async (payload, teacherUid) => {
    try {
        const data = { ...payload, teacherUid };
        const response = await fetch('/api/neet/assessment/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.ok;
    } catch (error) {
        console.error('Error saving assessment:', error);
        return false;
    }
};

/**
 * Get saved assessments
 * @param {string} subject 
 * @param {string} teacherUid 
 * @returns {Promise<Array>}
 */
export const getNeetAssessments = async (subject, teacherUid) => {
    try {
        const response = await fetch(`/api/neet/${subject}/assessments?teacherUid=${teacherUid}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return [];
    }
};
