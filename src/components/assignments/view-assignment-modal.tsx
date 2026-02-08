"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  Calendar,
  Award,
  BookOpen,
  FileText,
  Image,
  Clock,
  User,
  X,
  ExternalLink
} from "lucide-react"
import { PDFViewer } from "@/components/pdf-viewer"

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
  submissions?: any[]
}

interface ViewAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: Assignment | null
}

export function ViewAssignmentModal({ isOpen, onClose, assignment }: ViewAssignmentModalProps) {
  if (!assignment) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isDuePassed = new Date(assignment.dueDate) < new Date()
  const submissionCount = assignment.submissions?.length || 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Assignment Details
          </DialogTitle>
          <DialogDescription>
            View all details and information about this assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Assignment Title</label>
                  <div className="mt-1 text-lg font-semibold text-gray-900">{assignment.title}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">{assignment.subject}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Marks</label>
                  <div className="mt-1 text-lg font-semibold text-gray-900">{assignment.totalMarks}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={isDuePassed ? "destructive" : "default"}
                           className={isDuePassed ? "" : "bg-green-100 text-green-800 border-green-300"}>
                      {isDuePassed ? "Past Due" : "Active"}
                    </Badge>
                  </div>
                </div>
              </div>

              {assignment.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-700">
                    {assignment.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Assignment Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignment.textContent && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500">Text Content</label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-md border whitespace-pre-wrap text-gray-700">
                    {assignment.textContent}
                  </div>
                </div>
              )}

              {assignment.imageUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Attached File</label>
                  <div className="mt-1">
                    {assignment.imageUrl.toLowerCase().includes("pdf") ? (
                      <div className="space-y-3">
                        <PDFViewer fileUrl={assignment.imageUrl} />
                        <div className="flex justify-center">
                          <a
                            href={assignment.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-violet-50 border border-violet-200 rounded-lg text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-colors text-sm"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Assignment in New Tab
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-md p-2 bg-gray-50">
                        <img
                          src={assignment.imageUrl}
                          alt="Assignment content"
                          className="max-w-full h-auto rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.removeAttribute('hidden')
                          }}
                        />
                        <div hidden className="text-center py-8 text-gray-500">
                          <Image className="h-12 w-12 mx-auto mb-2" />
                          <p>Image could not be loaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!assignment.textContent && !assignment.imageUrl && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>No content provided for this assignment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates and Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <div className="mt-1 text-gray-900">{formatDate(assignment.createdAt)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="mt-1 text-gray-900">{formatDate(assignment.updatedAt)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <div className="mt-1">
                    <div className={`font-semibold ${isDuePassed ? 'text-red-600' : 'text-green-600'}`}>
                      {formatDate(assignment.dueDate)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                Submission Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Submissions</label>
                  <div className="mt-1 text-2xl font-bold text-gray-900">{submissionCount}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Graded Submissions</label>
                  <div className="mt-1 text-2xl font-bold text-green-600">
                    {assignment.submissions?.filter(s => s.status === "graded").length || 0}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pending Reviews</label>
                  <div className="mt-1 text-2xl font-bold text-orange-600">
                    {assignment.submissions?.filter(s => s.status === "pending").length || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Assignment ID</label>
                  <div className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded text-gray-700">
                    {assignment.id}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teacher ID</label>
                  <div className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded text-gray-700">
                    {assignment.teacherId}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}