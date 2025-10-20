"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Loader2, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIGradingModalProps {
  isOpen: boolean
  onClose: () => void
  assignmentTitle: string
  totalMarks: number
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

    // Simulate AI grading process
    for (let i = 0; i < steps.length; i++) {
      // Set current step as loading
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        loading: index === i,
        completed: index < i
      })))

      // Simulate processing time (1-2 seconds per step)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

      // Complete current step
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        loading: false,
        completed: index <= i
      })))
    }

    // Generate mock grading result
    // In production, this will come from AI API
    const marks = Math.floor(Math.random() * (totalMarks * 0.3)) + (totalMarks * 0.7) // 70-100% range
    const percentage = (marks / totalMarks) * 100
    const grade = getGradeLetter(percentage)

    const feedback = generateMockFeedback(percentage)

    setGradingResult({
      marks,
      percentage,
      grade,
      feedback
    })

    setIsComplete(true)

    // Call the callback with results
    if (onGradingComplete) {
      onGradingComplete(marks, feedback)
    }
  }

  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 90) return "A+"
    if (percentage >= 85) return "A"
    if (percentage >= 80) return "A-"
    if (percentage >= 75) return "B+"
    if (percentage >= 70) return "B"
    if (percentage >= 65) return "B-"
    if (percentage >= 60) return "C+"
    if (percentage >= 55) return "C"
    if (percentage >= 50) return "C-"
    return "F"
  }

  const generateMockFeedback = (percentage: number): string => {
    if (percentage >= 90) {
      return "Excellent work! Your submission demonstrates a thorough understanding of the topic. The content is well-structured, comprehensive, and shows critical thinking. Grammar and presentation are impeccable. Keep up the outstanding work!"
    } else if (percentage >= 80) {
      return "Great job! Your work shows strong understanding and good effort. The content is well-organized and covers most key points effectively. Minor improvements could be made in depth of analysis or presentation."
    } else if (percentage >= 70) {
      return "Good work! You have demonstrated a solid grasp of the material. The submission covers the main points adequately. Consider adding more detail and examples to strengthen your arguments. Review grammar and formatting for improvement."
    } else if (percentage >= 60) {
      return "Satisfactory work. You have covered the basic requirements, but there is room for improvement. Focus on developing your ideas more fully and ensuring accuracy of content. Pay attention to grammar and structure."
    } else {
      return "Your submission needs improvement. Please review the assignment requirements carefully and ensure you address all key points. Consider seeking additional help to strengthen your understanding of the topic. Focus on content accuracy, organization, and presentation."
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
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              {isComplete ? (
                <Award className="h-8 w-8 text-white" />
              ) : (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isComplete ? "Grading Complete!" : "AI Grading in Progress"}
            </h2>
            <p className="text-sm text-gray-600 mt-2">{assignmentTitle}</p>
          </div>

          {/* Grading Steps */}
          {!isComplete && (
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
