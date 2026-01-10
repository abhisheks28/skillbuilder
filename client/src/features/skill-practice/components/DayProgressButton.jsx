import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Play, ClipboardCheck, CheckCircle, RefreshCw } from 'lucide-react';
import Styles from './DayProgressButton.module.css';

/**
 * DayProgressButton - Shows Practice and Assessment buttons for a learning plan day
 * 
 * @param {number} day - Day number
 * @param {string} category - Skill category name 
 * @param {number} reportId - Report ID for tracking
 * @param {boolean} isUnlocked - Whether this day is unlocked
 * @param {boolean} assessmentCompleted - Whether assessment is done
 * @param {number} practiceCount - Number of practice sessions completed
 */
const DayProgressButton = ({
    day,
    category,
    reportId,
    isUnlocked = false,
    assessmentCompleted = false,
    practiceCount = 0
}) => {
    const navigate = useNavigate();

    const handlePracticeClick = () => {
        if (!isUnlocked) return;
        navigate(`/skill-practice/${reportId}/${day}`, {
            state: { category, mode: 'practice' }
        });
    };

    const handleAssessmentClick = () => {
        if (!isUnlocked) return;
        navigate(`/skill-assessment/${reportId}/${day}`, {
            state: { category, mode: 'assessment' }
        });
    };

    if (!isUnlocked) {
        return (
            <div className={Styles.lockedContainer}>
                <Lock size={16} className={Styles.lockIcon} />
                <span className={Styles.lockedText}>Complete Day {day - 1} first</span>
            </div>
        );
    }

    return (
        <div className={Styles.buttonContainer}>
            <button
                className={Styles.practiceButton}
                onClick={handlePracticeClick}
                title={`Practice ${category} - ${practiceCount} sessions completed`}
            >
                {practiceCount > 0 ? (
                    <RefreshCw size={14} className={Styles.buttonIcon} />
                ) : (
                    <Play size={14} className={Styles.buttonIcon} />
                )}
                <span>Practice</span>
                {practiceCount > 0 && (
                    <span className={Styles.countBadge}>{practiceCount}</span>
                )}
            </button>

            <button
                className={`${Styles.assessmentButton} ${assessmentCompleted ? Styles.completed : ''}`}
                onClick={handleAssessmentClick}
                title={assessmentCompleted ? 'Assessment completed' : `Take assessment for ${category}`}
            >
                {assessmentCompleted ? (
                    <CheckCircle size={14} className={Styles.buttonIcon} />
                ) : (
                    <ClipboardCheck size={14} className={Styles.buttonIcon} />
                )}
                <span>{assessmentCompleted ? 'Done' : 'Assess'}</span>
            </button>
        </div>
    );
};

export default DayProgressButton;
