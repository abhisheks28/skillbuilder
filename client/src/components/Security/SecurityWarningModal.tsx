"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, XCircle, Eye, Keyboard } from "lucide-react"
import { SecurityWarningModalProps, ViolationType } from './types'

export function SecurityWarningModal({
    isOpen,
    onClose,
    violationType,
    violationCount,
    maxViolations,
    testName,
    onContinue
}: SecurityWarningModalProps) {
    const remainingAttempts = maxViolations - violationCount
    const isLastWarning = remainingAttempts === 0

    const getViolationIcon = () => {
        switch (violationType) {
            case 'tab-switch':
                return <Eye className="w-12 h-12 text-orange-500" />
            case 'fullscreen-exit':
                return <XCircle className="w-12 h-12 text-red-500" />
            case 'right-click':
            case 'copy-attempt':
            case 'paste-attempt':
                return <Keyboard className="w-12 h-12 text-yellow-500" />
            default:
                return <AlertTriangle className="w-12 h-12 text-orange-500" />
        }
    }

    const getViolationTitle = () => {
        if (isLastWarning) {
            return "⚠️ Test Auto-Submitted!"
        }

        switch (violationType) {
            case 'tab-switch':
                return `Warning ${violationCount}/${maxViolations}: Tab Switch Detected`
            case 'fullscreen-exit':
                return "Warning: Fullscreen Required"
            case 'right-click':
                return "Warning: Right-Click Disabled"
            case 'copy-attempt':
            case 'paste-attempt':
                return "Warning: Copy/Paste Disabled"
            default:
                return "Security Warning"
        }
    }

    const getViolationMessage = () => {
        if (isLastWarning) {
            return `You have switched tabs ${maxViolations} times. Your ${testName} has been automatically submitted for review.`
        }

        switch (violationType) {
            case 'tab-switch':
                return `You have switched tabs ${violationCount} time(s). ${remainingAttempts} warning(s) remaining before auto-submit.`
            case 'fullscreen-exit':
                return `Please stay in fullscreen mode during the ${testName}. The test will automatically re-enter fullscreen.`
            case 'right-click':
                return `Right-clicking is disabled during the ${testName} to maintain test integrity.`
            case 'copy-attempt':
            case 'paste-attempt':
                return `Copy and paste operations are disabled during the ${testName}.`
            default:
                return `Please follow the test guidelines for ${testName}.`
        }
    }

    const handleContinue = async () => {
        // Trigger fullscreen re-entry immediately (needs user gesture)
        if (onContinue) {
            await onContinue()
        }
        // Close modal after fullscreen is activated
        onClose()
    }

    // Block ALL attempts to close the modal
    const handleOpenChange = (open: boolean) => {
        // Do nothing - modal cannot be closed except via Continue button
        return
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <DialogContent className="sm:max-w-md bg-white">
                <div className="flex flex-col items-center justify-center pt-8 pb-6 px-4">
                    {/* Styled Icon Container - Explicit Size and Spacing */}
                    <div className={`flex items-center justify-center w-24 h-24 rounded-full mb-6 relative z-10 ${violationType === 'fullscreen-exit' || isLastWarning
                        ? 'bg-red-50 text-red-600 border-2 border-red-100'
                        : 'bg-amber-50 text-amber-600 border-2 border-amber-100'
                        }`}>
                        <div className="transform scale-125">
                            {getViolationIcon()}
                        </div>
                    </div>

                    {/* Title and Message */}
                    <div className="space-y-3 text-center w-full relative z-10 px-2">
                        <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                            {getViolationTitle()}
                        </DialogTitle>
                        <div className="text-lg text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                            {getViolationMessage()}
                        </div>
                    </div>
                </div>

                {/* Warning Counter Section */}
                <div className="space-y-6 px-2">
                    {!isLastWarning && violationType === 'tab-switch' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                <span className="font-bold text-amber-900 text-lg">
                                    Remaining Warnings
                                </span>
                            </div>
                            <div className="flex justify-center gap-4">
                                {Array.from({ length: maxViolations }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all shadow-md ${i < violationCount
                                            ? 'bg-red-500 text-white'
                                            : 'bg-emerald-500 text-white'
                                            }`}
                                    >
                                        {i < violationCount ? '✕' : '✓'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isLastWarning && (
                        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 text-center shadow-sm">
                            <div className="font-bold text-red-800 text-lg">
                                This test has been auto-submitted due to security violations.
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 pb-2">
                    <Button
                        onClick={handleContinue}
                        className={`w-full h-14 text-xl font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${isLastWarning
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200'
                            }`}
                    >
                        {isLastWarning ? "Understood" : "Return to Fullscreen"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
