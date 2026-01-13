"use client";
import { createContext, useContext, useEffect, useState, useMemo } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userType, setUserType] = useState(null); // 'student', 'parent', 'teacher'
    const [activeChildId, setActiveChildId] = useState(null);
    const [activeChildLoading, setActiveChildLoading] = useState(true);
    const [loading, setLoading] = useState(true);

    // Compute active child from userData + activeChildId
    const activeChild = useMemo(() => {
        if (!userData?.children || !activeChildId) return null;
        return userData.children[activeChildId] || null;
    }, [userData, activeChildId]);

    // Compute if user is a teacher
    const isTeacher = useMemo(() => {
        return userType === 'teacher';
    }, [userType]);

    // Function to fetch and normalize user data from Backend API (PostgreSQL)
    const fetchUserData = async (uid) => {
        if (!uid) {
            setUserData(null);
            setUserType(null);
            return;
        }

        try {
            // Fetch from Python Backend (PostgreSQL)
            const response = await fetch(`/api/users/${uid}`);
            const result = await response.json();

            if (result.success && result.data) {
                const apiData = result.data;
                const role = apiData.role || 'student';

                // Handle Teacher
                if (role === 'teacher') {
                    setUserType('teacher');
                    setUserData({
                        ...apiData,
                        uid: uid,
                        isTeacher: true,
                        userType: 'teacher'
                    });
                    return;
                }

                // Handle Parent/Student
                let normalizedChildren = apiData.children || {};
                const normalizedData = {
                    ...apiData,
                    phoneNumber: apiData.phone_number || "",
                    parentPhone: apiData.phone_number || "",
                    authProvider: 'email',
                    userType: role,
                    children: normalizedChildren
                };

                setUserType(role);
                setUserData(normalizedData);
            } else {
                console.warn("User fetch failed or empty:", result);
                setUserData(null);
                setUserType(null);
            }
        } catch (error) {
            console.error("Error fetching user data from API:", error);
            setUserData(null);
            setUserType(null);
        }
    };

    // Check for existing session
    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('authUser');

            if (token && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser); // Set basic user info
                    await fetchUserData(parsedUser.uid); // Fetch full profile
                } catch (e) {
                    console.error("Session restore error", e);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                }
            }
            setLoading(false);
        };
        checkSession();
    }, []);

    // Initialize activeChildId from localStorage
    useEffect(() => {
        if (!user || !userData?.children) {
            setActiveChildLoading(false);
            return;
        }

        const storedChildId = typeof window !== "undefined"
            ? window.localStorage.getItem(`activeChild_${user.uid}`)
            : null;

        const childKeys = Object.keys(userData.children);

        if (storedChildId && childKeys.includes(storedChildId)) {
            setActiveChildId(storedChildId);
        } else if (childKeys.length > 0) {
            setActiveChildId(childKeys[0]);
        }
        setActiveChildLoading(false);
    }, [user, userData]);

    const updateActiveChild = (childId) => {
        setActiveChildId(childId);
        if (user && typeof window !== "undefined") {
            window.localStorage.setItem(`activeChild_${user.uid}`, childId);
        }
    };

    // New Login Function
    const login = async (email, password) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify(data.user));
            setUser(data.user);
            await fetchUserData(data.user.uid);
            return { success: true };
        } else {
            return { success: false, message: data.detail || "Login failed" };
        }
    };

    // Google Login Function
    const loginWithGoogle = async () => {
        try {
            const { signInWithPopup } = await import("firebase/auth");
            const { auth, googleProvider } = await import("../../../firebase");

            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Sync with backend
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL
                })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('authUser', JSON.stringify(data.user));
                setUser(data.user);
                await fetchUserData(data.user.uid);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: "Backend sync failed" };
            }

        } catch (error) {
            console.error("Google Sign In Error:", error);
            return { success: false, message: error.message };
        }
    };

    // New Register Function
    const register = async (payload) => {
        // Payload expected: email, password, name, role, grade (opt), etc.
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify(data.user));
            setUser(data.user);
            await fetchUserData(data.user.uid);
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.detail || "Registration failed" };
        }
    };

    const logout = async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setUser(null);
        setUserData(null);
        setUserType(null);
        setActiveChildId(null);
    };

    const refreshUserData = async () => {
        if (user) {
            await fetchUserData(user.uid);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            userType,
            isTeacher,
            activeChild,
            activeChildId,
            activeChildLoading,
            setActiveChildId: updateActiveChild,
            loading,
            login,
            loginWithGoogle,
            register,
            logout,
            setUserData,
            refreshUserData
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
