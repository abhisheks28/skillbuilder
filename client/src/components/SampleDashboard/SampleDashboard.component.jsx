import Styles from "./SampleDashboard.module.css";
import { Button } from "@mui/material";

const SampleDashboard = () => {
    return (
        <div className={Styles.dashboardContainer}>
            <div className={Styles.card}>
                <div className={Styles.header}>
                    <h2 className={Styles.title}>Sample Report Preview</h2>
                    <p className={Styles.subtitle}>What you’ll receive after assessment</p>
                </div>

                <div className={Styles.scoreBanner}>
                    <span className={Styles.scoreLabel}>Overall Score</span>
                    <span className={Styles.scoreBadge}>Needs Improvement</span>
                    <span className={Styles.scoreValue}>20%</span>
                </div>

                <div className={Styles.statsGrid}>
                    <div className={Styles.statTile}>
                        <span className={Styles.statLabel}>Correct Answers</span>
                        <span className={Styles.statValue}>1</span>
                    </div>
                    <div className={Styles.statTile}>
                        <span className={Styles.statLabel}>Total Questions</span>
                        <span className={Styles.statValue}>5</span>
                    </div>
                </div>

                <div className={Styles.breakdownSection}>
                    <h3 className={Styles.sectionTitle}>Question Breakdown by Category</h3>
                    <div className={Styles.breakdownList}>
                        {[
                            { label: "Number Sense", value: "20%" },
                            { label: "Algebra", value: "20%" },
                            { label: "Geometry", value: "20%" },
                            { label: "Fractions", value: "20%" },
                            { label: "Word Problems", value: "20%" },
                        ].map((item, index) => (
                            <div key={index} className={Styles.breakdownItem}>
                                <div className={Styles.breakdownHeader}>
                                    <span className={Styles.breakdownLabel}>{item.label}</span>
                                    <span className={Styles.breakdownValue}>{item.value}</span>
                                </div>
                                <div className={Styles.progressBar}>
                                    <div className={Styles.progressFill} style={{ width: item.value }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Button className={Styles.ctaButton}>Get Your Report</Button>
            </div>
        </div>
    )
}

export default SampleDashboard;