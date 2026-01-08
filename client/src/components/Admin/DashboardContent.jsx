'use client';
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Box, Grid, Typography, CircularProgress, Container, Button, Stack } from '@mui/material';
import { Users, CheckCircle, XCircle, FileText, LayoutDashboard, List, Trophy, AlertTriangle, Gift, GraduationCap } from 'lucide-react';
// Firebase imports removed
import StatCard from './StatCard';
import { MarksBarChart, StudentsAreaChart } from './Charts';
import StudentList from './StudentList';
import PuzzleManager from './PuzzleManager';
import SecurityDashboard from './SecurityDashboard';
import TeacherManagement from './TeacherManagement';
// import dynamic from 'next/dynamic'; removed

const LotteryManager = lazy(() => import('./LotteryManager'));
const LuckyDrawWinners = lazy(() => import('./LuckyDrawWinners'));

const DashboardContent = ({ logoutAction }) => {
    const [view, setView] = useState('overview'); // 'overview' | 'students'
    const [growthFilter, setGrowthFilter] = useState('month'); // 'day', 'month', 'year'

    const [stats, setStats] = useState({
        totalStudents: 0,
        totalPassed: 0,
        totalPerfectScores: 0,
        totalReports: 0,
    });
    const [chartData, setChartData] = useState({
        marksByGrade: [],
        studentGrowth: []
    });
    const [studentList, setStudentList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Stats
                const statsRes = await fetch('/api/dashboard/admin/stats');
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch Charts
                const chartsRes = await fetch('/api/dashboard/admin/charts');
                if (chartsRes.ok) {
                    const chartsData = await chartsRes.json();
                    setChartData(chartsData);
                }

                // Fetch Students
                const studentsRes = await fetch('/api/dashboard/admin/students?limit=200');
                if (studentsRes.ok) {
                    const studentsData = await studentsRes.json();
                    setStudentList(studentsData);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter logic removed as backend handles it for now, can be re-enabled if API supports filtering
    // useEffect(() => { ... }, [growthFilter, rawStudentDates]);

    const handleDeleteStudent = async (studentId) => {
        if (!confirm("Are you sure you want to delete this student data? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${studentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Update local state
                setStudentList(prevList => prevList.filter(student => student.id !== studentId));
                setStats(prevStats => ({
                    ...prevStats,
                    totalStudents: prevStats.totalStudents - 1
                }));
            } else {
                alert("Failed to delete user. The user may not exist or an error occurred.");
            }
        } catch (error) {
            console.error("Error deleting student:", error);
            alert("Failed to delete student.");
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <div>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Real-time overview of student performance
                    </Typography>
                </div>
                <form action={logoutAction}>
                    <button type="submit" style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #ff4444',
                        background: 'transparent',
                        color: '#ff4444',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        Logout
                    </button>
                </form>
            </Box>

            {/* Navigation Tabs */}
            <Stack direction="row" spacing={2} mb={4} justifyContent="center" flexWrap="wrap">
                <Button
                    variant={view === 'overview' ? 'contained' : 'outlined'}
                    startIcon={<LayoutDashboard size={20} />}
                    onClick={() => setView('overview')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Overview
                </Button>
                <Button
                    variant={view === 'students' ? 'contained' : 'outlined'}
                    startIcon={<List size={20} />}
                    onClick={() => setView('students')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Students
                </Button>
                <Button
                    variant={view === 'rapid_math' ? 'contained' : 'outlined'}
                    startIcon={<Trophy size={20} />}
                    onClick={() => setView('rapid_math')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Rapid Math
                </Button>
                <Button
                    variant={view === 'puzzles' ? 'contained' : 'outlined'}
                    startIcon={<FileText size={20} />}
                    onClick={() => setView('puzzles')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Puzzles
                </Button>
                <Button
                    variant={view === 'security' ? 'contained' : 'outlined'}
                    startIcon={<AlertTriangle size={20} />}
                    onClick={() => setView('security')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Security
                </Button>
                <Button
                    variant={view === 'lottery' ? 'contained' : 'outlined'}
                    startIcon={<Gift size={20} />}
                    onClick={() => setView('lottery')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Lottery
                </Button>
                <Button
                    variant={view === 'lucky_winners' ? 'contained' : 'outlined'}
                    startIcon={<Trophy size={20} />}
                    onClick={() => setView('lucky_winners')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Lucky Draw Winners
                </Button>
                <Button
                    variant={view === 'teachers' ? 'contained' : 'outlined'}
                    startIcon={<GraduationCap size={20} />}
                    onClick={() => setView('teachers')}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Teachers
                </Button>
            </Stack>

            {view === 'overview' ? (
                <>
                    {/* Stat Cards */}
                    <Grid container spacing={3} mb={6}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Students"
                                value={stats.totalStudents}
                                icon={<Users size={24} />}
                                color="#2196f3"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Average Score"
                                value={stats.totalPassed}
                                icon={<CheckCircle size={24} />}
                                color="#4caf50"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="100% Club"
                                value={stats.totalPerfectScores}
                                icon={<Trophy size={24} />}
                                color="#FFD700"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Reports"
                                value={stats.totalReports}
                                icon={<FileText size={24} />}
                                color="#ff9800"
                            />
                        </Grid>
                    </Grid>

                    {/* Charts */}
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <MarksBarChart data={chartData.marksByGrade} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <StudentsAreaChart
                                data={chartData.studentGrowth}
                                filter={growthFilter}
                                onFilterChange={setGrowthFilter}
                            />
                        </Grid>
                    </Grid>
                </>
            ) : view === 'puzzles' ? (
                <PuzzleManager />
            ) : view === 'security' ? (
                <SecurityDashboard />
            ) : view === 'lottery' ? (
                <Suspense fallback={<CircularProgress />}>
                    <LotteryManager />
                </Suspense>
            ) : view === 'lucky_winners' ? (
                <Suspense fallback={<CircularProgress />}>
                    <LuckyDrawWinners />
                </Suspense>
            ) : view === 'teachers' ? (
                <TeacherManagement />
            ) : (
                <StudentList
                    students={studentList}
                    onDelete={handleDeleteStudent}
                    assessmentType={view === 'rapid_math' ? 'rapid' : 'standard'}
                />
            )}
        </Container>
    );
};

export default DashboardContent;
