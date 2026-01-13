import {
    generateNaturalWholeNumbers,
    generateIntegers,
    generateFractions,
    generateDecimals,
    generateLCM,
    generateHCF,
    generateRatioProportion,
    generateSquareRoots,
    generateCubeRoots,
    generateExponentsNegative,
    generateBODMAS,
    generateAlgebraicAdditionSubtraction,
    generateAlgebraicMultiplication,
    generateAlgebraicDivision,
    generateLinearEquationOneVar,
    generateSimultaneousEquations,
    generateQuadraticEquation,
    generatePerimeter,
    generatePerimeterAndArea,
    generateArea,
    generateCartesianPoint,
    generateCoordinateGeometry,
    generateSectionFormula,
    generateTrigonometry,
    generateTrigRatios,
    generatePythagoras,
    generateClocks,
    generateProbability,
    generateDiceProbability,
    generateAgeProblem,
    generateNumberSquareProblem,
    generateLCMandHCF
} from './grade10Generators.mjs';

import {
    generateFactorTree
} from '../Grade5/grade5Generators.mjs';
const generate = (generator, count = 10) => {
    // Generator wrapper
    return Array.from({ length: count }, () => generator());
};

// const Grade10Questions = {
//     q1: generate(generateNaturalWholeNumbers),
//     q2: generate(generateIntegers),
//     q3: generate(generateFractions),
//     q4: generate(generateDecimals),
//     q5: generate(generateFactorTree),
//     q6: generate(generateLCMandHCF),
//     q7: generate(generateRatioProportion),
//     q8: generate(generateSquareRoots),
//     q9: generate(generateCubeRoots),
//     q10: generate(generateExponentsNegative),
//     q11: generate(generateBODMAS),
//     q12: generate(generateAlgebraicAdditionSubtraction),
//     q13: generate(generateAlgebraicMultiplication),
//     q14: generate(generateAlgebraicDivision),
//     q15: generate(generateLinearEquationOneVar),
//     q16: generate(generateSimultaneousEquations),
//     q17: generate(generateQuadraticEquation),
//     q18: generate(generatePerimeterAndArea),
//     q19: generate(generateArea),
//     q20: generate(generateCartesianPoint),
//     q21: generate(generateCoordinateGeometry),
//     q22: generate(generateSectionFormula),
//     q23: generate(generateTrigonometry),
//     q24: generate(generateTrigRatios),
//     q25: generate(generatePythagoras),
//     q26: generate(generateClocks),
//     q27: generate(generateProbability),
//     q28: generate(generateDiceProbability),
//     q29: generate(generateAgeProblem),
//     q30: generate(generateNumberSquareProblem)
// };

const Grade10Questions = {

    // =========================
    // Chapter 1: Real Numbers (Revision + Core)
    // =========================
    q1: generate(generateNaturalWholeNumbers),   // Natural & whole numbers
    q2: generate(generateIntegers),              // Integers & number line
    q3: generate(generateFractions),             // Fractions
    q4: generate(generateDecimals),              // Decimals
    q5: generate(generateFactorTree),            // Prime factorisation
    q6: generate(generateLCMandHCF),             // LCM & HCF
    q7: generate(generateRatioProportion),       // Ratio & proportion
    q8: generate(generateBODMAS),                // Order of operations


    // =========================
    // Chapter 2: Exponents & Roots
    // =========================
    q9: generate(generateExponentsNegative),     // Laws of exponents
    q10: generate(generateSquareRoots),
    q11: generate(generateCubeRoots),

    // =========================
    // Chapter 3: Algebraic Expressions
    // =========================
    q12: generate(generateAlgebraicAdditionSubtraction),
    q13: generate(generateAlgebraicMultiplication),
    q14: generate(generateAlgebraicDivision),

    // =========================
    // Chapter 4: Linear Equations
    // =========================
    q15: generate(generateLinearEquationOneVar),
    q16: generate(generateSimultaneousEquations),

    // =========================
    // Chapter 5: Quadratic Equations
    // =========================
    q17: generate(generateQuadraticEquation),

    // =========================
    // Chapter 6: Coordinate Geometry
    // =========================
    q18: generate(generateCartesianPoint),
    q19: generate(generateCoordinateGeometry),
    q20: generate(generateSectionFormula),

    // =========================
    // Chapter 7: Geometry & Mensuration
    // =========================
    q21: generate(generatePerimeterAndArea),
    q22: generate(generateArea),

    // =========================
    // Chapter 8: Trigonometry
    // =========================
    q23: generate(generatePythagoras),            // Foundation
    q24: generate(generateTrigRatios),
    q25: generate(generateTrigonometry),          // Applications

    // =========================
    // Chapter 9: Probability
    // =========================
    q26: generate(generateProbability),
    q27: generate(generateDiceProbability),

    // =========================
    // Optional / Aptitude (Keep Enabled if Needed)
    // =========================

    q28: generate(generateClocks),                // Aptitude
    q29: generate(generateAgeProblem),            // Aptitude
    q30: generate(generateNumberSquareProblem),   // Mental math
};


