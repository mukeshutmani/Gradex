"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  FileText,
  Clock,
  BookOpen,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"
import { AIGradingModal } from "./ai-grading-modal"

interface Assignment {
  id: string
  title: string
  subject: string
  description?: string
  totalMarks: number
  dueDate: string
  class?: {
    name: string
    teacher: {
      name: string
    }
  }
}

interface SubmitAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: Assignment | null
  onSuccess?: () => void
}

export function SubmitAssignmentModal({
  isOpen,
  onClose,
  assignment,
  onSuccess
}: SubmitAssignmentModalProps) {
  const [submissionData, setSubmissionData] = useState({
    content: "",
    file: null as File | null
  })
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!assignment) return
    if (!submissionData.content.trim() && !submissionData.file) {
      alert("Please provide either written content or upload a file")
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('assignmentId', assignment.id)
      formData.append('content', submissionData.content)

      if (submissionData.file) {
        formData.append('file', submissionData.file)
      }

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        // Store submission ID for grading update
        setSubmissionId(data.submission?.id || null)

        // Close submission modal and show grading modal
        setSubmissionData({ content: "", file: null })
        onClose()
        setIsGradingModalOpen(true)
      } else {
        alert(`Failed to submit assignment: ${data.error}`)
      }
    } catch (error) {
      console.error("Error submitting assignment:", error)
      alert("Failed to submit assignment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleGradingComplete = async (marks: number, feedback: string) => {
    // Update submission with marks and feedback in database
    if (submissionId) {
      try {
        const response = await fetch("/api/submissions/grade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            submissionId,
            marks,
            feedback,
            status: "graded"
          }),
        })

        if (response.ok) {
          console.log("Grading saved successfully")
        }
      } catch (error) {
        console.error("Error saving grading:", error)
      }
    }
  }

  const handleGradingModalClose = () => {
    setIsGradingModalOpen(false)
    setSubmissionId(null)
    // Trigger data refresh callback
    onSuccess?.()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }
      setSubmissionData({ ...submissionData, file })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }
      setSubmissionData({ ...submissionData, file })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeFile = () => {
    setSubmissionData({ ...submissionData, file: null })
  }

  const handleClose = () => {
    setSubmissionData({ content: "", file: null })
    setDragOver(false)
    onClose()
  }

  if (!assignment) return null

  const isOverdue = new Date(assignment.dueDate) < new Date()
  const timeLeft = new Date(assignment.dueDate).getTime() - new Date().getTime()
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span>Submit Assignment</span>
          </DialogTitle>
          <DialogDescription>
            Submit your work for the assignment below. You can either write your answer or upload a file.
          </DialogDescription>
        </DialogHeader>

        {/* Assignment Info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{assignment.subject}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{assignment.class?.teacher.name}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline">{assignment.totalMarks} marks</Badge>
          </div>

          {assignment.description && (
            <p className="text-sm text-gray-700">{assignment.description}</p>
          )}

          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-600"}>
              {isOverdue
                ? "This assignment is overdue"
                : daysLeft > 0
                ? `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                : "Due today"
              }
            </span>
            <span className="text-gray-500">
              ({new Date(assignment.dueDate).toLocaleDateString()})
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Written Answer */}
          <div className="space-y-2">
            <Label htmlFor="content">Written Answer</Label>
            <Textarea
              id="content"
              value={submissionData.content}
              onChange={(e) => setSubmissionData({ ...submissionData, content: e.target.value })}
              placeholder="Type your answer here... (optional if uploading a file)"
              rows={6}
              className="resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload File (Optional)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {submissionData.file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <span className="font-medium text-gray-900">
                      {submissionData.file.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {(submissionData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600">
                      Drag and drop your file here, or{" "}
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, TXT, or Image files (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warning for overdue */}
          {isOverdue && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">
                This assignment is past its due date. Late submissions may receive reduced marks.
              </span>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || (!submissionData.content.trim() && !submissionData.file)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* AI Grading Modal */}
    <AIGradingModal
      isOpen={isGradingModalOpen}
      onClose={handleGradingModalClose}
      assignmentTitle={assignment?.title || ""}
      totalMarks={assignment?.totalMarks || 100}
      onGradingComplete={handleGradingComplete}
    />
  </>
  )
}