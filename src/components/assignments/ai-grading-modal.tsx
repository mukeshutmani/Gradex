"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Loader2, Award, AlertCircle, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIGradingModalProps {
  isOpen: boolean
  onClose: () => void
  assignmentTitle: string
  totalMarks: number
  submissionId: string
  onGradingComplete?: (marks: number, feedback: string) => void
}

interface GradingStep {
  id: string
  label: string
  completed: boolean
  loading: boolean
}

export function AIGradingModal({
  isOpen,
  onClose,
  assignmentTitle,
  totalMarks,
  submissionId,
  onGradingComplete
}: AIGradingModalProps) {
  const [steps, setSteps] = useState<GradingStep[]>([
    { id: "upload", label: "Processing submission", completed: false, loading: false },
    { id: "analyze", label: "Analyzing content quality", completed: false, loading: false },
    { id: "plagiarism", label: "Checking for plagiarism", completed: false, loading: false },
    { id: "grammar", label: "Evaluating grammar and structure", completed: false, loading: false },
    { id: "accuracy", label: "Verifying accuracy and relevance", completed: false, loading: false },
    { id: "grading", label: "Calculating final grade", completed: false, loading: false },
    { id: "feedback", label: "Generating detailed feedback", completed: false, loading: false },
  ])

  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gradingResult, setGradingResult] = useState<{
    marks: number
    percentage: number
    grade: string
    feedback: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [manualReview, setManualReview] = useState(false)
  const [duplicateInfo, setDuplicateInfo] = useState<{
    similarity: number
    similarStudent: string
  } | null>(null)
  const gradingInProgress = useRef(false)

  // New states for enhanced animation
  const [showResult, setShowResult] = useState(false)
  const [displayedMarks, setDisplayedMarks] = useState(0)
  const [countUpDone, setCountUpDone] = useState(false)
  const [visibleFeedbackSections, setVisibleFeedbackSections] = useState(0)
  const apiResolved = useRef(false)
  const apiResultRef = useRef<{
    marks: number
    percentage: number
    grade: string
    feedback: string
    duplicate?: { similarity: number; similarStudent: string }
    requiresManualReview?: boolean
    error?: string
  } | null>(null)
  const stepsReachedLast = useRef(false)

  useEffect(() => {
    if (isOpen && !gradingInProgress.current) {
      startGrading()
    }
  }, [isOpen])

  // Score count-up animation
  useEffect(() => {
    if (!showResult || !gradingResult) return

    const target = gradingResult.marks
    const duration = 1500
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * target)

      setDisplayedMarks(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayedMarks(target)
        setCountUpDone(true)
      }
    }

    requestAnimationFrame(animate)
  }, [showResult, gradingResult])

  // Staggered feedback reveal after count-up completes
  useEffect(() => {
    if (!countUpDone || !gradingResult) return

    const sections = gradingResult.feedback.split("\n\n")
    let i = 0
    const interval = setInterval(() => {
      i++
      setVisibleFeedbackSections(i)
      if (i >= sections.length) clearInterval(interval)
    }, 200)

    return () => clearInterval(interval)
  }, [countUpDone, gradingResult])

  const handleDeleteAndClose = async () => {
    setDeleting(true)
    try {
      await fetch(`/api/submissions/${submissionId}`, { method: "DELETE" })
    } catch (e) {
      console.error("Failed to delete submission:", e)
    } finally {
      setDeleting(false)
      onClose()
    }
  }

  const completeLastStepAndReveal = useCallback(async () => {
    // Mark step 7 (last step) as complete
    setSteps(prev => prev.map(step => ({
      ...step,
      loading: false,
      completed: true
    })))

    const result = apiResultRef.current
    if (!result) return

    if (result.error) {
      setError(result.error)
      setSteps(prev => prev.map(step => ({
        ...step,
        loading: false,
        completed: false
      })))
      return
    }

    if (result.requiresManualReview) {
      setManualReview(true)
      setIsComplete(true)
      return
    }

    if (result.duplicate) {
      setDuplicateInfo(result.duplicate)
    }

    setGradingResult({
      marks: result.marks,
      percentage: result.percentage,
      grade: result.grade,
      feedback: result.feedback
    })

    setIsComplete(true)

    // Staggered reveal: 500ms pause, then show result
    await new Promise(resolve => setTimeout(resolve, 500))
    setShowResult(true)

    if (onGradingComplete) {
      await onGradingComplete(result.marks, result.feedback)
    }
  }, [onGradingComplete])

  const startGrading = async () => {
    if (gradingInProgress.current) return
    gradingInProgress.current = true

    // Reset all state
    setIsComplete(false)
    setGradingResult(null)
    setError(null)
    setManualReview(false)
    setDuplicateInfo(null)
    setShowResult(false)
    setDisplayedMarks(0)
    setCountUpDone(false)
    setVisibleFeedbackSections(0)
    apiResolved.current = false
    apiResultRef.current = null
    stepsReachedLast.current = false

    setSteps(prev => prev.map(step => ({
      ...step,
      completed: false,
      loading: false
    })))

    // Animate steps 1-6 (indices 0-5), leaving step 7 (index 6) for after API
    const animateSteps = async () => {
      for (let i = 0; i < steps.length - 1; i++) {
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          loading: index === i,
          completed: index < i
        })))
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          loading: false,
          completed: index <= i
        })))
      }

      // Now set step 7 (last step) to loading
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        loading: index === steps.length - 1,
        completed: index < steps.length - 1
      })))

      stepsReachedLast.current = true

      // If API already resolved by the time we reach step 7, finish immediately
      if (apiResolved.current) {
        await completeLastStepAndReveal()
      }
      // Otherwise, step 7 stays spinning until API resolves
    }

    // Start animation and API call concurrently
    const animationPromise = animateSteps()

    try {
      const response = await fetch("/api/submissions/ai-grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        apiResultRef.current = { error: data.error || "Failed to grade submission", marks: 0, percentage: 0, grade: "", feedback: "" }
      } else if (data.requiresManualReview) {
        apiResultRef.current = { requiresManualReview: true, marks: 0, percentage: 0, grade: "", feedback: "" }
      } else {
        apiResultRef.current = {
          marks: data.marks,
          percentage: data.percentage,
          grade: data.grade,
          feedback: data.feedback,
          duplicate: data.duplicate
        }
      }

      apiResolved.current = true

      // If steps already reached the last step, trigger completion now
      if (stepsReachedLast.current) {
        await completeLastStepAndReveal()
      }
      // Otherwise, animateSteps will handle it when it reaches step 7

      // Wait for animation to finish (in case API resolved first)
      await animationPromise

    } catch (err) {
      apiResultRef.current = {
        error: err instanceof Error ? err.message : "Failed to grade submission",
        marks: 0, percentage: 0, grade: "", feedback: ""
      }
      apiResolved.current = true

      if (stepsReachedLast.current) {
        await completeLastStepAndReveal()
      }

      await animationPromise
    } finally {
      gradingInProgress.current = false
    }
  }

  // Parse feedback section: "[Title] Score\nContent" or legacy emoji format
  const parseFeedbackSection = (section: string) => {
    const bracketMatch = section.match(/^\[(.+?)\]\s*(.*?)\n(.+)$/s)
    if (bracketMatch) {
      return { title: bracketMatch[1], score: bracketMatch[2].trim(), content: bracketMatch[3].trim() }
    }
    // Legacy: emoji prefix
    return { title: "", score: "", content: section }
  }

  const getSectionStyle = (title: string, content: string) => {
    const t = title.toLowerCase()
    if (t.includes("duplicate")) return "bg-red-50 border-red-300 text-red-800"
    if (t.includes("strength")) return "bg-green-50 border-green-200 text-green-800"
    if (t.includes("improvement")) return "bg-orange-50 border-orange-200 text-orange-800"
    if (t.includes("marks breakdown")) return "bg-gray-50 border-gray-200 text-gray-700"
    if (t) return "bg-violet-50 border-violet-200 text-violet-800"
    // Legacy emoji fallback
    if (content.startsWith("🚨")) return "bg-red-50 border-red-300 text-red-800"
    if (content.startsWith("✅")) return "bg-green-50 border-green-200 text-green-800"
    if (content.startsWith("⚠️")) return "bg-orange-50 border-orange-200 text-orange-800"
    return "bg-gray-50 border-gray-200 text-gray-700"
  }

  const getScoreBadgeColor = (score: string) => {
    const s = score.toLowerCase()
    if (s === "good" || s === "human") return "bg-green-100 text-green-700"
    if (s === "average" || s === "mixed") return "bg-yellow-100 text-yellow-700"
    if (s === "poor" || s === "likely ai") return "bg-red-100 text-red-700"
    return "bg-violet-100 text-violet-700"
  }

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="sr-only">
          <DialogTitle>
            {isComplete ? "Grading Complete" : "AI Grading in Progress"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              error
                ? "bg-gradient-to-br from-red-500 to-red-600"
                : "bg-gradient-to-br from-violet-500 to-violet-600"
            }`}>
              {error ? (
                <AlertCircle className="h-8 w-8 text-white" />
              ) : isComplete ? (
                <Award className="h-8 w-8 text-white" />
              ) : (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {error ? "Grading Failed" : isComplete ? "Grading Complete!" : "AI Grading in Progress"}
            </h2>
            <p className="text-sm text-gray-600 mt-2">{assignmentTitle}</p>
          </div>

          {/* Grading Steps - now visible even after completion */}
          {!error && (
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    step.completed
                      ? 'bg-green-500'
                      : step.loading
                      ? 'bg-violet-500'
                      : 'bg-gray-200'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : step.loading ? (
                      <Loader2 className="h-3 w-3 text-white animate-spin" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm transition-colors duration-300 ${
                    step.completed
                      ? 'text-green-700 font-medium'
                      : step.loading
                      ? 'text-violet-700 font-medium'
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800">Unable to Grade</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleDeleteAndClose}
                  variant="outline"
                  className="mr-2"
                  disabled={deleting}
                >
                  {deleting ? "Removing..." : "Cancel & Resubmit"}
                </Button>
                <Button
                  onClick={startGrading}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Manual Review Notice */}
          {isComplete && manualReview && !gradingResult && (
            <div className="space-y-4">
              <div className="text-center p-6 bg-violet-50 rounded-lg border-2 border-violet-200">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="text-lg font-semibold text-violet-900 mb-2">File Submitted Successfully</h3>
                <p className="text-sm text-violet-700">
                  Your file has been uploaded. DOC/DOCX files require manual review — your teacher will grade it shortly.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Submission saved — awaiting teacher review
                </span>
              </div>
            </div>
          )}

          {/* Grading Result - appears below the completed steps */}
          {showResult && gradingResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Duplicate Warning */}
              {duplicateInfo && (
                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-800">Duplicate Submission Detected</h3>
                  </div>
                  <p className="text-sm text-red-700">
                    {duplicateInfo.similarity}% match found with another student. Marks have been deducted.
                  </p>
                </div>
              )}

              {/* Score Display with count-up */}
              <div className="text-center p-6 bg-violet-50 rounded-lg border-2 border-violet-200">
                <div className="text-sm text-gray-600 mb-2">Your Score</div>
                <div className={`text-6xl font-bold tabular-nums ${getGradeColor(gradingResult.percentage)}`}>
                  {displayedMarks}/{totalMarks}
                </div>
                {countUpDone && (
                  <div className="text-2xl font-semibold text-gray-700 mt-2 animate-in fade-in duration-300">
                    {gradingResult.percentage.toFixed(1)}% ({gradingResult.grade})
                  </div>
                )}
              </div>

              {/* Feedback - sections appear one by one */}
              <div className="space-y-2">
                {gradingResult.feedback.split("\n\n").map((section, i) => {
                  if (i >= visibleFeedbackSections) return null
                  const parsed = parseFeedbackSection(section)
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300 border ${getSectionStyle(parsed.title, parsed.content)}`}
                    >
                      {parsed.title ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{parsed.title}</span>
                            {parsed.score && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreBadgeColor(parsed.score)}`}>
                                {parsed.score}
                              </span>
                            )}
                          </div>
                          {parsed.title.toLowerCase().includes("marks breakdown") ? (
                            <div className="mt-2 space-y-1.5">
                              {parsed.content.split("|").map(s => s.trim()).filter(Boolean).map((item, j) => {
                                const match = item.match(/^(.+?:\s*\d+\/\d+)\s*[-–]\s*(.+)$/)
                                return (
                                  <div key={j} className="flex items-start gap-2 text-sm">
                                    <span className="font-medium text-gray-700 whitespace-nowrap">{match ? match[1] : item.split("-")[0]?.trim()}</span>
                                    {match && <span className="text-gray-500">—</span>}
                                    {match && <span className="opacity-80">{match[2]}</span>}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-sm opacity-90 mt-1">{parsed.content}</p>
                          )}
                        </>
                      ) : (
                        <p>{parsed.content}</p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Success Message - appears after all feedback sections */}
              {visibleFeedbackSections >= gradingResult.feedback.split("\n\n").length && (
                <div className="flex items-center justify-center space-x-2 text-green-600 animate-in fade-in duration-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Your submission has been graded and saved successfully!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          {isComplete && showResult && (
            <div className="flex justify-center pt-2 animate-in fade-in duration-500">
              <Button
                onClick={onClose}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8"
              >
                View My Assignments
              </Button>
            </div>
          )}

          {/* Action Button for manual review (no count-up needed) */}
          {isComplete && manualReview && !gradingResult && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={onClose}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8"
              >
                View My Assignments
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
