// Firebase imports removed

/**
 * Get all teachers from backend
 * @returns {Promise<Array>} Array of teacher objects
 */
export const getAllTeachers = async () => {
    try {
        const response = await fetch('/api/teachers/');
        if (response.ok) {
            return await response.json();
        }
        console.error('API Error fetching teachers:', response.status);
        return [];
    } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
    }
};

/**
 * Get teacher details with full assignment information
 * @param {string} teacherUid - Teacher's Firebase UID
 * @returns {Promise<Object|null>} Teacher details object
 */
export const getTeacherDetails = async (teacherUid) => {
    try {
        const response = await fetch(`/api/teachers/${teacherUid}`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error fetching teacher details:', error);
        return null;
    }
};

/**
 * Assign grades to a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {Array<string>} grades - Array of grade names
 * @param {string} adminUid - Admin's Firebase UID
 * @returns {Promise<boolean>} Success status
 */
export const assignGradesToTeacher = async (teacherUid, grades, adminUid) => {
    try {
        const response = await fetch(`/api/teachers/${teacherUid}/grades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grades, adminUid })
        });
        return response.ok;
    } catch (error) {
        console.error('Error assigning grades to teacher:', error);
        return false;
    }
};

/**
 * Assign students to a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {Array<Object>} students - Array of student objects {uid, childId, grade}
 * @param {string} adminUid - Admin's Firebase UID
 * @returns {Promise<boolean>} Success status
 */
export const assignStudentsToTeacher = async (teacherUid, students, adminUid) => {
    try {
        const response = await fetch(`/api/teachers/${teacherUid}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ students, adminUid })
        });
        return response.ok;
    } catch (error) {
        console.error('Error assigning students to teacher:', error);
        return false;
    }
};

/**
 * Remove a grade assignment from teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} grade - Grade to remove
 * @returns {Promise<boolean>} Success status
 */
export const removeGradeFromTeacher = async (teacherUid, grade) => {
    try {
        const response = await fetch(`/api/teachers/${teacherUid}/grades/${encodeURIComponent(grade)}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Error removing grade from teacher:', error);
        return false;
    }
};

/**
 * Remove a student assignment from teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} studentUid - Student's user UID (or string childId if new system?)
 * @returns {Promise<boolean>} Success status
 */
export const removeStudentFromTeacher = async (teacherUid, studentUid) => {
    try {
        const response = await fetch(`/api/teachers/${teacherUid}/students/${studentUid}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Error removing student from teacher:', error);
        return false;
    }
};

/**
 * Reset all assignments for a teacher
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} adminUid - Admin's Firebase UID
 * @returns {Promise<boolean>} Success status
 */
export const resetTeacherAssignments = async (teacherUid, adminUid) => {
    try {
        const response = await fetch(`/api/teachers/${teacherUid}/reset`, {
            method: 'POST'
        });
        return response.ok;
    } catch (error) {
        console.error('Error resetting teacher assignments:', error);
        return false;
    }
};

/**
 * Update teacher permissions (Currently unused/placeholder in backend)
 * @param {string} teacherUid 
 * @param {Object} permissions 
 * @param {string} adminUid 
 */
export const updateTeacherPermissions = async (teacherUid, permissions, adminUid) => {
    try {
        const response = await fetch(`/api/teachers/${teacherUid}/permissions`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...permissions, adminUid })
        });
        return response.ok;
    } catch (error) {
        console.error('Error updating teacher permissions:', error);
        return false;
    }
};

/**
 * Get all students filtered by grade (for assignment modal)
 * @param {string} grade - Grade to filter by
 * @returns {Promise<Array>} Array of student objects
 */
export const getStudentsByGrade = async (grade) => {
    try {
        // Using existing student list API? Or admin one?
        // Dashboard Admin List is paginated.
        // We might need a new endpoint OR reuse existing one.
        // Let's reuse /api/dashboard/admin/students or create a specialized one.
        // Wait, `teachers.py` does not have a "list all students" endpoint.
        // But `dashboard.py` has `get_admin_students`. It's paginated. 
        // The modal likely needs ALL students for a grade to select them.
        // I will call `get_teacher_students` but generic? No.

        // Let's assume we use /api/dashboard/admin/students but filtering by grade?
        // The current implementation is paginated and doesn't filter by grade in arguments.

        // For now, let's keep the backend logic for this simple:
        // I should create a helper endpoint in `teachers.py` or modify `dashboard.py`.
        // Let's modify `dashboard.py` or just verify what works. 
        // Wait, `get_teacher_students` filters by grade but only for ASSIGNED students.

        // Actually, `getStudentsByGrade` is asking for ALL POTENTIAL students to assign.
        // I need an endpoint for this.
        // I will add `GET /api/teachers/students/available?grade=...` to `teachers.py`.
        // For now I will mock or try to use what I have.

        // Let's ADD `get_available_students` to `teachers.py`!

        const response = await fetch(`/api/teachers/students/available?grade=${encodeURIComponent(grade)}`);
        if (response.ok) return await response.json();

        return [];

    } catch (error) {
        console.error('Error fetching students by grade:', error);
        return [];
    }
};

/**
 * Get details for a batch of students (Legacy helper)
 */
export const getStudentDetailsBatch = async (studentsList) => {
    // This was used to hydrate IDs.
    // If our new APIs return full objects, this might be redundant.
    // But if used, we can implement it.
    return studentsList;
};

/**
 * Delete a teacher (and underlying user)
 * @param {string} teacherUid - Teacher's Firebase UID
 * @returns {Promise<boolean>} Success status
 */
export const deleteTeacher = async (teacherUid) => {
    try {
        const response = await fetch(`/api/users/${teacherUid}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting teacher:', error);
        return false;
    }
};
