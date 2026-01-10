export const GRADE_LOADERS = {
    1: () => import('@/questionBook/Grade1/GetGrade1Question'),
    2: () => import('@/questionBook/Grade2/GetGrade2Question.mjs'),
    3: () => import('@/questionBook/Grade3/GetGrade3Question.mjs'),
    4: () => import('@/questionBook/Grade4/GetGrade4Question.mjs'),
    5: () => import('@/questionBook/Grade5/GetGrade5Question.mjs'),
    6: () => import('@/questionBook/Grade6/GetGrade6Question.mjs'),
    7: () => import('@/questionBook/Grade7/GetGrade7Question.mjs'),
    8: () => import('@/questionBook/Grade8/GetGrade8Question.mjs'),
    9: () => import('@/questionBook/Grade9/GetGrade9Question.mjs'),
    10: () => import('@/questionBook/Grade10/GetGrade10Question.mjs'),
    'SAT': () => import('@/questionBook/SAT/GetSATQuestion.mjs'),
};
