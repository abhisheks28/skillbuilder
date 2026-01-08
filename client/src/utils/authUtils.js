/**
 * Authentication Utility Functions
 * Helper functions for user authentication and identification
 */

/**
 * Get the database key for a user
 * Used to identify users in API calls and database operations
 * @param {Object} user - The user object from AuthContext
 * @returns {string|null} The user's UID or null if no user
 */
export const getUserDatabaseKey = (user) => {
    if (!user) return null;
    // Return the user's unique identifier (Firebase UID format from PostgreSQL)
    return user.uid;
};
