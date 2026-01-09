import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardContent from '@/features/admin/components/DashboardContent';

export default function AdminDashboard() {
    const navigate = useNavigate();

    // In a real app, use a context or API call to check auth
    // For now, we assume if the component loads, we check session via API
    // If we can't implement the API check immediately, we'll verify it loads

    const logoutAdmin = async () => {
        try {
            await fetch('http://localhost:5000/api/auth/logout', { method: 'POST' });
            navigate('/admin-Login');
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    useEffect(() => {
        document.title = "Admin Dashboard - Skill Conquest";
        // Verify Auth API call here...
    }, []);

    return <DashboardContent logoutAction={logoutAdmin} />
}
