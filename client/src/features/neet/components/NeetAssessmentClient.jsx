"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getNeetTopics, generateNeetAssessment } from '@/services/neetQuestionService';
import { toast } from 'react-toastify';
import { ArrowLeft, BookOpen, Clock, FileText, Printer, CheckSquare, RefreshCw } from 'lucide-react';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology'];
const QUESTION_TYPES = ['MCQ', 'Statement', 'Assertion', 'Previous'];

const NeetAssessmentClient = () => {
    const navigate = useNavigate();
    const { userData } = useAuth();

    // Core selection state
    const [selectedSubject, setSelectedSubject] = useState('Physics');
    const [availableTopics, setAvailableTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);

    // Config state
    const [questionCount, setQuestionCount] = useState(10);
    const [duration, setDuration] = useState(30); // minutes
    const [selectedTypes, setSelectedTypes] = useState(['MCQ']); // Default to MCQ
    const [password, setPassword] = useState(''); // Optional password

    // Result state
    const [generatedPaper, setGeneratedPaper] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTopics = async () => {
            const topics = await getNeetTopics(selectedSubject);
            setAvailableTopics(topics);
            setSelectedTopics([]); // Reset on subject change
        };
        fetchTopics();
    }, [selectedSubject]);

    const toggleTopic = (topic) => {
        if (selectedTopics.includes(topic)) {
            setSelectedTopics(selectedTopics.filter(t => t !== topic));
        } else {
            setSelectedTopics([...selectedTopics, topic]);
        }
    };

    const toggleType = (type) => {
        if (selectedTypes.includes(type)) {
            setSelectedTypes(selectedTypes.filter(t => t !== type));
        } else {
            setSelectedTypes([...selectedTypes, type]);
        }
    };

    const handleGenerate = async () => {
        if (selectedTopics.length === 0) {
            toast.warning("Please select at least one topic");
            return;
        }
        if (selectedTypes.length === 0) {
            toast.warning("Please select at least one question type");
            return;
        }

        setLoading(true);
        try {
            // Calculate distribution
            const count = parseInt(questionCount) || 10;
            const countPerType = Math.floor(count / selectedTypes.length);
            const remainder = count % selectedTypes.length;

            const dist = selectedTypes.map((type, idx) => ({
                type,
                count: countPerType + (idx < remainder ? 1 : 0)
            }));

            const result = await generateNeetAssessment(
                selectedSubject,
                selectedTopics, // topics
                [], // sub_topics
                0, // total_questions (ignored due to distribution)
                dist // distribution
            );

            if (result && result.length > 0) {
                // Backend returns array of questions, wrap it in our 'paper' object
                const paperObj = {
                    total: result.length,
                    questions: result,
                    topics: selectedTopics,
                    password: password // Pass user-set password to result view
                };
                setGeneratedPaper(paperObj);
                toast.success(`Generated ${result.length} questions`);
            } else if (Array.isArray(result) && result.length === 0) {
                toast.warning("No questions found for criteria");
            } else {
                // If service returns null (error already logged there)
                toast.error("Failed to generate assessment");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error generating assessment");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => navigate('/teacher-dashboard');

    // Simple Print View (CSS handles hiding non-printables)
    if (generatedPaper) {
        return (
            <div className="min-h-screen bg-white text-black p-8 max-w-5xl mx-auto">
                {/* Non-printable controls */}
                <div className="print:hidden flex items-center justify-between mb-8 border-b pb-4">
                    <button onClick={() => setGeneratedPaper(null)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                        <ArrowLeft size={18} /> Back to Generator
                    </button>
                    <button onClick={handlePrint} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700">
                        <Printer size={18} /> Print Paper
                    </button>
                </div>

                {/* Printable Header */}
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">NEET Practice Assessment</h1>
                    <div className="flex justify-center gap-8 text-lg font-medium px-4 mb-2">
                        <span>Subject: {selectedSubject}</span>
                        <span>Duration: {duration} Mins</span>
                        <span>Marks: {generatedPaper.total * 4}</span>
                    </div>
                    {generatedPaper.password && (
                        <div className="text-xl font-bold text-slate-800 border-t border-dashed border-slate-300 pt-2 mt-2 w-max mx-auto px-8">
                            Access Password: <span className="font-mono tracking-widest">{generatedPaper.password}</span>
                        </div>
                    )}
                    <div className="mt-2 text-sm text-slate-600">
                        Topics: {generatedPaper.topics.join(', ')}
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-8">
                    {generatedPaper.questions.map((q, idx) => (
                        <div key={q.id} className="break-inside-avoid">
                            <div className="flex gap-2">
                                <span className="font-bold min-w-[24px]">{idx + 1}.</span>
                                <div className="flex-1">
                                    <p className="font-medium text-lg mb-3">{q.question}</p>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 pl-4">
                                        {q.options.map((opt, optIdx) => (
                                            <div key={optIdx} className="flex gap-2">
                                                <span className="font-semibold text-slate-700">{String.fromCharCode(65 + optIdx)})</span>
                                                <span>{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-4 border-t border-slate-300 text-center text-sm text-slate-500">
                    Generated via NEET Question Bank | Total Questions: {generatedPaper.total}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="text-indigo-600" size={24} />
                            Assessment Generator
                        </h1>
                        <p className="text-sm text-slate-500">Create custom practice papers</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                        {selectedSubject}
                    </span>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full p-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col lg:flex-row gap-8">

                    {/* Controls */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-6">

                        {/* Subject */}
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                            {SUBJECTS.map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => setSelectedSubject(subject)}
                                    className={`
                                        flex-1 py-2 font-semibold text-sm rounded-lg transition-all
                                        ${selectedSubject === subject ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>

                        {/* Config */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Questions</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                                    />
                                    <BookOpen size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Duration (Mins)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                                    />
                                    <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Set Access Password (Optional)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={password}
                                    placeholder="e.g. NEET2024"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Types */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Question Types</label>
                            <div className="flex flex-wrap gap-2">
                                {QUESTION_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => toggleType(type)}
                                        className={`
                                            px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                                            ${selectedTypes.includes(type)
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className={`
                                mt-4 w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1'}
                            `}
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : <Printer />}
                            {loading ? 'Generating...' : 'Generate Paper'}
                        </button>
                    </div>

                    {/* Topic Selection */}
                    <div className="flex-1 border-l border-slate-100 pl-8">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select Topics ({selectedTopics.length})</label>
                            <button
                                onClick={() => setSelectedTopics(selectedTopics.length === availableTopics.length ? [] : availableTopics.map(t => t.topic || t))}
                                className="text-xs font-semibold text-indigo-600 hover:underline"
                            >
                                {selectedTopics.length === availableTopics.length ? "Deselect All" : "Select All"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                            {availableTopics.length > 0 ? availableTopics.map((item, idx) => {
                                const topicName = item.topic || item; // Fallback if it is a string
                                const isSelected = selectedTopics.includes(topicName);
                                return (
                                    <button
                                        key={topicName + idx}
                                        onClick={() => toggleTopic(topicName)}
                                        className={`
                                        p-3 rounded-xl border text-left transition-all flex items-start gap-3
                                        ${isSelected
                                                ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                                : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                                            }
                                    `}
                                    >
                                        <div className={`
                                        w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5
                                        ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}
                                    `}>
                                            {isSelected && <CheckSquare size={12} />}
                                        </div>
                                        <div className="flex-1">
                                            <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                                                {topicName}
                                            </span>
                                            {item.count !== undefined && (
                                                <span className="block text-xs text-slate-400 mt-0.5">{item.count} Questions</span>
                                            )}
                                        </div>
                                    </button>
                                )
                            }) : (
                                <div className="col-span-2 text-center py-10 text-slate-400 italic">
                                    No topics found for {selectedSubject}. Upload some questions first.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default NeetAssessmentClient;
