"use client";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom, FlaskConical, Dna } from 'lucide-react';
import Styles from './NeetClient.module.css';
import { toast } from 'react-toastify';
import { useAuth } from '@/features/auth/context/AuthContext';
import AuthModal from '@/features/auth/components/AuthModal.component';

const NeetClient = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [authModalOpen, setAuthModalOpen] = React.useState(false);

    const handleStartExam = (subject) => {
        if (!user) {
            setAuthModalOpen(true);
            return;
        }
        navigate(`/neet/topics/${subject}`);
    };

    const handleGuideClick = (subject) => {
        if (subject === 'Chemistry') {
            window.open('/assets/Neet/chemistry/chemistry_guide.pdf', '_blank');
            return;
        }
        // Placeholder for other subjects
        toast.info(`Opening ${subject} Guide...`);
    };

    return (
        <div className={Styles.container}>
            <h1 className={Styles.title}>Select NEET Subject</h1>

            <div className={Styles.grid}>
                {/* Physics Card */}
                <div className={`${Styles.card} ${Styles.physicsCard}`}>
                    <div className={`${Styles.iconWrapper} ${Styles.physicsHeader}`}>
                        <Atom size={50} />
                    </div>
                    <h2 className={Styles.subjectName}>Physics</h2>
                    <p className={Styles.description}>
                        Master mechanics, thermodynamics, and electromagnetism.
                        Key for engineering and medical entrance.
                    </p>
                    <div className={Styles.buttonContainer}>
                        <button className={Styles.startButton} onClick={() => handleStartExam('Physics')}>
                            Start Physics
                        </button>
                        <button className={Styles.guideButton} onClick={() => handleGuideClick('Physics')}>
                            Guide
                        </button>
                    </div>
                </div>

                {/* Chemistry Card */}
                <div className={`${Styles.card} ${Styles.chemistryCard}`}>
                    <div className={`${Styles.iconWrapper} ${Styles.chemistryHeader}`}>
                        <FlaskConical size={50} />
                    </div>
                    <h2 className={Styles.subjectName}>Chemistry</h2>
                    <p className={Styles.description}>
                        Explore organic, inorganic, and physical chemistry.
                        Understanding matter and reactions.
                    </p>
                    <div className={Styles.buttonContainer}>
                        <button className={Styles.startButton} onClick={() => handleStartExam('Chemistry')}>
                            Start Chemistry
                        </button>
                        <button className={Styles.guideButton} onClick={() => handleGuideClick('Chemistry')}>
                            Guide
                        </button>
                    </div>
                </div>

                {/* Biology Card */}
                <div className={`${Styles.card} ${Styles.biologyCard}`}>
                    <div className={`${Styles.iconWrapper} ${Styles.biologyHeader}`}>
                        <Dna size={50} />
                    </div>
                    <h2 className={Styles.subjectName}>Biology</h2>
                    <p className={Styles.description}>
                        Study life, botany, and zoology.
                        Crucial for medical aspirants.
                    </p>
                    <div className={Styles.buttonContainer}>
                        <button className={Styles.startButton} onClick={() => handleStartExam('Biology')}>
                            Start Biology
                        </button>
                        <button className={Styles.guideButton} onClick={() => handleGuideClick('Biology')}>
                            Guide
                        </button>
                    </div>
                </div>
            </div>

            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onSuccess={() => {
                    setAuthModalOpen(false);
                }}
            />
        </div>
    );
};

export default NeetClient;
