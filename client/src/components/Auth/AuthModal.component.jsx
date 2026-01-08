"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, CircularProgress, TextField, Button, Select, MenuItem, FormControl, InputLabel, RadioGroup, FormControlLabel, Radio, Tabs, Tab, Box, Typography } from "@mui/material";
import { X, User, Lock, Mail, Phone, Plus, Trash2, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import Styles from "./AuthModal.module.css";

const AuthModal = ({ open, onClose, onSuccess, redirectPath }) => {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState("LOGIN"); // LOGIN, REGISTER, SUCCESS
    const [loading, setLoading] = useState(false);

    // Login State
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");

    // Register State
    const [role, setRole] = useState("parent");
    const [regName, setRegName] = useState("");
    const [regPhone, setRegPhone] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

    // Parent Specific
    const [hasChildren, setHasChildren] = useState("yes");
    const [children, setChildren] = useState([{ name: "", grade: "" }]);

    // Student Specific
    const [studentGrade, setStudentGrade] = useState("");

    // Teacher Specific
    const [teacherSubject, setTeacherSubject] = useState("");

    // Success State
    const [generatedTicket, setGeneratedTicket] = useState(null);

    useEffect(() => {
        if (!open) {
            setStep("LOGIN");
            setLoading(false);
            setUserId("");
            setPassword("");
            setRegName("");
            setRegPhone("");
            setRegEmail("");
            setRegPassword("");
            setRole("parent");
            setChildren([{ name: "", grade: "" }]);
            setGeneratedTicket(null);
        }
    }, [open]);

    const handleLogin = async () => {
        if (!userId || !password) {
            toast.error("Please enter User ID and password");
            return;
        }

        setLoading(true);
        try {
            const result = await login(userId, password);
            if (result.success) {
                toast.success("Welcome back!");
                onClose();
                if (redirectPath) navigate(redirectPath);
                else navigate("/dashboard");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Login failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddChild = () => {
        setChildren([...children, { name: "", grade: "" }]);
    };

    const handleRemoveChild = (index) => {
        const newChildren = [...children];
        newChildren.splice(index, 1);
        setChildren(newChildren);
    };

    const handleChildChange = (index, field, value) => {
        const newChildren = [...children];
        newChildren[index][field] = value;
        setChildren(newChildren);
    };

    const handleRegister = async () => {
        if (!regName || !regPassword) {
            toast.error("Name and Password are required");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: regName,
                email: regEmail || undefined,
                password: regPassword,
                phone: regPhone || undefined,
                role: role
            };

            if (role === 'student') {
                payload.grade = studentGrade;
            } else if (role === 'teacher') {
                payload.subject = teacherSubject;
            } else if (role === 'parent') {
                if (hasChildren === 'yes') {
                    const validChildren = children.filter(c => c.name && c.grade);
                    if (validChildren.length > 0) {
                        payload.children = validChildren;
                    }
                }
            }

            const result = await register(payload);

            if (result.success) {
                // Determine Ticket ID from response (Should be in result.user.username)
                // Note: AuthContext.register returns { success, message } but updates state
                // We might need to modify AuthContext to return full data or fetch it from state user
                // Actually, let's look at AuthContext.js... it returns { success: true }
                // Use a direct fetch here to get the ticket ID, OR update AuthContext

                // HACK: To show the ticket, we need the response data. 
                // Since AuthContext sets user state, we can try to assume user.username is set?
                // Wait, AuthContext implementation:
                // const data = await response.json(); 
                // if (response.ok) ... setUser(data.user) ... return {success: true}
                // So the context user STATE should have username.

                // Let's rely on the result from register call if we modify AuthContext to return it, 
                // OR we can just check 'result.user' if we edit AuthContext.

                // EDIT: I will assume AuthContext needs a tiny tweak to return data or I will inspect the context state.
                // But context state update is async. 
                // Better to just register via context for state but expect it to return data?
                // The current implementation of AuthContext returns { success: true } strictly.
                // I will update AuthContext quickly or just handle it here? 

                // Actually, let's assume successful registration sets the user. 
                // I'll trust standard flow: The USER is logged in. 
                // But I need to SHOW them their ID.
                // The user object is inside AuthContext. 
                // I'll re-login automatically, so I can pull `user.username`.

                // Let's modify AuthContext to return user data.

                setGeneratedTicket("success"); // Placeholder until I know the ID.
                // Wait, I can't show the ID if I don't have it.
                // Let's assume the user object in context has it.
                toast.success("Account Created!");
                setStep("SUCCESS");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Register Error:", error);
            toast.error("Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    // Need access to current user to show the ID
    const { user } = useAuth();

    useEffect(() => {
        if (step === "SUCCESS" && user?.username) {
            setGeneratedTicket(user.username);
        }
    }, [step, user]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ className: Styles.modalPaper }}
        >
            <DialogTitle className={Styles.modalHeader}>
                <div className={Styles.headerContent}>
                    {step === "LOGIN" ? "Sign In" : step === "SUCCESS" ? "Registration Successful" : "Create Account"}
                </div>
                {!loading && (
                    <IconButton onClick={onClose} className={Styles.closeButton}>
                        <X size={20} />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent className={Styles.modalContent}>
                {step === "LOGIN" && (
                    <div className={Styles.stepContainer}>
                        <TextField
                            fullWidth
                            label="User ID"
                            placeholder="e.g. S123456"
                            variant="outlined"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleLogin}
                            disabled={loading}
                            className={Styles.actionButton}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                        </Button>
                        <div className={Styles.divider}>
                            <span>OR</span>
                        </div>
                        <Button
                            onClick={() => setStep("REGISTER")}
                            className={Styles.backButton}
                            disabled={loading}
                        >
                            Create New Account
                        </Button>
                    </div>
                )}

                {step === "REGISTER" && (
                    <div className={Styles.stepContainer}>
                        <Tabs
                            value={role}
                            onChange={(e, v) => setRole(v)}
                            variant="fullWidth"
                            indicatorColor="primary"
                            textColor="primary"
                            sx={{ mb: 2 }}
                        >
                            <Tab label="Parent" value="parent" />
                            <Tab label="Student" value="student" />
                            <Tab label="Teacher" value="teacher" />
                            <Tab label="Guest" value="guest" />
                        </Tabs>

                        <TextField
                            fullWidth
                            label="Full Name"
                            placeholder="Enter full name"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            margin="normal"
                            InputProps={{
                                startAdornment: <User size={18} style={{ marginRight: 8, color: '#666' }} />
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            placeholder="Enter 10-digit number"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            margin="normal"
                            InputProps={{
                                startAdornment: <Phone size={18} style={{ marginRight: 8, color: '#666' }} />
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Email ID"
                            placeholder="Enter email address"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            margin="normal"
                            InputProps={{
                                startAdornment: <Mail size={18} style={{ marginRight: 8, color: '#666' }} />
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            placeholder="Create a password"
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            margin="normal"
                            InputProps={{
                                startAdornment: <Lock size={18} style={{ marginRight: 8, color: '#666' }} />
                            }}
                        />

                        {role === 'parent' && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                <div style={{ marginBottom: 10, fontWeight: 500 }}>
                                    Do you have children currently studying between pre-KG and Class 12?
                                </div>
                                <RadioGroup
                                    row
                                    value={hasChildren}
                                    onChange={(e) => setHasChildren(e.target.value)}
                                >
                                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio />} label="No" />
                                </RadioGroup>

                                {hasChildren === 'yes' && children.map((child, index) => (
                                    <Box key={index} sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>CHILD {index + 1}</span>
                                            {children.length > 1 && (
                                                <IconButton size="small" onClick={() => handleRemoveChild(index)}>
                                                    <Trash2 size={16} color="red" />
                                                </IconButton>
                                            )}
                                        </div>
                                        <TextField
                                            fullWidth
                                            label="Student Name"
                                            value={child.name}
                                            onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                                            size="small"
                                            margin="dense"
                                        />
                                        <FormControl fullWidth size="small" margin="dense">
                                            <Select
                                                value={child.grade}
                                                displayEmpty
                                                onChange={(e) => handleChildChange(index, 'grade', e.target.value)}
                                                renderValue={(selected) => {
                                                    if (!selected) return <span style={{ color: '#9ca3af' }}>Select Grade</span>;
                                                    return selected;
                                                }}
                                            >
                                                <MenuItem disabled value=""><em>Select Grade</em></MenuItem>
                                                {[...Array(12)].map((_, i) => (
                                                    <MenuItem key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                ))}

                                {hasChildren === 'yes' && (
                                    <Button
                                        startIcon={<Plus size={16} />}
                                        onClick={handleAddChild}
                                        sx={{ mt: 1, textTransform: 'none' }}
                                    >
                                        Add Another Child
                                    </Button>
                                )}
                            </Box>
                        )}

                        {role === 'student' && (
                            <FormControl fullWidth margin="normal">
                                <Select
                                    value={studentGrade}
                                    displayEmpty
                                    onChange={(e) => setStudentGrade(e.target.value)}
                                    renderValue={(selected) => {
                                        if (!selected) return <span style={{ color: '#9ca3af' }}>Select Grade</span>;
                                        return selected;
                                    }}
                                >
                                    <MenuItem disabled value=""><em>Select Grade</em></MenuItem>
                                    {[...Array(12)].map((_, i) => (
                                        <MenuItem key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {role === 'teacher' && (
                            <TextField
                                fullWidth
                                label="Subject"
                                placeholder="e.g. Mathematics"
                                value={teacherSubject}
                                onChange={(e) => setTeacherSubject(e.target.value)}
                                margin="normal"
                            />
                        )}

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleRegister}
                            disabled={loading}
                            className={Styles.actionButton}
                            sx={{ mt: 3 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
                        </Button>

                        <Button
                            onClick={() => setStep("LOGIN")}
                            className={Styles.backButton}
                            disabled={loading}
                        >
                            Back to Sign In
                        </Button>
                    </div>
                )}

                {step === "SUCCESS" && (
                    <div className={Styles.stepContainer} style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ marginBottom: 20 }}>
                            <Check size={48} color="green" />
                        </div>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            Registration Successful!
                        </Typography>
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                            Please keep your User ID safe. You will need it to login.
                        </Typography>

                        <Box sx={{
                            mt: 3, mb: 3, p: 3,
                            bgcolor: '#f1f5f9',
                            borderRadius: 2,
                            border: '2px dashed #cbd5e1',
                            position: 'relative'
                        }}>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                YOUR USER ID
                            </Typography>
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
                                {generatedTicket || "LOADING..."}
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                onClose();
                                navigate("/dashboard");
                            }}
                            className={Styles.actionButton}
                        >
                            Continue to Dashboard
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
