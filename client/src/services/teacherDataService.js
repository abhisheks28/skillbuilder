/**
 * Teacher Data Service
 * Handles all data operations for teacher dashboard
 */

/**
 * Get grades assigned to a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @returns {Promise<Array<string>>} Array of grade names
 */
export const getAssignedGrades = async (teacherUid) => {
    try {
        const response = await fetch(`/api/dashboard/teacher/stats?uid=${teacherUid}`);
        if (response.ok) {
            const data = await response.json();
            return data.assignedGrades || [];
        }
        console.error('API Error fetching assigned grades:', response.status);
        return [];
    } catch (error) {
        console.error('Error fetching assigned grades:', error);
        return [];
    }
};

/**
 * Get all students in a specific grade assigned to a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} grade - Grade name (e.g., "Grade 1")
 * @returns {Promise<Array>} Array of student objects
 */
export const getStudentsByGrade = async (teacherUid, grade) => {
    try {
        const response = await fetch(`/api/dashboard/teacher/students?uid=${teacherUid}&grade=${encodeURIComponent(grade)}`);
        if (response.ok) {
            const students = await response.json();
            return students;
        }
        console.error('API Error fetching students:', response.status);
        return [];
    } catch (error) {
        console.error('Error fetching students by grade:', error);
        return [];
    }
};

/**
 * Get dashboard data for a specific student
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} studentUid - Student's Firebase UID
 * @param {string} childId - Child profile ID (student_id in PG)
 * @returns {Promise<Object|null>} Student dashboard data or null
 */
export const getStudentDashboardData = async (teacherUid, studentUid, childId) => {
    try {
        // Use the dedicated teacher student-detail endpoint
        const response = await fetch(
            `/api/dashboard/teacher/student-detail?uid=${teacherUid}&studentUid=${studentUid}&childId=${childId}`
        );

        if (response.ok) {
            const data = await response.json();
            return {
                reports: data.reports,
                studentInfo: data.studentInfo
            };
        }

        console.error('API Error fetching student dashboard data:', response.status);
        return null;

    } catch (error) {
        console.error('Error fetching student dashboard data:', error);
        return null;
    }
};

/**
 * Check if teacher has access to a specific student
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} studentUid - Student's Firebase UID
 * @param {string} childId - Child profile ID (optional)
 * @returns {Promise<boolean>} True if teacher has access
 */
export const checkTeacherAccess = async (teacherUid, studentUid, childId = null) => {
    // API logic should handle access control. 
    // This frontend check is secondary.
    // We can assume if getStudentsByGrade returned it, we have access.
    // Or we can implement a verify endpoint.
    // For now, return true to let API handle 403.
    return true;
};

/**
 * Get teacher profile data
 * @param {string} teacherUid - Teacher's Firebase UID
 * @returns {Promise<Object|null>} Teacher profile or null
 */
export const getTeacherProfile = async (teacherUid) => {
    try {
        const response = await fetch(`/api/users/${teacherUid}`);
        if (response.ok) {
            const res = await response.json();
            if (res.success && res.data && res.data.role === 'teacher') {
                return res.data;
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching teacher profile:', error);
        return null;
    }
};

/**
 * Get count of students per grade for a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @returns {Promise<Object>} Object with grade names as keys and counts as values
 */
export const getStudentCountsByGrade = async (teacherUid) => {
    try {
        const response = await fetch(`/api/dashboard/teacher/stats?uid=${teacherUid}`);
        if (response.ok) {
            const data = await response.json();
            return data.studentCounts || {};
        }
        return {};
    } catch (error) {
        console.error('Error fetching student counts:', error);
        return {};
    }
};
