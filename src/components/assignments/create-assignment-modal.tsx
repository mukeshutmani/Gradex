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
  Plus,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

interface CreateAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ClassInfo {
  id: string
  name: string
  classCode: string
  studentCount?: number
}

export function CreateAssignmentModal({ isOpen, onClose, onSuccess }: CreateAssignmentModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"text" | "image">("text")
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    textContent: "",
    imageUrl: "",
    totalMarks: "",
    dueDate: "",
    dueTime: "23:59",
    classId: ""
  })

  const commonSubjects = [
    "Mathematics", "Science", "English", "History", "Geography",
    "Physics", "Chemistry", "Biology", "Computer Science", "Art",
    "Physical Education", "Music", "Economics", "Psychology", "Sociology"
  ]

  // Fetch teacher's classes when modal opens
  const fetchClasses = async () => {
    setLoadingClasses(true)
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      } else {
        console.error('Failed to fetch classes')
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoadingClasses(false)
    }
  }

  // Fetch classes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClasses()
    }
  }, [isOpen])

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
    if (!formData.classId) {
      setError("Please select a class for this assignment")
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

    // Check if due date is in the future
    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`)
    if (dueDateTime <= new Date()) {
      setError("Due date must be in the future")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`)

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          subject: formData.subject.trim() || "General",
          description: formData.description.trim() || undefined,
          textContent: formData.textContent.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
          totalMarks: parseInt(formData.totalMarks),
          dueDate: dueDateTime.toISOString(),
          classId: formData.classId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create assignment")
      }

      const result = await response.json()

      setSuccess(true)

      // Reset form
      setFormData({
        title: "",
        subject: "",
        description: "",
        textContent: "",
        imageUrl: "",
        totalMarks: "",
        dueDate: "",
        dueTime: "23:59",
        classId: ""
      })

      // Close modal after a short delay
      setTimeout(() => {
        setSuccess(false)
        onClose()
        onSuccess?.()
        router.refresh() // Refresh the page to show new assignment
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assignment")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: "",
        subject: "",
        description: "",
        textContent: "",
        imageUrl: "",
        totalMarks: "",
        dueDate: "",
        dueTime: "23:59",
        classId: ""
      })
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
            <Plus className="h-5 w-5 text-blue-600" />
            Create New Assignment
          </DialogTitle>
          <DialogDescription>
            Create a new assignment for your students. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h3 className="text-lg font-semibold text-green-700">Assignment Created Successfully!</h3>
            <p className="text-gray-600 text-center">Your assignment has been created and is now available to students.</p>
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
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="e.g., Mathematics, Science, English"
                    disabled={loading}
                  />
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
                <Label htmlFor="classId">Select Class *</Label>
                {loadingClasses ? (
                  <div className="flex items-center justify-center h-10 border rounded-md bg-gray-50">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : classes.length === 0 ? (
                  <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200">
                    <p className="text-sm text-yellow-700">
                      No classes available. Please create a class first before creating assignments.
                    </p>
                  </div>
                ) : (
                  <Select value={formData.classId} onValueChange={(value) => handleInputChange("classId", value)} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{classItem.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {classItem.classCode}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
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