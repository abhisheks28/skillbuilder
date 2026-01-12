"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { uploadNeetQuestionsFile, clearNeetQuestions, getNeetTopics } from '@/services/neetQuestionService';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, Trash2, Database, AlertCircle, FileText, CheckCircle, Edit, X } from 'lucide-react';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology'];
const QUESTION_TYPES = ['MCQ', 'Statement', 'Assertion', 'Previous'];

const NeetUploadClient = () => {
    const navigate = useNavigate();
    const { user, userData } = useAuth();

    // State
    const [selectedSubject, setSelectedSubject] = useState('Physics');
    const [topic, setTopic] = useState('');
    const [subTopic, setSubTopic] = useState('');
    const [selectedType, setSelectedType] = useState('MCQ');
    const [file, setFile] = useState(null);

    const [availableTopics, setAvailableTopics] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [clearing, setClearing] = useState(false);

    const [manageModalOpen, setManageModalOpen] = useState(false);
    const [deletingTopic, setDeletingTopic] = useState(null);

    // Fetch topics when subject changes
    const fetchTopics = async () => {
        const topics = await getNeetTopics(selectedSubject);
        setAvailableTopics(topics); // Now returns [{topic, sub_topics}]
    };

    useEffect(() => {
        fetchTopics();
    }, [selectedSubject]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
    };

    const handleDeleteTopic = async (topicName, subTopicName = null) => {
        if (!confirm(`Are you sure you want to delete ${subTopicName ? `sub-topic "${subTopicName}"` : `topic "${topicName}"`} and ALL its questions?`)) return;

        setDeletingTopic(subTopicName || topicName);
        try {
            await import('@/services/neetQuestionService').then(m => m.deleteNeetTopic(selectedSubject, topicName, subTopicName));
            toast.success("Deleted successfully");
            fetchTopics();
        } catch (e) {
            toast.error("Failed to delete");
        } finally {
            setDeletingTopic(null);
        }
    };

    const handleUpload = async () => {
        if (!topic.trim()) {
            toast.warning("Please enter or select a topic");
            return;
        }
        if (!file) {
            toast.warning("Please select a file to upload");
            return;
        }

        setUploading(true);
        try {
            const result = await uploadNeetQuestionsFile(
                selectedSubject,
                file,
                topic,
                subTopic,
                selectedType,
                user?.uid
            );

            if (result && result.success) {
                toast.success(`Successfully uploaded ${result.count || ''} questions!`);
                setFile(null);
                fetchTopics();
            } else {
                toast.error(result.error || "Failed to upload questions");
            }
        } catch (e) {
            console.error(e);
            toast.error("An unexpected error occurred");
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
            setAvailableTopics([]);
        } else {
            toast.error("Failed to clear questions");
        }
        setClearing(false);
    };

    const handleBack = () => navigate('/teacher-dashboard');

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
                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Database className="text-indigo-600" size={24} />
                            NEET Question Bank
                        </h1>
                        <p className="text-sm text-slate-500">Manage questions per topic & type</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                        {selectedSubject} Mode
                    </span>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col lg:flex-row h-full min-h-[600px]">

                    {/* Left Panel: Subject & Controls */}
                    <div className="w-full lg:w-1/4 border-r border-slate-200 bg-slate-50/50 flex flex-col">
                        <div className="p-4 border-b border-slate-200">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Select Subject</label>
                            <div className="flex flex-col gap-2">
                                {SUBJECTS.map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => setSelectedSubject(subject)}
                                        className={`
                                            w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between
                                            ${selectedSubject === subject
                                                ? 'bg-white shadow-sm text-indigo-700 border border-indigo-100'
                                                : 'text-slate-600 hover:bg-slate-100'
                                            }
                                        `}
                                    >
                                        {subject}
                                        {selectedSubject === subject && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4">
                            <button
                                onClick={() => setManageModalOpen(true)}
                                className="w-full py-2 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm flex items-center justify-center gap-2 transition mb-4 shadow-sm"
                            >
                                <FileText size={16} />
                                Manage Topics
                            </button>
                        </div>

                        <div className="p-4 mt-auto">
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} />
                                    Danger Zone
                                </h3>
                                <button
                                    onClick={handleClear}
                                    disabled={clearing}
                                    className="w-full py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 font-semibold text-xs flex items-center justify-center gap-2 transition"
                                >
                                    <Trash2 size={14} />
                                    {clearing ? 'Clearing...' : `Clear ${selectedSubject} DB`}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Upload Form */}
                    <div className="flex-1 p-8 flex flex-col gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Questions</h2>
                            <p className="text-slate-500">Add new questions to the bank by uploading an Excel or JSON file.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Topic Input */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Topic</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            onFocus={() => document.getElementById('topic-dropdown').classList.remove('hidden')}
                                            onBlur={() => setTimeout(() => document.getElementById('topic-dropdown').classList.add('hidden'), 200)}
                                            placeholder="e.g. Kinematics"
                                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                        <div
                                            id="topic-dropdown"
                                            className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto hidden"
                                        >
                                            {(Array.isArray(availableTopics) ? availableTopics : [])
                                                .filter(t => (t.topic || "").toLowerCase().includes((topic || "").toLowerCase()))
                                                .map(t => (
                                                    <button
                                                        key={t.topic}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault(); // Prevent blur before click
                                                            setTopic(t.topic);
                                                            document.getElementById('topic-dropdown').classList.add('hidden');
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-slate-700 text-sm font-medium transition"
                                                    >
                                                        {t.topic}
                                                    </button>
                                                ))}
                                            {availableTopics.length === 0 && (
                                                <div className="px-4 py-2 text-slate-400 text-sm italic">No topics found</div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500">Select existing or type new.</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Sub Topic <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="text"
                                        value={subTopic}
                                        onChange={(e) => setSubTopic(e.target.value)}
                                        placeholder="e.g. Projectile Motion"
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>


                            {/* Question Type */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700">Question Type</label>
                                <div className="flex gap-2 flex-wrap">
                                    {QUESTION_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`
                                                px-4 py-2 rounded-lg text-sm font-medium border transition-all
                                                ${selectedType === type
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                                }
                                            `}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* File Upload Zone */}
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-indigo-50/30 transition-colors group">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
                                {file ? <FileText size={32} /> : <Upload size={32} />}
                            </div>

                            {file ? (
                                <div className="flex flex-col items-center">
                                    <p className="text-lg font-semibold text-slate-800">{file.name}</p>
                                    <p className="text-sm text-slate-500 mb-4">{(file.size / 1024).toFixed(1)} KB</p>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <label className="cursor-pointer">
                                        <span className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition inline-block mb-2">
                                            Select File
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx, .xls, .json, .txt"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <div className="flex flex-col gap-2 mt-4">
                                        <p className="text-sm text-slate-500">Supports .xlsx, .json (Max 5MB)</p>
                                        <a
                                            href="/api/neet/files/template"
                                            download="neet_template.xlsx"
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-1"
                                        >
                                            <FileText size={14} />
                                            Download Excel Template
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className={`
                                    px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg
                                    ${uploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'}
                                `}
                            >
                                {uploading ? 'Processing...' : 'Upload Questions'}
                                {!uploading && <Upload size={18} />}
                            </button>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                            <strong>Tip:</strong> Uploading repeatedly to the same topic will append questions.
                        </div>

                    </div>
                </div>
            </main>
            {manageModalOpen && (
                <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in fade-in duration-200">
                    {/* Full Screen Header */}
                    <div className="px-8 py-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setManageModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Manage Content</h2>
                                <p className="text-slate-500">{selectedSubject} Question Bank</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Global Actions if needed */}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-hidden flex bg-slate-50">
                        <ManageContent
                            subject={selectedSubject}
                            initialTopics={availableTopics}
                            onRefresh={fetchTopics}
                            onUploadMore={(t, st) => {
                                setTopic(t);
                                setSubTopic(st || '');
                                setManageModalOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
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

// Sub-component for managing content to keep main file clean
const ManageContent = ({ subject, initialTopics, onRefresh, onUploadMore }) => {
    const [view, setView] = useState('topics'); // 'topics' | 'questions'
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubTopic, setSelectedSubTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Rename State
    const [editingItem, setEditingItem] = useState(null); // { type: 'topic'|'sub', oldName: '', subOf: '' }
    const [newName, setNewName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Question Edit State
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editForm, setEditForm] = useState({});

    const filteredTopics = initialTopics.filter(t =>
        t.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.sub_topics || []).some(s => {
            const sName = typeof s === 'object' ? s.name : s;
            return sName.toLowerCase().includes(searchTerm.toLowerCase());
        })
    );

    const fetchQuestions = async (t, st) => {
        setLoading(true);
        try {
            const data = await import('@/services/neetQuestionService').then(m => m.getNeetQuestions(subject, t, st));
            setQuestions(data);
            setSelectedTopic(t);
            setSelectedSubTopic(st);
            setView('questions');
        } catch (e) {
            toast.error("Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!confirm("Delete this question?")) return;
        try {
            await import('@/services/neetQuestionService').then(m => m.deleteNeetQuestion(subject, id));
            toast.success("Question deleted");
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (e) {
            toast.error("Failed to delete");
        }
    };

    const handleDeleteTopic = async (t, st) => {
        if (!confirm(`Delete ${st ? 'sub-topic' : 'topic'} "${st || t}" and ALL its questions?`)) return;
        try {
            await import('@/services/neetQuestionService').then(m => m.deleteNeetTopic(subject, t, st));
            toast.success("Deleted successfully");
            onRefresh();
            // If we deleted the currently viewed topic, go back
            if (selectedTopic === t && (!st || selectedSubTopic === st)) {
                setView('topics');
            }
        } catch (e) {
            toast.error("Failed to delete");
        }
    };

    const handleRename = async () => {
        if (!newName.trim()) return;
        try {
            const { renameNeetTopic } = await import('@/services/neetQuestionService');

            let callSuccess = false;
            // Note: renameNeetTopic signature might vary based on your service implementation. 
            // Assuming the one used previously:
            if (editingItem.type === 'topic') {
                callSuccess = await renameNeetTopic(subject, editingItem.oldName, newName);
            } else {
                // For subtopic: subject, topic, subTopic, newName? 
                // Using the specific signature seen in previous file dumps:
                callSuccess = await renameNeetTopic(subject, editingItem.subOf, editingItem.subOf, editingItem.oldName, newName);
            }

            if (callSuccess) {
                toast.success("Renamed successfully");
                setEditingItem(null);
                setNewName('');
                onRefresh();
            } else {
                toast.error("Failed to rename");
            }
        } catch (e) {
            console.error(e);
            toast.error("Renaming failed");
        }
    };

    const handleSaveQuestion = async () => {
        if (!editingQuestion || !editForm.question) return;
        try {
            const { updateNeetQuestion } = await import('@/services/neetQuestionService');
            // Clean up options if needed
            const payload = { ...editForm };
            if (payload.optionsString) {
                payload.options = payload.optionsString.split('\n').map(o => o.trim()).filter(Boolean);
                delete payload.optionsString;
            }

            const success = await updateNeetQuestion(subject, editingQuestion.id, payload);
            if (success) {
                toast.success("Question updated");
                setEditingQuestion(null);
                // Update local state
                setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...q, ...payload } : q));
            } else {
                toast.error("Failed to update");
            }
        } catch (e) {
            toast.error("Update failed");
        }
    };

    if (view === 'questions') {
        return (
            <div className="w-full h-full flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setView('topics')} className="text-indigo-600 hover:underline font-medium">Topics</button>
                        <span className="text-slate-400">/</span>
                        <span className="font-bold text-slate-800">{selectedTopic}</span>
                        {selectedSubTopic && (
                            <>
                                <span className="text-slate-400">/</span>
                                <span className="text-slate-600">{selectedSubTopic}</span>
                            </>
                        )}
                        <span className="ml-4 px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500 font-mono">
                            {questions.length} questions
                        </span>
                    </div>
                    <button
                        onClick={() => onUploadMore(selectedTopic, selectedSubTopic)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                        <Upload size={16} />
                        Upload Questions
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : questions.length === 0 ? (
                        <p className="text-center text-slate-500 italic mt-8">No questions found.</p>
                    ) : (
                        <div className="grid gap-4 max-w-5xl mx-auto">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                                    <div className="flex-none w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded uppercase">
                                                {q.questionType || 'MCQ'}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setEditingQuestion(q);
                                                    setEditForm({
                                                        question: q.question,
                                                        questionType: q.questionType,
                                                        correctAnswer: q.correctAnswer || q.correct_answer,
                                                        options: q.options || [],
                                                        optionsString: (q.options || []).join('\n')
                                                    });
                                                }}
                                                className="text-slate-400 hover:text-indigo-600 transition p-1"
                                                title="Edit Question"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuestion(q.id)}
                                                className="text-red-400 hover:text-red-600 transition"
                                                title="Delete Question"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="text-slate-800 font-medium mb-2">
                                            {typeof q.question === 'object' ? JSON.stringify(q.question) : q.question}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                                            {Array.isArray(q.options) && q.options.map((opt, i) => (
                                                <div key={i} className={`p-2 rounded border ${(q.correctAnswer === opt || q.correct_answer === opt) ? 'bg-green-50 border-green-200 text-green-700' : 'border-slate-100'
                                                    }`}>
                                                    {opt}
                                                </div>
                                            ))}
                                            {!Array.isArray(q.options) && q.options && (
                                                <div className="col-span-2 text-xs text-slate-400 font-mono">
                                                    Raw options: {JSON.stringify(q.options)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Question Edit Modal */}
                {editingQuestion && (
                    <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                                <h3 className="font-bold text-lg text-slate-800">Edit Question</h3>
                                <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">Question Text</label>
                                    <textarea
                                        value={editForm.question}
                                        onChange={e => setEditForm({ ...editForm, question: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-lg min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1">Type</label>
                                        <select
                                            value={editForm.questionType}
                                            onChange={e => setEditForm({ ...editForm, questionType: e.target.value })}
                                            className="w-full p-2 border border-slate-300 rounded-lg"
                                        >
                                            {['MCQ', 'Statement', 'Assertion', 'NEET_PYQ', 'Match'].map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1">Correct Answer</label>
                                        <input
                                            value={editForm.correctAnswer || ''}
                                            onChange={e => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                                            className="w-full p-2 border border-slate-300 rounded-lg"
                                        />
                                    </div>
                                </div>

                                {(editForm.questionType === 'MCQ' || editForm.questionType === 'NEET_PYQ') && (
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1">Options (One per line)</label>
                                        <textarea
                                            value={editForm.optionsString}
                                            onChange={e => setEditForm({ ...editForm, optionsString: e.target.value })}
                                            className="w-full p-3 border border-slate-300 rounded-lg min-h-[100px] font-mono text-sm"
                                            placeholder="Option A\nOption B..."
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-xl">
                                <button
                                    onClick={() => setEditingQuestion(null)}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveQuestion}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full h-full max-w-5xl mx-auto p-6 overflow-y-auto">
            {/* Rename Modal Overlay */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/20 z-[110] flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Rename {editingItem.type === 'topic' ? 'Topic' : 'Sub-Topic'}</h3>
                        <input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-500">Cancel</button>
                            <button onClick={handleRename} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search topics or sub-topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredTopics.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        {searchTerm ? "No matching topics found." : "No topics found. Upload some questions first!"}
                    </div>
                ) : (
                    filteredTopics.map((item, index) => (
                        <div key={item.topic} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    {item.topic}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setEditingItem({ type: 'topic', oldName: item.topic }); setNewName(item.topic); }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group/btn"
                                        title="Rename Topic"
                                    >
                                        <FileText size={18} className="transition-transform group-hover/btn:scale-110" />
                                    </button>
                                    <button
                                        onClick={() => fetchQuestions(item.topic, null)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95"
                                    >
                                        View All
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTopic(item.topic)}
                                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors group/btn"
                                        title="Delete Topic"
                                    >
                                        <Trash2 size={18} className="transition-transform group-hover/btn:scale-110" />
                                    </button>
                                </div>
                            </div>

                            {item.sub_topics && item.sub_topics.length > 0 && (
                                <div className="mt-4 pl-4 border-l-2 border-indigo-100 flex flex-col gap-2">
                                    {item.sub_topics.map((subItem, subIndex) => {
                                        const subName = typeof subItem === 'object' ? subItem.name : subItem;
                                        return (
                                            <div key={subName} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg group">
                                                <span className="text-sm font-medium text-slate-700 flex items-center gap-3">
                                                    <span className="text-slate-400 font-serif font-bold text-xs w-6 text-right">
                                                        {toRoman(subIndex + 1)}.
                                                    </span>
                                                    {subName}
                                                </span>
                                                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setEditingItem({ type: 'sub', oldName: subName, subOf: item.topic }); setNewName(subName); }}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                                                        title="Rename Sub-topic"
                                                    >
                                                        <FileText size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => fetchQuestions(item.topic, subName)}
                                                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-md hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                                                    >
                                                        View Q's
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTopic(item.topic, subName)}
                                                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                        title="Delete Sub-topic"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default NeetUploadClient;
