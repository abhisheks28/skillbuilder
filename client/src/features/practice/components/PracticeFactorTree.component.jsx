"use client";
import React, { useState, useEffect, useMemo } from "react";
import Styles from "./PracticeFactorTree.module.css";
import { Button } from "@mui/material";
import { ArrowRight, RefreshCcw, Check } from "lucide-react";
import MathRenderer from "@/components/MathRenderer/MathRenderer.component";

// --- Layout Logic (copied from TypeFactorTree) ---
const NODE_WIDTH = 60;
const NODE_HEIGHT = 60;
const X_SPACING = 30;
const Y_SPACING = 100;

const calculateTreeLayout = (root) => {
    if (!root) return { nodes: [], edges: [], width: 0, height: 0 };

    const nodes = [];
    const edges = [];

    const assignLeafSlots = (node, counter = { val: 0 }) => {
        if (!node.children || node.children.length === 0) {
            node._leafIndex = counter.val++;
        } else {
            node.children.forEach(c => assignLeafSlots(c, counter));
        }
    };
    assignLeafSlots(root, { val: 0 });

    const assignCoords = (node, depth = 0) => {
        const y = depth * Y_SPACING;
        let x = 0;

        if (!node.children || node.children.length === 0) {
            x = node._leafIndex * (NODE_WIDTH + X_SPACING);
        } else {
            node.children.forEach(c => assignCoords(c, depth + 1));
            const firstChildX = node.children[0]._x;
            const lastChildX = node.children[node.children.length - 1]._x;
            x = (firstChildX + lastChildX) / 2;
        }

        node._x = x;
        node._y = y;
        nodes.push(node);

        if (node.children) {
            node.children.forEach(c => {
                edges.push({
                    x1: x + NODE_WIDTH / 2,
                    y1: y + NODE_HEIGHT,
                    x2: c._x + NODE_WIDTH / 2,
                    y2: c._y,
                    key: `${node.id}-${c.id}`
                });
            });
        }
    };
    assignCoords(root);

    const minX = Math.min(...nodes.map(n => n._x));
    const maxX = Math.max(...nodes.map(n => n._x));
    const minY = Math.min(...nodes.map(n => n._y));
    const maxY = Math.max(...nodes.map(n => n._y));

    const padding = 40;
    const xOffset = -minX + padding;
    const yOffset = padding;

    nodes.forEach(n => {
        n._x += xOffset;
        n._y += yOffset;
    });
    edges.forEach(e => {
        e.x1 += xOffset;
        e.y1 += yOffset;
        e.x2 += xOffset;
        e.y2 += yOffset;
    });

    const width = (maxX - minX) + (padding * 2) + NODE_WIDTH;
    const height = (maxY - minY) + (padding * 2) + NODE_HEIGHT;

    return { nodes, edges, width, height };
};

// Helper: Validate factor tree answers
const validateFactorTree = (treeData, userAnswers) => {
    if (!treeData || !userAnswers) return false;

    // Collect all input nodes
    const collectInputNodes = (node, result = []) => {
        if (!node) return result;
        if (node.isInput) result.push(node);
        if (node.children) {
            node.children.forEach(c => collectInputNodes(c, result));
        }
        return result;
    };

    const inputNodes = collectInputNodes(treeData);

    // Check all input nodes have valid values
    for (const node of inputNodes) {
        const userVal = userAnswers[node.id];
        if (!userVal || userVal.trim() === '') return false;

        // For now, accept any non-empty value
        // Full validation could check multiplication relationships
        if (node.val !== undefined && parseInt(userVal) !== node.val) {
            return false;
        }
    }

    return true;
};

