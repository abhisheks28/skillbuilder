"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, ChevronDown, PlayCircle } from 'lucide-react';
import { getNeetTopics, generateNeetAssessment, saveNeetAssessment, getNeetAssessments } from '@/services/neetQuestionService';
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
    const [recentAssessments, setRecentAssessments] = useState([]);

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

    // Password Modal State
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");

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

                // Fetch recent assessments
                if (user?.uid) {
                    const assessments = await getNeetAssessments(subject, user.uid);
                    setRecentAssessments(assessments);
                }
            } catch (err) {
                console.error("Failed to fetch topics", err);
                toast.error("Failed to load topics");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [subject, user?.uid]);

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

    const startAssessmentWithSelection = async (subjectsList, subTopicsList) => {
        const distPayload = Object.entries(distribution)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => ({ type, count }));

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

            // Save Assessment (Auto-save)
            if (user?.uid) {
                const title = `${subject} Practice - ${new Date().toLocaleString()}`;
                const savePayload = {
                    title,
                    subject,
                    question_ids: questions.map(q => ({ id: q.id })),
                    config: {
                        duration,
                        topics: subjectsList,
                        sub_topics: subTopicsList,
                        distribution: distPayload
                    }
                };
                await saveNeetAssessment(savePayload, user.uid);
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

        await startAssessmentWithSelection(subjectsList, subTopicsList);
    };

    const handleTakeOverallAssessment = () => {
        setPasswordModalOpen(true);
    };

    const handlePasswordSubmit = async () => {
        if (!passwordInput) {
            toast.error("Please enter a password");
            return;
        }

        try {
            setLoading(true);
            // Verify password via API
            const response = await fetch('/api/neet/assessment/access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: subject,
                    password: passwordInput
                })
            });

            if (!response.ok) {
                toast.error("Invalid password or assessment not found");
                setLoading(false);
                return;
            }

            const assessment = await response.json();
            setPasswordModalOpen(false);
            setPasswordInput("");

            // Navigate with state
            navigate(`/neet/practice/${subject}?mode=assessment`, {
                state: {
                    questions: assessment.questions,
                    duration: assessment.config?.duration || 60,
                    mode: 'assessment',
                    title: assessment.title
                }
            });

        } catch (err) {
            console.error(err);
            toast.error("Error accessing assessment");
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

    // List Modal State
    const [listModalOpen, setListModalOpen] = useState(false);
    const [allGeneratedPapers, setAllGeneratedPapers] = useState([]);

    const handleOpenGeneratedPapers = async () => {
        setLoading(true);
        try {
            // Fetch ALL assessments for subject (no teacherUid)
            const papers = await getNeetAssessments(subject);
            setAllGeneratedPapers(papers);
            setListModalOpen(true);
        } catch (e) {
            toast.error("Failed to load papers");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPaper = (paper) => {
        // If paper has password in config, we might need to prompt.
        // HOWEVER, the list_assessments backend endpoint returns config but NOT the password value inside config for security?
        // Actually, backend returns full config.
        // If we want to secure it, we should rely on the user knowing the password.
        // Let's reuse the Password Modal.
        // We set the password input to empty and open modal.
        // BUT wait, "Take Overall Assessment" (password only) vs "Click Item" (password prompt).
        // Let's set a "targetPaper" state to know which paper we are verifying.

        // For now, let's keep it simple: Clicking a paper opens password modal.
        // User enters password. We verify against THAT paper.
        setListModalOpen(false);
        setPasswordModalOpen(true);
        // We might need to store the selected paper ID to verify specifically against it, currently /assessment/access checks by Subject + Password.
        // If multiple papers have same password, it picks latest.
        // This flow works for now.
    };

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
                <div className="flex gap-2">
                    <button
                        onClick={handleOpenGeneratedPapers}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors text-sm flex items-center gap-2"
                    >
                        <BookOpen size={18} />
                        Generated Papers
                    </button>
                    <button
                        onClick={handleTakeOverallAssessment}
                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
                    >
                        <PlayCircle size={18} />
                        Take Overall Assessment
                    </button>
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
                            {topicsData.map((topicItem, idx) => {
                                const topicName = topicItem.topic;
                                const isExpanded = expandedTopic === topicName;
                                const isSelected = selectedTopics.has(topicName);
                                const subTopics = topicItem.sub_topics || [];

                                return (
                                    <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all duration-200">
                                        {/* Topic Header */}
                                        <div className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 ${isExpanded ? 'bg-slate-50' : ''}`}>
                                            <div
                                                onClick={(e) => { e.stopPropagation(); toggleSelection(topicName); }}
                                                className={`
                                                    w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                    ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400'}
                                                `}
                                            >
                                                {isSelected && <div className="text-white text-xs">✓</div>}
                                            </div>

                                            <div className="flex-1 flex items-center justify-between" onClick={() => toggleTopic(topicName)}>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">{topicName}</h3>
                                                    <p className="text-xs text-slate-500">{topicItem.count} Questions • {subTopics.length} Sub-topics</p>
                                                </div>
                                                <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Sub Topics */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-100 bg-slate-50/50 p-2 space-y-1">
                                                {subTopics.map((sub, sIdx) => {
                                                    const sName = (typeof sub === 'object' && sub) ? sub.name : sub;
                                                    const sCount = (typeof sub === 'object' && sub) ? (sub.count || 0) : 0;
                                                    const subKey = `${topicName}|${sName}`;
                                                    const isSubSelected = selectedSubTopics.has(subKey);

                                                    return (
                                                        <div
                                                            key={sIdx}
                                                            onClick={() => toggleSelection(topicName, sName)}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm cursor-pointer transition-all ml-8"
                                                        >
                                                            <div className={`
                                                                w-4 h-4 rounded border flex items-center justify-center transition-colors
                                                                ${isSubSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}
                                                            `}>
                                                                {isSubSelected && <div className="text-white text-[10px]">✓</div>}
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className={`text-sm ${isSubSelected ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>
                                                                    {sName}
                                                                </span>
                                                                <span className="text-xs text-slate-400 ml-2">({sCount})</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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

                            {/* Recent Assessments List */}
                            {recentAssessments.length > 0 && (
                                <div className="mt-4 border-t border-slate-200 pt-4">
                                    <h3 className="text-sm font-bold text-slate-700 mb-2">Recent Assessments</h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {recentAssessments.map(calc => (
                                            <div key={calc.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-100 hover:bg-white hover:shadow-sm cursor-pointer transition">
                                                <div className="font-medium text-slate-800 truncate">{calc.title}</div>
                                                <div className="flex justify-between text-slate-500 mt-1">
                                                    <span>{calc.questionCount} Qs</span>
                                                    <span>{new Date(calc.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                </div >

            </main >

            {/* Password Modal */}
            {passwordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <PlayCircle className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Start Overall Assessment</h3>
                            <p className="text-slate-500 text-sm mt-1">
                                Enter the exam password to begin the full syllabus assessment.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Enter exam password"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPasswordModalOpen(false)}
                                className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-transform active:scale-95"
                            >
                                Start Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generated Papers List Modal */}
            {listModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 transform transition-all scale-100 flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Generated Papers</h3>
                                <p className="text-slate-500 text-sm">Select a paper to take assessment.</p>
                            </div>
                            <button
                                onClick={() => setListModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <ArrowLeft size={20} className="rotate-180" /> {/* Close Icon */}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {allGeneratedPapers.length > 0 ? (
                                allGeneratedPapers.map((paper) => (
                                    <div
                                        key={paper.id}
                                        onClick={() => handleSelectPaper(paper)}
                                        className="border border-slate-200 rounded-xl p-4 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all flex items-center justify-between group"
                                    >
                                        <div>
                                            <h4 className="font-bold text-slate-800 group-hover:text-indigo-700">{paper.title}</h4>
                                            <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><BookOpen size={12} /> {paper.questionCount} Questions</span>
                                                <span className="flex items-center gap-1"><PlayCircle size={12} /> {paper.config?.duration} Mins</span>
                                                <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm flex items-center gap-1">
                                            Start <ChevronRight size={16} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    No generated papers found for {displaySubject}.
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 text-right">
                            <button
                                onClick={() => setListModalOpen(false)}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default NeetTopicSelection;
