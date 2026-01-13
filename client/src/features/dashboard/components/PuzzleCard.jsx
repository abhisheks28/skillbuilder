'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import { Brain, ArrowRight, Lock } from 'lucide-react';
import PuzzleModal from './PuzzleModal';

const PuzzleCard = ({ user, activeChild, activeChildId }) => {
    const [puzzle, setPuzzle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchPuzzleAndStatus = async () => {
            if (!user) return;

            // Determine Grade
            const gradeSource = activeChild?.grade || user?.grade;
            let userGrade = 5; // Default fallback

            if (gradeSource) {
                const gradeString = String(gradeSource);
                const match = gradeString.match(/\d+/);
                if (match) {
                    userGrade = parseInt(match[0]);
                }
            }

            try {
                // Fetch Daily Puzzle from API
                const uid = user.uid;
                const response = await fetch(`/api/puzzles/daily?uid=${uid}&grade=${userGrade}`);
                const result = await response.json();

                if (result.completed) {
                    setIsCompleted(true);
                    setLoading(false);
                } else if (result.puzzle) {
                    setPuzzle(result.puzzle);
                    setIsCompleted(false);
                } else {
                    // No puzzle available
                    setPuzzle(null);
                    setMessage(result.message || "Check back tomorrow!");
                }

            } catch (error) {
                console.error("Error fetching puzzle:", error);
                setMessage("Couldn't load puzzle.");
            } finally {
                setLoading(false);
            }
        };

        fetchPuzzleAndStatus();
    }, [user, activeChild]);

    const handlePuzzleComplete = () => {
        setIsCompleted(true);
        setModalOpen(false);
    };

    if (loading) {
        return <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4 }} />;
    }

    // COMPLETED STATE
    if (isCompleted) {
        return (
            <Box sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald Gradient
                borderRadius: 4,
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2 }}>
                    <Brain size={120} />
                </Box>
                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', mb: 1.5 }}>
                    <Brain size={28} />
                </Box>
                <Typography variant="h6" fontWeight="bold">
                    Puzzle Solved!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: '90%' }}>
                    Great job! Come back tomorrow for a new challenge.
                </Typography>
            </Box>
        );
    }

    if (!puzzle) {
        // Fallback or "No Puzzle Today" state
        return (
            <Box sx={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: 4,
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #dee2e6'
            }}>
                <Brain size={32} color="#adb5bd" style={{ marginBottom: 8 }} />
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {message || "No puzzle today"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Check back tomorrow!
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', // Indigo Gradient
                borderRadius: 4,
                p: 3,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.4)'
                }
            }}
                onClick={() => setModalOpen(true)}
            >
                {/* Background Decoration */}
                <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2 }}>
                    <Brain size={120} />
                </Box>

                <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                        <Box sx={{ p: 0.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                            <Brain size={18} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ opacity: 0.9, letterSpacing: '0.5px' }}>
                            PUZZLE OF THE DAY
                        </Typography>
                    </Box>

                    <Typography variant="h6" fontWeight="800" sx={{ mb: 2, lineHeight: 1.3, maxWidth: '85%' }}>
                        Ready to exercise your brain?
                    </Typography>

                    <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowRight size={16} />}
                        sx={{
                            bgcolor: 'white',
                            color: '#4f46e5',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: 2,
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.9)'
                            }
                        }}
                    >
                        Solve Now
                    </Button>
                </Box>
            </Box>

            <PuzzleModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                puzzle={puzzle}
                user={user}
                onComplete={handlePuzzleComplete}
            />
        </>
    );
};

export default PuzzleCard;
