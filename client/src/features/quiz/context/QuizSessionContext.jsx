"use client";
import React, { createContext, useState } from "react";

export const QuizSessionContext = createContext();


const QuizProvider = ({ children }) => {
    const [quizSession, setQuizSession] = useState({ userDetails: null, questionPaper: null })

    return (
        <QuizSessionContext.Provider value={[quizSession, setQuizSession]}>
            {children}
        </QuizSessionContext.Provider>
    )
}

export default QuizProvider;