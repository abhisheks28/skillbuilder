import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getDaysProgress, getSkillAnalytics } from '../services/skillPracticeApi';

/**
 * Hook for managing skill practice progress
 * @param {number} reportId - The report ID to track progress for
 */
export const useSkillProgress = (reportId) => {
    const { user } = useAuth();
    const [daysProgress, setDaysProgress] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProgress = useCallback(async () => {
        if (!reportId || !user?.uid) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await getDaysProgress(reportId, user.uid);
            setDaysProgress(response.days || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching skill progress:', err);
            setError(err.message || 'Failed to load progress');
        } finally {
            setLoading(false);
        }
    }, [reportId, user?.uid]);

    const fetchAnalytics = useCallback(async () => {
        if (!reportId || !user?.uid) return null;

        try {
            const response = await getSkillAnalytics(reportId, user.uid);
            setAnalytics(response);
            return response;
        } catch (err) {
            console.error('Error fetching analytics:', err);
            return null;
        }
    }, [reportId, user?.uid]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    /**
     * Check if a specific day is unlocked
     * @param {number} dayNumber - Day number to check
     */
    const isDayUnlocked = useCallback((dayNumber) => {
        const dayProgress = daysProgress.find(d => d.day_number === dayNumber);
        return dayProgress?.is_unlocked ?? (dayNumber === 1); // Day 1 always unlocked as fallback
    }, [daysProgress]);

    /**
     * Check if a day's assessment is completed
     * @param {number} dayNumber - Day number to check
     */
    const isAssessmentCompleted = useCallback((dayNumber) => {
        const dayProgress = daysProgress.find(d => d.day_number === dayNumber);
        return dayProgress?.assessment_completed ?? false;
    }, [daysProgress]);

    /**
     * Get practice count for a day
     * @param {number} dayNumber - Day number to check
     */
    const getPracticeCount = useCallback((dayNumber) => {
        const dayProgress = daysProgress.find(d => d.day_number === dayNumber);
        return dayProgress?.practice_count ?? 0;
    }, [daysProgress]);

    return {
        daysProgress,
        analytics,
        loading,
        error,
        isDayUnlocked,
        isAssessmentCompleted,
        getPracticeCount,
        refreshProgress: fetchProgress,
        fetchAnalytics
    };
};

export default useSkillProgress;
