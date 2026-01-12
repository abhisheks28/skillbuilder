"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, ChevronDown, PlayCircle } from 'lucide-react';
import { getNeetTopics, generateNeetAssessment } from '@/services/neetQuestionService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { toast } from 'sonner';

const NeetTopicSelection = () => {
    const { subject } = useParams(); // 'Physics', 'Chemistry', 'Biology'
    const navigate = useNavigate();
    const { user } = useAuth();

    // Normalize subject title case for display
    const displaySubject = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : "";

    const [topicsData, setTopicsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTopic, setExpandedTopic] = useState(null);

    // State for selection and config
    const [selectedTopics, setSelectedTopics] = useState(new Set()); // Set of "Topic" strings
    const [selectedSubTopics, setSelectedSubTopics] = useState(new Set()); // Set of "Topic|SubTopic"

    // Config State
    const [duration, setDuration] = useState(60); // Minutes
    const [distribution, setDistribution] = useState({
        MCQ: 20,
        Assertion: 10,
        Statement: 10,
        Match: 5,
        PYQ: 5
    });

    useEffect(() => {
        if (!subject) return;

        // Reset selections when subject changes
        setSelectedTopics(new Set());
        setSelectedSubTopics(new Set());
        setExpandedTopic(null);

        const fetchData = async () => {
            setLoading(true);
            try {
                // Determine API subject param (handle case sensitivity logic if needed, backend now handles LOWER match)
                const data = await getNeetTopics(subject);
                if (Array.isArray(data)) {
                    setTopicsData(data);
                } else {
                    setTopicsData([]);
                }
            } catch (err) {
                console.error("Failed to fetch topics", err);
                toast.error("Failed to load topics");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [subject]);

    const handleBack = () => navigate('/neet');

    const toggleTopic = (topicName) => {
        setExpandedTopic(expandedTopic === topicName ? null : topicName);
    };

    const toggleSelection = (topic, subTopic = null) => {
        if (subTopic) {
            // Toggle Sub-topic
            const key = `${topic}|${subTopic}`;
            const newSubs = new Set(selectedSubTopics);
            if (newSubs.has(key)) {
                newSubs.delete(key);
            } else {
                newSubs.add(key);
            }
            setSelectedSubTopics(newSubs);

            // Update parent topic selection status based on sub-topics
            const topicItem = topicsData.find(t => t.topic === topic);
            if (topicItem && topicItem.sub_topics) {
                const allSubKeys = topicItem.sub_topics.map(s => `${topic}|${(typeof s === 'object' && s) ? s.name : s}`);
                const allSelected = allSubKeys.every(k => newSubs.has(k));
                const newTopics = new Set(selectedTopics);
                if (allSelected) {
                    newTopics.add(topic);
                } else {
                    newTopics.delete(topic);
                }
                setSelectedTopics(newTopics);
            }

        } else {
            // Toggle Main Topic (Select all/none subtopics)
            const topicItem = topicsData.find(t => t.topic === topic);
            if (!topicItem) return;

            const isSelected = selectedTopics.has(topic);
            const newTopics = new Set(selectedTopics);
            const newSubs = new Set(selectedSubTopics);

            if (isSelected) {
                newTopics.delete(topic);
                // Deselect all its subtopics
                if (topicItem.sub_topics) {
                    topicItem.sub_topics.forEach(sub => {
                        const sName = (typeof sub === 'object' && sub) ? sub.name : sub;
                        newSubs.delete(`${topic}|${sName}`);
                    });
                }
            } else {
                newTopics.add(topic);
                // Select all its subtopics
                if (topicItem.sub_topics) {
                    topicItem.sub_topics.forEach(sub => {
                        const sName = (typeof sub === 'object' && sub) ? sub.name : s;
                        newSubs.add(`${topic}|${sName}`);
                    });
                }
            }
            setSelectedTopics(newTopics);
            setSelectedSubTopics(newSubs);
        }
    };

    const handleStartAssessment = async () => {
        if (selectedSubTopics.size === 0) {
            toast.error("Please select at least one topic/sub-topic.");
            return;
        }

        const subjectsList = [];
        const subTopicsList = [];

        // Parse the sets
        selectedSubTopics.forEach(key => {
            const [t, s] = key.split('|');
            if (!subjectsList.includes(t)) subjectsList.push(t);
            subTopicsList.push(s);
        });

        const distPayload = Object.entries(distribution)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => ({ type, count }));

        const payload = {
            subject: subject, // from params
            topics: subjectsList,
            sub_topics: subTopicsList,
            distribution: distPayload,
            total_questions: 0 // Ignored if distribution present
        };

        try {
            setLoading(true);
            const questions = await generateNeetAssessment(
                subject,
                subjectsList,
                subTopicsList,
                0,
                distPayload
            );

            if (!questions || questions.length === 0) {
                toast.error("No questions found for the selected criteria.");
                setLoading(false);
                return;
            }

            // Navigate with state
            navigate(`/neet/practice/${subject}?mode=assessment`, {
                state: {
                    questions: questions,
                    duration: duration,
                    mode: 'assessment'
                }
            });

        } catch (err) {
            console.error(err);
            toast.error("Error creating assessment");
            setLoading(false);
        }
    };

    const toRoman = (num) => {
        const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
        let roman = '';
        for (let i in lookup) {
            while (num >= lookup[i]) {
                roman += i;
                num -= lookup[i];
            }
        }
        return roman;
    };

    // Calculate available questions per type based on selection
    const availableCounts = useMemo(() => {
        const counts = { MCQ: 0, Assertion: 0, Statement: 0, Match: 0, PYQ: 0 };
        // Initialize counts for all keys in distribution to be safe
        Object.keys(distribution).forEach(key => counts[key] = 0);

        topicsData.forEach(topic => {
            if (topic.sub_topics) {
                topic.sub_topics.forEach(sub => {
                    const sName = (typeof sub === 'object' && sub) ? sub.name : sub;
                    const subKey = `${topic.topic}|${sName}`;

                    if (selectedSubTopics.has(subKey) && sub && sub.types) {
                        Object.entries(sub.types).forEach(([rawType, count]) => {
                            const qt = rawType.toLowerCase();
                            // Map specific types to keys
                            if (qt.includes('mcq')) counts.MCQ += count;
                            else if (qt.includes('assertion')) counts.Assertion += count;
                            else if (qt.includes('statement')) counts.Statement += count;
                            else if (qt.includes('match') && !qt.includes('previous')) counts.Match += count;
                            else if (qt.includes('pyq') || qt.includes('previous')) counts.PYQ += count;
                        });
                    }
                });
            }
        });
        return counts;
    }, [topicsData, selectedSubTopics, distribution]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {displaySubject} Practice
                        </h1>
                        <p className="text-sm text-slate-500">Select topics to create your assessment</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT PANEL: Topic Selection */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {loading && topicsData.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : topicsData.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="text-slate-400" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">No Topics Found</h3>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="p-4 bg-yellow-50 text-xs font-mono overflow-auto max-h-[500px]">
                                <h4 className="font-bold mb-2">DEBUG DATA:</h4>
                                <pre>{JSON.stringify(topicsData, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL: Assessment Config */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <PlayCircle className="text-indigo-600" />
                            Prepare Assessment
                        </h2>

                        <div className="space-y-6">
                            {/* Summary */}
                            {/* Summary */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-600 text-sm">Selected Topics</span>
                                    <span className="font-bold text-slate-800">{selectedTopics.size}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-600 text-sm">Selected Sub-topics</span>
                                    <span className="font-bold text-slate-800">{selectedSubTopics.size}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
                                    <span className="text-slate-600 text-sm font-medium">Available Questions</span>
                                    <span className="font-bold text-indigo-600">
                                        {(() => {
                                            let total = 0;
                                            topicsData.forEach(topic => {
                                                if (topic.sub_topics) {
                                                    topic.sub_topics.forEach(sub => {
                                                        const sName = (typeof sub === 'object' && sub) ? sub.name : sub;
                                                        const sCount = (typeof sub === 'object' && sub) ? (sub.count || 0) : 0;
                                                        const key = `${topic.topic}|${sName}`;
                                                        if (selectedSubTopics.has(key)) {
                                                            total += sCount;
                                                        }
                                                    });
                                                }
                                            });
                                            return total;
                                        })()}
                                    </span>
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (Minutes)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* Question Distribution */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Question Distribution</label>
                                <div className="space-y-3">
                                    {Object.keys(distribution).map(type => {
                                        const count = availableCounts[type] || 0;
                                        if (count === 0) return null; // Hide if not available

                                        const maxLimit = count;

                                        return (
                                            <div key={type}>
                                                <div className="flex justify-between text-xs text-slate-600 mb-1">
                                                    <span>{type === 'PYQ' ? 'Previous Year Questions' : type}</span>
                                                    <span className={maxLimit === 0 ? "font-medium text-slate-400" : "font-medium text-indigo-600"}>
                                                        {Math.min(distribution[type], maxLimit)} / {maxLimit} Available
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={maxLimit}
                                                    value={distribution[type] > maxLimit ? maxLimit : distribution[type]}
                                                    onChange={(e) => setDistribution({ ...distribution, [type]: parseInt(e.target.value) })}
                                                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 flex flex-col gap-1 items-end">
                                    <div className="text-xs font-bold text-indigo-600">
                                        Requested: {
                                            Object.keys(distribution).reduce((acc, type) => {
                                                const max = availableCounts[type] || 0;
                                                if (max === 0) return acc;
                                                const requested = distribution[type];
                                                return acc + Math.min(requested, max);
                                            }, 0)
                                        } Questions
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleStartAssessment}
                                disabled={selectedSubTopics.size === 0 || loading}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading ? 'Generating...' : 'Start Assessment'}
                                {!loading && <ChevronRight size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default NeetTopicSelection;
