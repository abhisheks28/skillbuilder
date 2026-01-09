import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardContent from '@/features/admin/components/DashboardContent';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const logoutAdmin = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            navigate('/admin-Login');
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    useEffect(() => {
        document.title = "Admin Dashboard - Skill Conquest";

        const verifySession = async () => {
            try {
                const res = await fetch('/api/auth/admin-verify');
                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    navigate('/admin-Login');
                }
            } catch (e) {
                console.error("Verification failed", e);
                navigate('/admin-Login');
            } finally {
                setIsLoading(false);
            }
        };
        verifySession();
    }, [navigate]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <DashboardContent logoutAction={logoutAdmin} />
}
