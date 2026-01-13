import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Button, IconButton, Typography, Box } from '@mui/material';
import { Grid, X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Styles from './QuestionPalette.module.css';

const NeetQuestionPalette = ({
    questions,
    activeQuestionIndex,
    onSelect,
    onPrevious,
    onNext,
    isLastQuestion
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const gridRef = useRef(null);

    const toggleDrawer = (open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setIsOpen(open);
    };

    const PaletteContent = ({ onClose }) => (
        <>
            <div className={Styles.drawerHeader}>
                <Typography variant="h6" fontWeight="bold">Question Palette</Typography>
                {onClose && (
                    <IconButton onClick={onClose}>
                        <X size={24} />
                    </IconButton>
                )}
            </div>

            {/* Outer container scans vertically (column) */}
            <div
                ref={gridRef}
                className={Styles.desktopPalette}
                style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem' }}
            >
                {(() => {
                    // Group questions by type
                    const grouped = questions.reduce((acc, q, index) => {
                        const type = q?.type || 'General';
                        if (!acc[type]) acc[type] = [];
                        acc[type].push({ q, index });
                        return acc;
                    }, {});

                    const keys = Object.keys(grouped);
                    // Define order: MCQ leading, then Statement, Assertion, Previous, General
                    const typeOrder = ['MCQ', 'Statement', 'Assertion', 'Previous'];

                    const getSortIndex = (key) => {
                        const l = key.toLowerCase();
                        if (l.includes('mcq')) return 0;
                        if (l.includes('statement')) return 1;
                        if (l.includes('assertion')) return 2;
                        if (l.includes('previous') || l.includes('pyq')) return 3;
                        return 4; // General
                    };

                    const sortedKeys = keys.sort((a, b) => {
                        const ia = getSortIndex(a);
                        const ib = getSortIndex(b);
                        if (ia !== ib) return ia - ib;
                        return a.localeCompare(b);
                    });

                    return sortedKeys.map(type => (
                        <div key={type} className="w-full">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1 border-b border-slate-100 pb-1">
                                {type.replace(/_/g, ' ')}
                            </h3>
                            {/* Inner container is the grid for buttons */}
                            <div className={Styles.gridContainer} style={{ padding: 0, overflow: 'visible', gap: '0.5rem', gridTemplateColumns: 'repeat(5, 1fr)' }}>
                                {grouped[type].map(({ q, index }) => {
                                    if (!q) return null;
                                    let isCompleted = q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer !== "";

                                    if (isCompleted && typeof q.userAnswer === 'string') {
                                        const trimmed = q.userAnswer.trim();
                                        if (trimmed === '{}' || trimmed === '[]') {
                                            isCompleted = false;
                                        }
                                    }
                                    const isActive = index === activeQuestionIndex;
                                    const isMarkedForReview = q.markedForReview || false;

                                    let className = Styles.gridItem;
                                    if (isMarkedForReview) {
                                        className += ` ${Styles.markedForReview}`;
                                    } else if (isCompleted) {
                                        className += ` ${Styles.completed}`;
                                    }
                                    if (isActive) {
                                        className += ` ${Styles.active}`;
                                    }

                                    return (
                                        <button
                                            key={index}
                                            className={className}
                                            data-index={index}
                                            onClick={() => {
                                                onSelect(index);
                                                if (onClose) onClose();
                                            }}
                                            title={`${type} - Q${index + 1}`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ));
                })()}
            </div>

            <div className={Styles.legend}>
                <div className={Styles.legendItem}>
                    <span className={`${Styles.dot} ${Styles.completed}`}></span>
                    <span>Answered</span>
                </div>
                <div className={Styles.legendItem}>
                    <span className={`${Styles.dot} ${Styles.active}`}></span>
                    <span>Current</span>
                </div>
                <div className={Styles.legendItem}>
                    <span className={Styles.dot}></span>
                    <span>Not Answered</span>
                </div>
            </div>
        </>
    );

    useEffect(() => {
        const scrollTimer = setTimeout(() => {
            if (!gridRef.current) return;
            const button = gridRef.current.querySelector(`[data-index="${activeQuestionIndex}"]`);
            if (!button) return;

            if (typeof button.scrollIntoView === 'function') {
                button.scrollIntoView({
                    block: 'center',
                    inline: 'nearest',
                    behavior: 'smooth'
                });
            }
        }, 100);
        return () => clearTimeout(scrollTimer);
    }, [activeQuestionIndex]);

    return (
        <>
            {/* Desktop View: Expanded Palette */}
            <div className={Styles.desktopPalette}>
                <PaletteContent />

                {/* Navigation Buttons for Desktop */}
                {(onPrevious || onNext) && (
                    <div className={Styles.navigationContainer}>
                        <Button
                            onClick={onPrevious}
                            disabled={activeQuestionIndex === 0}
                            startIcon={<ArrowLeft size={18} />}
                            className={Styles.navButton}
                            variant="outlined"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={onNext}
                            endIcon={isLastQuestion ? <Check size={18} /> : <ArrowRight size={18} />}
                            className={isLastQuestion ? Styles.submitButton : Styles.nextButton}
                            variant="contained"
                        >
                            {isLastQuestion ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile View: Button + Drawer */}
            <div className={Styles.mobilePalette}>
                <Button
                    variant="contained"
                    startIcon={<Grid size={20} />}
                    onClick={toggleDrawer(true)}
                    className={Styles.paletteButton}
                    sx={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        borderColor: 'transparent',
                        borderRadius: '999px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        py: 0.75,
                        '&:hover': {
                            backgroundColor: '#1d4ed8',
                        }
                    }}
                >
                    Questions
                </Button>

                <Drawer
                    anchor="left"
                    open={isOpen}
                    onClose={toggleDrawer(false)}
                    PaperProps={{
                        sx: { width: 320, maxWidth: '80vw' }
                    }}
                >
                    <PaletteContent onClose={toggleDrawer(false)} />
                </Drawer>
            </div>
        </>
    );
};

export default NeetQuestionPalette;