export const Grade10GeneratorMap = {
    // === EXACT TOPIC NAMES FROM GENERATORS (Learning Plan Categories) ===
    "Fundamental Operations on Natural and Whole Numbers": generateNaturalWholeNumbers,
    "Fundamental Operations On Integers": generateIntegers,
    "Fractions": generateFractions,
    "Fundamental operations on decimals": generateDecimals,
    "Least Common Multiple": generateLCM,
    "Highest Common Factor": generateHCF,
    "LCM and HCF": generateLCMandHCF,
    "Ratio and Proportion": generateRatioProportion,
    "Square and Square Roots": generateSquareRoots,
    "Cube and Cube Roots": generateCubeRoots,
    "Laws of Exponents": generateExponentsNegative,
    "BODMAS": generateBODMAS,
    "Algebraic Addition": generateAlgebraicAdditionSubtraction,
    "Algebraic Multiplication": generateAlgebraicMultiplication,
    "Algebraic Division": generateAlgebraicDivision,
    "Linear Equations in one Variable": generateLinearEquationOneVar,
    "Simultaneous Equations": generateSimultaneousEquations,
    "Quadratic Equations": generateQuadraticEquation,
    "Perimeter of Plane Figures": generatePerimeterAndArea,
    "Area of Plane Figures": generateArea,
    "Locating a point in a Cartesian Plane": generateCartesianPoint,
    "Coordinate Geometry": generateCoordinateGeometry,
    "Section Formula": generateSectionFormula,
    "Trigonometry": generateTrigonometry,
    "Trigonometric Ratios of Standard angles": generateTrigRatios,
    "Word Problems - Pythagorean Theorem": generatePythagoras,
    "Clocks": generateClocks,
    "Miscellaneous": generateProbability,
    "Probability": generateDiceProbability,
    "Linear Equations Word Problems": generateAgeProblem,
    "Quadratic Equations Word Problems": generateNumberSquareProblem,
    "Factor Tree": generateFactorTree,
    "Number Theory / Factor Tree": generateFactorTree,

    // === ALTERNATE/FRIENDLY NAMES ===
    "Number Sense / Natural & Whole": generateNaturalWholeNumbers,
    "Number Sense / Integers": generateIntegers,
    "Number Sense / Fractions": generateFractions,
    "Number Sense / Decimals": generateDecimals,
    "Number Sense / LCM": generateLCM,
    "Number Sense / HCF": generateHCF,
    "Number Sense / Square Roots": generateSquareRoots,
    "Number Sense / Cube Roots": generateCubeRoots,
    "Number Sense / Exponents": generateExponentsNegative,
    "Arithmetic / Ratio & Proportion": generateRatioProportion,
    "Arithmetic / Clocks": generateClocks,
    "Arithmetic / BODMAS": generateBODMAS,
    "Algebra / Addition & Subtraction": generateAlgebraicAdditionSubtraction,
    "Algebra / Multiplication": generateAlgebraicMultiplication,
    "Algebra / Division": generateAlgebraicDivision,
    "Algebra / Linear Equations": generateLinearEquationOneVar,
    "Algebra / Simultaneous Equations": generateSimultaneousEquations,
    "Algebra / Quadratic Equations": generateQuadraticEquation,
    "Algebra / Word Problems (Age)": generateAgeProblem,
    "Algebra / Word Problems (Quadratic)": generateNumberSquareProblem,
    "Mensuration / Perimeter": generatePerimeterAndArea,
    "Mensuration / Area": generateArea,
    "Coordinate Geometry / Quadrants": generateCartesianPoint,
    "Coordinate Geometry / Distance Formula": generateCoordinateGeometry,
    "Coordinate Geometry / Section Formula": generateSectionFormula,
    "Trigonometry / Ratios": generateTrigonometry,
    "Trigonometry / Standard Angles": generateTrigRatios,
    "Geometry / Pythagoras Theorem": generatePythagoras,
    "Probability / True/False": generateProbability,
    "Probability / Dice": generateDiceProbability,
};

export default Grade10Questions;