const PracticeFactorTree = ({
    question,
    topic,
    activeQuestionIndex,
    onNext,
    onCorrect,
    onWrong,
    onRepeat,
    isLastQuestion
}) => {
    const [userAnswers, setUserAnswers] = useState({});
    const [isComplete, setIsComplete] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [checked, setChecked] = useState(false);
    const [isWrong, setIsWrong] = useState(false);

    // Clone tree data for manipulation
    const treeData = useMemo(() =>
        question?.tree ? JSON.parse(JSON.stringify(question.tree)) : null,
        [question]);

    const layout = useMemo(() => calculateTreeLayout(treeData), [treeData]);

    useEffect(() => {
        // Reset state on new question
        setUserAnswers({});
        setIsComplete(false);
        setShowAnswer(false);
        setChecked(false);
        setIsWrong(false);
    }, [activeQuestionIndex, question]);

    const handleInputChange = (nodeId, value) => {
        if (showAnswer) return;
        if (value && !/^\d*$/.test(value)) return;

        setUserAnswers(prev => ({ ...prev, [nodeId]: value }));
        setChecked(false);
        setIsWrong(false);
    };

    const handleCheck = () => {
        // Basic validation: check if all input fields are filled and match expected values
        const isValid = validateFactorTree(treeData, userAnswers);

        if (isValid) {
            setIsComplete(true);
            setChecked(true);
            if (onCorrect) onCorrect();
        } else {
            setIsWrong(true);
            setChecked(true);
            if (onWrong) onWrong();
        }
    };

    const revealAnswers = () => {
        setShowAnswer(true);
        // Fill in correct answers from tree
        const collectCorrectAnswers = (node, result = {}) => {
            if (!node) return result;
            if (node.isInput && node.val !== undefined) {
                result[node.id] = String(node.val);
            }
            if (node.children) {
                node.children.forEach(c => collectCorrectAnswers(c, result));
            }
            return result;
        };
        const correctAnswers = collectCorrectAnswers(treeData);
        setUserAnswers(correctAnswers);
    };

    return (
        <div className={Styles.container}>
            <div className={Styles.header}>
                <span>Topic: {topic}</span>
            </div>

            {question?.question && (
                <div className={Styles.questionText}>
                    <MathRenderer content={question.question} />
                </div>
            )}

            <div className={Styles.treeScrollContainer}>
                <div className={Styles.treeCanvas} style={{ width: layout.width, height: layout.height }}>
                    <svg className={Styles.svgLayer} width={layout.width} height={layout.height}>
                        {layout.edges.map(e => (
                            <line
                                key={e.key}
                                x1={e.x1}
                                y1={e.y1}
                                x2={e.x2}
                                y2={e.y2}
                                className={Styles.connectorLine}
                            />
                        ))}
                    </svg>

                    {layout.nodes.map(node => {
                        const isInput = node.isInput;
                        const hasChildren = node.children && node.children.length > 0;
                        const value = userAnswers[node.id] !== undefined ? userAnswers[node.id] : "";

                        const nodeClass = hasChildren ? Styles.compositeNode : Styles.primeNode;

                        // Determine input styling based on state
                        let inputStyle = {};
                        if (showAnswer) {
                            inputStyle = { backgroundColor: '#d4edda', borderColor: '#28a745' };
                        } else if (checked && isWrong && isInput) {
                            inputStyle = { borderColor: '#dc3545', backgroundColor: '#f8d7da' };
                        } else if (isComplete && isInput) {
                            inputStyle = { borderColor: '#28a745', backgroundColor: '#d4edda' };
                        }

                        return (
                            <div
                                key={node.id}
                                className={`${Styles.nodeAbsolute} ${nodeClass}`}
                                style={{ left: node._x, top: node._y }}
                            >
                                {isInput ? (
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className={Styles.inputField}
                                        value={value}
                                        onChange={(e) => handleInputChange(node.id, e.target.value)}
                                        autoComplete="off"
                                        readOnly={showAnswer || isComplete}
                                        style={{
                                            cursor: (showAnswer || isComplete) ? 'default' : 'text',
                                            ...inputStyle
                                        }}
                                    />
                                ) : (
                                    <span className={Styles.staticText}>{node.val}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={Styles.actions}>
                {!isComplete && !showAnswer && (
                    <>
                        <Button
                            onClick={handleCheck}
                            variant="contained"
                            color="primary"
                            startIcon={<Check />}
                        >
                            Check Answer
                        </Button>
                        <Button onClick={revealAnswers} color="warning">
                            Show Answer
                        </Button>
                    </>
                )}
                {isComplete && (
                    <Button
                        onClick={onNext}
                        variant="contained"
                        color="success"
                        endIcon={<ArrowRight />}
                    >
                        {isLastQuestion ? "Finish" : "Next Question"}
                    </Button>
                )}
                {showAnswer && (
                    <Button onClick={onRepeat} startIcon={<RefreshCcw />}>
                        Retry Question
                    </Button>
                )}
            </div>
        </div>
    );
};

export default PracticeFactorTree;
