"use client";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { saveNeetQuestions, clearNeetQuestions } from '@/services/neetQuestionService';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, Trash2, Database, AlertCircle, CheckCircle } from 'lucide-react';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology'];

const NeetUploadClient = () => {
    const navigate = useNavigate();
    const { user, userData } = useAuth();
    const [selectedSubject, setSelectedSubject] = useState('Physics');
    const [jsonInput, setJsonInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [clearing, setClearing] = useState(false);

    const handleUpload = async () => {
        if (!jsonInput.trim()) {
            toast.warning("Please enter JSON content first");
            return;
        }

        try {
            const questions = JSON.parse(jsonInput);
            if (!Array.isArray(questions)) {
                toast.error("JSON must be an array of question objects");
                return;
            }

            setUploading(true);
            const success = await saveNeetQuestions(selectedSubject, questions, user?.uid);

            if (success) {
                toast.success(`Successfully uploaded ${questions.length} questions for ${selectedSubject}`);
                setJsonInput('');
            } else {
                toast.error("Failed to upload questions");
            }
        } catch (e) {
            toast.error("Invalid JSON format. Please check your syntax.");
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    const handleClear = async () => {
        if (!confirm(`Are you sure you want to DELETE ALL questions for ${selectedSubject}? This cannot be undone.`)) {
            return;
        }

        setClearing(true);
        const success = await clearNeetQuestions(selectedSubject);
        if (success) {
            toast.success(`All ${selectedSubject} questions deleted.`);
        } else {
            toast.error("Failed to clear questions");
        }
        setClearing(false);
    };

    const handleBack = () => {
        navigate('/teacher-dashboard');
    };

    // Redirect if not authorized (double check)
    if (!userData?.neetUploadEnabled) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
                <p className="text-slate-600 mb-6">You do not have permission to access the NEET Upload portal.</p>
                <button
                    onClick={handleBack}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Database className="text-indigo-600" size={24} />
                            NEET Question Bank Manager
                        </h1>
                        <p className="text-sm text-slate-500">Upload and manage questions for NEET aspirants</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                        {selectedSubject} Mode
                    </span>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">

                    {/* Subject Tabs */}
                    <div className="flex border-b border-slate-200">
                        {SUBJECTS.map(subject => (
                            <button
                                key={subject}
                                onClick={() => setSelectedSubject(subject)}
                                className={`
                                    flex-1 py-4 text-center font-semibold transition-all border-b-2
                                    ${selectedSubject === subject
                                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">

                        {/* Editor Section */}
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">
                                    Paste JSON Questions Array
                                </label>
                                <a
                                    href="#"
                                    className="text-xs text-indigo-600 hover:underline"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setJsonInput(JSON.stringify([
                                            {
                                                "id": 1,
                                                "question": "Sample Question?",
                                                "options": ["Option A", "Option B", "Option C", "Option D"],
                                                "correctAnswer": "A",
                                                "explanation": "Explanation here..."
                                            }
                                        ], null, 2));
                                    }}
                                >
                                    Load Sample Template
                                </a>
                            </div>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="flex-1 w-full p-4 font-mono text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-slate-800"
                                placeholder={`[\n  {\n    "question": "...",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswer": "A"\n  }\n]`}
                            />
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className={`
                                        flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
                                        ${uploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 show-lg'}
                                    `}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Questions'}
                                    {!uploading && <Upload size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone / Info */}
                        <div className="w-full lg:w-80 flex flex-col gap-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-600" />
                                    Format Guidelines
                                </h3>
                                <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                                    <li>Must be a valid JSON array</li>
                                    <li>Each object should have <code>question</code> text</li>
                                    <li><code>options</code> must be an array of 4 strings</li>
                                    <li><code>correctAnswer</code> should be A, B, C, or D</li>
                                    <li>Optional: <code>explanation</code> field</li>
                                </ul>
                            </div>

                            <div className="bg-red-50 p-4 rounded-xl border border-red-200 mt-auto">
                                <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Danger Zone
                                </h3>
                                <p className="text-xs text-red-600 mb-4">
                                    Permanently delete all existing questions for {selectedSubject}. This action cannot be undone.
                                </p>
                                <button
                                    onClick={handleClear}
                                    disabled={clearing}
                                    className="w-full py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 font-semibold text-sm flex items-center justify-center gap-2 transition"
                                >
                                    <Trash2 size={16} />
                                    {clearing ? 'Clearing...' : `Clear ${selectedSubject} DB`}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default NeetUploadClient;
