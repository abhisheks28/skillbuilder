"use client";
import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Gift, User, BookOpen, Phone, Download, Mail, School, Users, Briefcase, Lock } from "lucide-react";
import { Button } from "@mui/material";
import Confetti from "canvas-confetti";
import { toPng } from 'html-to-image';
// Firebase imports removed
import { useNavigate } from "react-router-dom";
import Header from "@/pages/homepage/Header";
import Footer from "@/components/Footer/Footer.component";
import { useAuth } from "@/context/AuthContext";
import { toast } from 'react-toastify';

const LotteryPage = () => {
    const navigate = useNavigate();
    const { register: registerAuth } = useAuth(); // Rename to avoid conflict with hook-form
    const { register, control, handleSubmit, formState: { errors }, reset, unregister } = useForm({
        defaultValues: {
            students: [{ name: "", grade: "", school: "" }]
        }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "students"
    });

    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketCode, setTicketCode] = useState(null);
    const [registrationType, setRegistrationType] = useState('parent'); // 'parent' | 'student' | 'teacher' | 'guest'
    const [hasChildren, setHasChildren] = useState(true); // Only for parents
    const ticketRef = useRef(null);

    const handleRoleChange = (role) => {
        setRegistrationType(role);
        setHasChildren(true); // Reset to true by default
        reset({
            students: [{ name: "", grade: "", school: "" }],
            name: "",
            email: "",
            phoneNumber: "",
            password: "",
            profession: "",
            schoolName: ""
        });
    };

    // Constants
    const GRADE_OPTIONS = ["Pre-KG", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];
    const SCHOOL_OPTIONS = ["Learners Global School ", "Learners PU College-Sathagalli", "Learners PU College-Vijayanagar", "Others"];

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        try {
            // 1. Prepare Payload for Backend Registration (PostgreSQL)
            // Backend expects: email, password, name, role, phone, [grade, subject, children...]
            const payload = {
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phoneNumber,
                role: registrationType // 'parent', 'student', 'teacher', 'guest' (lowercase)
            };

            // Add role-specific fields
            if (registrationType === 'student') {
                payload.grade = data.studentGrade;
                // Note: 'schoolName' is collected but backend 'students' table might not have it unless added. 
                // We'll store it in Firebase later anyway.
            } else if (registrationType === 'teacher') {
                payload.subject = data.schoolName; // Mapping School to Subject strictly for backend storage if needed
            } else if (registrationType === 'parent') {
                if (hasChildren && data.students && data.students.length > 0) {
                    payload.children = data.students.map(child => ({
                        name: child.name,
                        grade: child.grade
                        // Backend 'children' logic in auth.py only extracts name/grade.
                    }));
                }
            }
            // Guest has no extra fields in backend schema besides basics

            // 2. Call Register API
            console.log("🚀 Registering with payload:", payload);
            const result = await registerAuth(payload);

            if (!result.success) {
                toast.error(result.message || "Registration failed. Please try again.");
                setIsSubmitting(false);
                return;
            }

            // 3. Success! Get the generated Ticket Code
            const newCode = result.user?.username; // stored as username in credentials
            const createdUserUid = result.user?.uid;

            if (!newCode) {
                toast.error("Account created but Ticket ID missing. Please contact support.");
                setIsSubmitting(false);
                return;
            }

            console.log("✅ Registration successful. Ticket:", newCode);

            // 4. Save to Lottery via Backend API
            const firebasePayload = {
                phoneNumber: data.phoneNumber,
                email: data.email,
                userType: registrationType || 'parent',
                name: data.name,
                ticketCode: newCode,
                uid: createdUserUid, // Link to PG UID
                createdAt: new Date().toISOString(),
                timestamp: Date.now(),
            };

            // Add formatting for Lottery Admin View
            if (registrationType === 'parent') {
                firebasePayload.hasChildren = hasChildren;
                if (hasChildren && data.students) {
                    firebasePayload.studentName = data.students.map(s => s.name).join(", ");
                    firebasePayload.studentGrade = data.students.map(s => s.grade).join(", ");
                    firebasePayload.studentSchool = data.students.map(s => s.school).join(", ");
                    firebasePayload.children = data.students; // Store full array too
                } else {
                    firebasePayload.profession = data.profession;
                }
            } else if (registrationType === 'student') {
                firebasePayload.studentGrade = data.studentGrade;
                firebasePayload.schoolName = data.schoolName;
            } else if (registrationType === 'teacher') {
                firebasePayload.schoolName = data.schoolName;
            } else if (registrationType === 'guest') {
                firebasePayload.profession = data.profession;
            }

            try {
                const apiResponse = await fetch('/api/lottery/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(firebasePayload)
                });

                if (!apiResponse.ok) {
                    throw new Error("Failed to save lottery registration");
                }
            } catch (apiError) {
                console.error("⚠️ Error saving to Lottery DB:", apiError);
                // Non-blocking, user still got their account
            }

            // 5. Finalize UI
            setTicketCode(newCode);
            setSubmitted(true);
            Confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });

        } catch (error) {
            console.error("Unexpected error during registration:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        try {
            const dataUrl = await toPng(ticketRef.current, { cacheBust: true });
            const link = document.createElement('a');
            link.download = `LotteryTicket-${ticketCode}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Ticket download failed:", error);
            alert("Failed to download ticket. Please try again.");
        }
    };

    // Helper for input styles
    const inputClass = "w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-900";
    const labelClass = "block text-sm font-medium mb-1 ml-1 text-slate-700";

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(circle at 70% 50%, #ffffff 0%, #e0f2fe 100%)' }}>
            <Header />

            <main className="flex-grow container mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
                <div className="text-center md:text-left flex-1 animate-in fade-in slide-in-from-left duration-700 max-w-2xl">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight
               text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        {registrationType === 'student' ? 'Lucky Student' : registrationType === 'teacher' ? 'Lucky Teacher' : registrationType === 'parent' ? 'Lucky Parent' : 'Lucky Guest'} Lottery
                        <span className="block text-3xl md:text-5xl mt-2 text-slate-800">
                            Annual Day Celebration!
                        </span>
                    </h1>

                    <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                        "Join the celebration! Create your account now to receive your lucky draw ticket.
                        Winners will be announced live during the event."
                    </p>
                </div>

                {!submitted ? (
                    <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-right duration-700">
                        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Create Account & Get Ticket</h2>

                        {/* Role Tabs */}
                        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg mb-6">
                            {['parent', 'student', 'teacher', 'guest'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => handleRoleChange(role)}
                                    className={`flex-1 min-w-[70px] py-2 text-xs md:text-sm font-semibold rounded-md transition-all capitalize ${registrationType === role
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Common: Name */}
                            <div>
                                <label className={labelClass}>Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className={inputClass}
                                        placeholder="Enter full name"
                                    />
                                </div>
                                {errors.name && <span className="text-red-500 text-xs ml-1 mt-1">{errors.name.message}</span>}
                            </div>

                            {/* Common: Phone */}
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        {...register("phoneNumber", {
                                            required: "Phone number is required",
                                            pattern: { value: /^[0-9]{10}$/, message: "Valid 10-digit number required" }
                                        })}
                                        className={inputClass}
                                        placeholder="Enter 10-digit number"
                                        type="tel"
                                        maxLength={10}
                                    />
                                </div>
                                {errors.phoneNumber && <span className="text-red-500 text-xs ml-1 mt-1">{errors.phoneNumber.message}</span>}
                            </div>

                            {/* Common: Email */}
                            <div>
                                <label className={labelClass}>Email ID</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                        })}
                                        className={inputClass}
                                        placeholder="Enter email address"
                                        type="email"
                                    />
                                </div>
                                {errors.email && <span className="text-red-500 text-xs ml-1 mt-1">{errors.email.message}</span>}
                            </div>

                            {/* Common: Password (NEW) */}
                            <div>
                                <label className={labelClass}>Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: { value: 6, message: "Minimum 6 characters" }
                                        })}
                                        className={inputClass}
                                        placeholder="Create a password"
                                        type="password"
                                    />
                                </div>
                                {errors.password && <span className="text-red-500 text-xs ml-1 mt-1">{errors.password.message}</span>}
                            </div>

                            {/* === Role Specific Fields === */}

                            {/* PARENT: Children Question */}
                            {registrationType === 'parent' && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <label className="block text-sm font-medium mb-2 text-slate-700">Do you have children currently studying between pre-KG and Class 12?</label>
                                    <div className="flex gap-6 mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="hasChildren"
                                                checked={hasChildren === true}
                                                onChange={() => setHasChildren(true)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-slate-700">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="hasChildren"
                                                checked={hasChildren === false}
                                                onChange={() => setHasChildren(false)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-slate-700">No</span>
                                        </label>
                                    </div>

                                    {/* Conditional fields for Parent -> Children */}
                                    {hasChildren && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="p-3 bg-white rounded-md border border-slate-200 shadow-sm relative">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-slate-500 uppercase">Child {index + 1}</span>
                                                        {fields.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className="text-red-500 text-xs hover:text-red-700"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className={labelClass}>Student Name</label>
                                                            <input
                                                                {...register(`students.${index}.name`, { required: "Student name is required" })}
                                                                className={inputClass}
                                                                placeholder="Enter student's name"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className={labelClass}>Grade</label>
                                                            <select
                                                                {...register(`students.${index}.grade`, { required: "Grade is required" })}
                                                                className={inputClass}
                                                            >
                                                                <option value="">Select Grade</option>
                                                                {GRADE_OPTIONS.map((g) => (
                                                                    <option key={g} value={g}>{g}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className={labelClass}>School Name</label>
                                                            <select
                                                                {...register(`students.${index}.school`, { required: "School is required" })}
                                                                className={inputClass}
                                                            >
                                                                <option value="">Select School</option>
                                                                {SCHOOL_OPTIONS.map((s) => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                type="button"
                                                variant="outlined"
                                                size="small"
                                                onClick={() => append({ name: "", grade: "", school: "" })}
                                                sx={{ textTransform: 'none', mt: 1 }}
                                            >
                                                + Add Another Child
                                            </Button>
                                        </div>
                                    )}

                                    {!hasChildren && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                            <label className={labelClass}>Profession</label>
                                            <input
                                                {...register("profession", { required: !hasChildren ? "Profession is required" : false })}
                                                className={inputClass}
                                                placeholder="Enter your profession"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STUDENT Role Fields */}
                            {registrationType === 'student' && (
                                <>
                                    <div>
                                        <label className={labelClass}>Grade</label>
                                        <select
                                            {...register("studentGrade", { required: "Grade is required" })}
                                            className={inputClass}
                                        >
                                            <option value="">Select Grade</option>
                                            {GRADE_OPTIONS.map((g) => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>School Name</label>
                                        <select
                                            {...register("schoolName", { required: "School name is required" })}
                                            className={inputClass}
                                        >
                                            <option value="">Select School</option>
                                            {SCHOOL_OPTIONS.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* TEACHER Role Fields */}
                            {registrationType === 'teacher' && (
                                <div>
                                    <label className={labelClass}>School Name</label>
                                    <select
                                        {...register("schoolName", { required: "School Name is required" })}
                                        className={inputClass}
                                    >
                                        <option value="">Select School</option>
                                        {SCHOOL_OPTIONS.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* GUEST Role Fields */}
                            {registrationType === 'guest' && (
                                <div>
                                    <label className={labelClass}>Profession</label>
                                    <input
                                        {...register("profession", { required: "Profession is required" })}
                                        className={inputClass}
                                        placeholder="Enter your profession"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                variant="contained"
                                fullWidth
                                sx={{
                                    mt: 2,
                                    background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                                    color: 'white',
                                    padding: '12px',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    '&:hover': {
                                        background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%)',
                                        boxShadow: isSubmitting ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                                    }
                                }}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Create Account & Get Ticket'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full max-w-md animate-in zoom-in duration-300">
                        {/* Ticket Card Area - This is what gets downloaded */}
                        <div
                            ref={ticketRef}
                            className="w-full p-8 rounded-2xl border-4 border-yellow-400/30 text-center shadow-2xl relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white"
                        >
                            {/* Decorative circles */}
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950"></div>
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950"></div>

                            <div className="p-4 rounded-full inline-block mb-4 bg-white/10 text-yellow-400">
                                <Gift className="w-12 h-12" />
                            </div>

                            <h2 className="text-2xl font-bold mb-2 text-white">Registration Successful!</h2>

                            <div className="my-6 p-4 rounded-xl border-2 border-dashed border-yellow-400/50 bg-white/5">
                                <p className="text-sm mb-2 uppercase tracking-wider font-semibold text-yellow-200">Your Lucky Number</p>
                                <p className="text-4xl font-mono font-bold tracking-widest drop-shadow-md text-yellow-400">
                                    {ticketCode}
                                </p>
                            </div>

                            {/* Credentials Display */}
                            <div className="bg-white/10 rounded-xl p-3 mb-4 text-left border border-white/20">
                                <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-2 text-center border-b border-white/10 pb-1">Login Credentials</p>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-slate-300">User ID:</span>
                                    <span className="font-mono font-bold text-white text-lg">{ticketCode}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300">Password:</span>
                                    <span className="font-mono font-bold text-white text-lg">********</span>
                                </div>
                            </div>

                            <p className="text-sm text-blue-100">
                                Please keep your User ID secure. You can use it to login.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col gap-4 w-full px-4">
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={handleDownload}
                                sx={{
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    color: 'white',
                                    padding: '12px',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                        boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)'
                                    }
                                }}
                            >
                                Download Ticket
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSubmitted(false);
                                    setTicketCode(null);
                                    reset();
                                }}
                                sx={{
                                    color: '#2563eb',
                                    borderColor: '#2563eb',
                                    padding: '10px',
                                    '&:hover': { borderColor: '#1d4ed8', background: '#eff6ff' }
                                }}
                            >
                                Register Another
                            </Button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default LotteryPage;
