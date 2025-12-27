"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Loader2, Award, AlertCircle } from "lucide-react"
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
    { id: "upload", label: "Uploading submission", completed: false, loading: false },
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

  useEffect(() => {
    if (isOpen) {
      startGrading()
    }
  }, [isOpen])

  const startGrading = async () => {
    setIsComplete(false)
    setGradingResult(null)
    setError(null)

    // Animate through the steps while waiting for API
    const animateSteps = async () => {
      for (let i = 0; i < steps.length - 1; i++) {
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          loading: index === i,
          completed: index < i
        })))
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600))
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          loading: false,
          completed: index <= i
        })))
      }
    }

    // Start animation and API call concurrently
    const animationPromise = animateSteps()

    try {
      // Call the AI grading API
      const response = await fetch("/api/submissions/ai-grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionId }),
      })

      const data = await response.json()

      // Wait for animation to complete
      await animationPromise

      if (!response.ok) {
        throw new Error(data.error || "Failed to grade submission")
      }

      // Set final step as complete
      setSteps(prev => prev.map(step => ({
        ...step,
        loading: false,
        completed: true
      })))

      const { marks, percentage, grade, feedback } = data

      setGradingResult({
        marks,
        percentage,
        grade,
        feedback
      })

      setIsComplete(true)

      // Call the callback with results
      if (onGradingComplete) {
        await onGradingComplete(marks, feedback)
      }
    } catch (err) {
      // Wait for animation to complete even on error
      await animationPromise

      setError(err instanceof Error ? err.message : "Failed to grade submission")
      setSteps(prev => prev.map(step => ({
        ...step,
        loading: false,
        completed: false
      })))
    }
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
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
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
                : "bg-gradient-to-br from-blue-500 to-purple-600"
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

          {/* Grading Steps */}
          {!isComplete && !error && (
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-500'
                      : step.loading
                      ? 'bg-blue-500'
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
                  <span className={`text-sm ${
                    step.completed
                      ? 'text-green-700 font-medium'
                      : step.loading
                      ? 'text-blue-700 font-medium'
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
                  onClick={onClose}
                  variant="outline"
                  className="mr-2"
                >
                  Close
                </Button>
                <Button
                  onClick={startGrading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Grading Result */}
          {isComplete && gradingResult && (
            <div className="space-y-4">
              {/* Score Display */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="text-sm text-gray-600 mb-2">Your Score</div>
                <div className={`text-6xl font-bold ${getGradeColor(gradingResult.percentage)}`}>
                  {gradingResult.marks}/{totalMarks}
                </div>
                <div className="text-2xl font-semibold text-gray-700 mt-2">
                  {gradingResult.percentage.toFixed(1)}% ({gradingResult.grade})
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-2 text-blue-500" />
                  AI Feedback
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {gradingResult.feedback}
                </p>
              </div>

              {/* Success Message */}
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Your submission has been graded and saved successfully!
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {isComplete && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
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
