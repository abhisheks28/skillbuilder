"use client";
import React from "react";
import Styles from "./Timer.module.css";


const Timer = ({ timerFinished, getTimeTaken, initialTime }) => {
    const MAX_TIME = 1800 // 30 minutes total for the quiz
    const [time, setTime] = React.useState(initialTime ?? MAX_TIME);
    const timer = React.useRef(null);

    React.useEffect(() => {
        // Start the timer once when component mounts
        timer.current = setInterval(() => {
            setTime((prev) => prev - 1 < 0 ? 0 : prev - 1);
        }, 1000);

        // Cleanup on unmount
        return () => clearInterval(timer.current);
    }, []); // Empty dependency array - runs only once

    // When initialTime updates (e.g., after hydration from localStorage),
    // sync the internal timer state so it resumes from the correct value.
    React.useEffect(() => {
        if (typeof initialTime === "number") {
            setTime(initialTime);
        }
    }, [initialTime]);

    React.useEffect(() => {
        if (time === 0) {
            timerFinished(MAX_TIME - time);
        }
        getTimeTaken(time);
    }, [time]);

    // Format time as MM:SS
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
        <div className={Styles.timerContainer}>
            <p>{formattedTime}</p>
        </div>
    )
}

export default Timer;