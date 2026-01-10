/**
 * Skill Practice API Service
 * Handles all API calls for the skill practice feature
 */

/**
 * Get progress/unlock status for all days in a report
 * @param {number} reportId - The report ID
 * @param {string} uid - Firebase user ID
 */
export const getDaysProgress = async (reportId, uid) => {
    try {
        const response = await fetch(`/api/skill-practice/progress/${reportId}?uid=${encodeURIComponent(uid)}`);
        if (response.ok) {
            return await response.json();
        }
        console.error('API Error fetching days progress:', response.status);
        return { days: [] };
    } catch (error) {
        console.error('Error fetching days progress:', error);
        return { days: [] };
    }
};

/**
 * Complete an assessment for a day
 * @param {string} uid - Firebase user ID
 * @param {object} data - Assessment completion data
 */
export const completeAssessment = async (uid, data) => {
    try {
        const response = await fetch('/api/skill-practice/complete-assessment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, data })
        });
        if (response.ok) {
            return await response.json();
        }
        throw new Error(`API Error: ${response.status}`);
    } catch (error) {
        console.error('Error completing assessment:', error);
        throw error;
    }
};

/**
 * Log a practice session
 * @param {string} uid - Firebase user ID
 * @param {object} data - Practice session data
 */
export const logPracticeSession = async (uid, data) => {
    try {
        const response = await fetch('/api/skill-practice/log-practice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, data })
        });
        if (response.ok) {
            return await response.json();
        }
        throw new Error(`API Error: ${response.status}`);
    } catch (error) {
        console.error('Error logging practice session:', error);
        throw error;
    }
};

/**
 * Get comprehensive analytics for skill practice
 * @param {number} reportId - The report ID
 * @param {string} uid - Firebase user ID
 */
export const getSkillAnalytics = async (reportId, uid) => {
    try {
        const response = await fetch(`/api/skill-practice/analytics/${reportId}?uid=${encodeURIComponent(uid)}`);
        if (response.ok) {
            return await response.json();
        }
        console.error('API Error fetching analytics:', response.status);
        return null;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return null;
    }
};

/**
 * Get practice session history
 * @param {number} reportId - The report ID
 * @param {string} uid - Firebase user ID
 * @param {object} options - Optional filters (dayNumber, sessionType, limit)
 */
export const getPracticeSessions = async (reportId, uid, options = {}) => {
    try {
        const params = new URLSearchParams({ uid });
        if (options.dayNumber) params.append('day_number', options.dayNumber);
        if (options.sessionType) params.append('session_type', options.sessionType);
        if (options.limit) params.append('limit', options.limit);

        const response = await fetch(`/api/skill-practice/sessions/${reportId}?${params.toString()}`);
        if (response.ok) {
            return await response.json();
        }
        console.error('API Error fetching sessions:', response.status);
        return [];
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return [];
    }
};

export default {
    getDaysProgress,
    completeAssessment,
    logPracticeSession,
    getSkillAnalytics,
    getPracticeSessions
};
