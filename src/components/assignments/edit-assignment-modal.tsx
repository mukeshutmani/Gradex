"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  Image,
  Calendar,
  Award,
  BookOpen,
  Edit,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

interface Assignment {
  id: string
  title: string
  subject: string
  description?: string
  textContent?: string
  imageUrl?: string
  totalMarks: number
  dueDate: string
  createdAt: string
  updatedAt: string
  teacherId: string
}

interface EditAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  assignment: Assignment | null
}

export function EditAssignmentModal({ isOpen, onClose, onSuccess, assignment }: EditAssignmentModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"text" | "image">("text")

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    textContent: "",
    imageUrl: "",
    totalMarks: "",
    dueDate: "",
    dueTime: "23:59"
  })

  const commonSubjects = [
    "Mathematics", "Science", "English", "History", "Geography",
    "Physics", "Chemistry", "Biology", "Computer Science", "Art",
    "Physical Education", "Music", "Economics", "Psychology", "Sociology"
  ]

  // Populate form when assignment changes
  useEffect(() => {
    if (assignment) {
      const dueDate = new Date(assignment.dueDate)
      const dateString = dueDate.toISOString().split('T')[0]
      const timeString = dueDate.toTimeString().slice(0, 5)

      setFormData({
        title: assignment.title,
        subject: assignment.subject,
        description: assignment.description || "",
        textContent: assignment.textContent || "",
        imageUrl: assignment.imageUrl || "",
        totalMarks: assignment.totalMarks.toString(),
        dueDate: dateString,
        dueTime: timeString
      })

      // Set active tab based on existing content
      if (assignment.imageUrl && !assignment.textContent) {
        setActiveTab("image")
      } else {
        setActiveTab("text")
      }
    }
  }, [assignment])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Assignment title is required")
      return false
    }
    if (!formData.subject.trim()) {
      setError("Subject is required")
      return false
    }
    if (!formData.totalMarks || parseInt(formData.totalMarks) < 1) {
      setError("Total marks must be at least 1")
      return false
    }
    if (!formData.dueDate) {
      setError("Due date is required")
      return false
    }

    // Check if either text content or image is provided
    if (!formData.textContent.trim() && !formData.imageUrl.trim()) {
      setError("Please provide either text content or an image for the assignment")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!assignment || !validateForm()) return

    setLoading(true)
    setError("")

    try {
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`)

      const response = await fetch("/api/assignments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId: assignment.id,
          title: formData.title.trim(),
          subject: formData.subject.trim(),
          description: formData.description.trim() || undefined,
          textContent: formData.textContent.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
          totalMarks: parseInt(formData.totalMarks),
          dueDate: dueDateTime.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update assignment")
      }

      const result = await response.json()

      setSuccess(true)

      // Close modal after a short delay
      setTimeout(() => {
        setSuccess(false)
        onClose()
        onSuccess?.()
        router.refresh() // Refresh the page to show updated assignment
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update assignment")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError("")
      setSuccess(false)
      onClose()
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Edit Assignment
          </DialogTitle>
          <DialogDescription>
            Update the assignment details below. Changes will be saved to the database.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h3 className="text-lg font-semibold text-green-700">Assignment Updated Successfully!</h3>
            <p className="text-gray-600 text-center">Your assignment changes have been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Mathematics Quiz - Chapter 5"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks *</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min="1"
                    value={formData.totalMarks}
                    onChange={(e) => handleInputChange("totalMarks", e.target.value)}
                    placeholder="100"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the assignment..."
                  rows={2}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    min={today}
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueTime">Due Time</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => handleInputChange("dueTime", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Assignment Content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Assignment Content *</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={activeTab === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("text")}
                    disabled={loading}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Text Content
                  </Button>
                  <Button
                    type="button"
                    variant={activeTab === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("image")}
                    disabled={loading}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Image Upload
                  </Button>
                </div>
              </div>

              {activeTab === "text" && (
                <div className="space-y-2">
                  <Textarea
                    value={formData.textContent}
                    onChange={(e) => handleInputChange("textContent", e.target.value)}
                    placeholder="Enter the assignment questions or instructions here..."
                    rows={6}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    Provide detailed questions or instructions for the assignment.
                  </p>
                </div>
              )}

              {activeTab === "image" && (
                <div className="space-y-2">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    placeholder="Enter image URL..."
                    disabled={loading}
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Upload image functionality will be implemented soon
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      For now, paste the image URL above
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Assignment
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}