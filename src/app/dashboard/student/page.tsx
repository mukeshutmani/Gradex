"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  ClipboardCheck,
  BookOpen,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  FileText,
  Award,
  TrendingUp,
  User
} from "lucide-react"
import { SubmitAssignmentModal } from "@/components/assignments/submit-assignment-modal"

interface Assignment {
  id: string
  title: string
  subject: string
  description?: string
  totalMarks: number
  dueDate: string
  createdAt: string
  class?: {
    name: string
    teacher: {
      name: string
    }
  }
  submission?: {
    id: string
    marks?: number
    status: string
    submittedAt: string
  }
}

interface ClassInfo {
  id: string
  name: string
  description: string
  classCode: string
  teacher: {
    name: string
    email: string
  }
  assignments: Assignment[]
}

export default function StudentDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [joinClassCode, setJoinClassCode] = useState("")
  const [joinLoading, setJoinLoading] = useState(false)
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)
  const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] = useState<Assignment | null>(null)

  // Fetch student's enrolled classes and assignments
  const fetchStudentData = async () => {
    if (!session?.user?.email) return

    setLoading(true)
    try {
      // This would be a new API endpoint to fetch student's classes and assignments
      const response = await fetch('/api/student/dashboard')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
        setAssignments(data.assignments || [])
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Join class using class code
  const handleJoinClass = async () => {
    if (!joinClassCode.trim()) return

    setJoinLoading(true)
    try {
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classCode: joinClassCode.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        setJoinClassCode("")
        fetchStudentData() // Refresh data
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error joining class:', error)
      alert('Failed to join class. Please try again.')
    } finally {
      setJoinLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  useEffect(() => {
    if (session?.user?.email) {
      fetchStudentData()
    }
  }, [session])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading student dashboard...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Calculate stats
  const totalAssignments = assignments.length
  const submittedAssignments = assignments.filter(a => a.submission?.status === "graded" || a.submission?.status === "submitted").length
  const pendingAssignments = assignments.filter(a => !a.submission || a.submission.status === "pending").length
  const overdueAssignments = assignments.filter(a =>
    new Date(a.dueDate) < new Date() && (!a.submission || a.submission.status === "pending")
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">Gradex Student</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/dashboard/student/results')}
                variant="outline"
                className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
              >
                <Award className="h-4 w-4 mr-2" />
                View Results
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{session.user?.name || "Student"}</div>
                  <div className="text-gray-500">Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: TrendingUp },
              { id: "assignments", label: "Assignments", icon: BookOpen },
              { id: "classes", label: "My Classes", icon: Users },
              { id: "join", label: "Join Class", icon: Plus }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAssignments}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all classes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{submittedAssignments}</div>
                  <p className="text-xs text-muted-foreground">
                    Completed assignments
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingAssignments}</div>
                  <p className="text-xs text-muted-foreground">
                    Need to submit
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overdueAssignments}</div>
                  <p className="text-xs text-muted-foreground">
                    Past due date
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Assignments and Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <span>Recent Assignments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignments.slice(0, 3).map((assignment) => {
                    const isGraded = assignment.submission?.status === "graded"
                    const isSubmitted = assignment.submission?.status === "submitted"
                    const isOverdue = new Date(assignment.dueDate) < new Date()

                    return (
                      <div key={assignment.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">{assignment.subject}</p>
                          {isGraded && assignment.submission?.marks && (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                {assignment.submission.marks}/{assignment.totalMarks}
                              </Badge>
                              <span className="text-xs text-green-600">
                                ({((assignment.submission.marks / assignment.totalMarks) * 100).toFixed(0)}%)
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            isGraded ? "default" :
                            isSubmitted ? "secondary" :
                            isOverdue ? "destructive" : "outline"
                          } className={
                            isGraded ? "bg-green-100 text-green-800 border-green-300" :
                            isSubmitted ? "bg-blue-100 text-blue-800 border-blue-300" : ""
                          }>
                            {isGraded ? "Graded" :
                             isSubmitted ? "Submitted" :
                             isOverdue ? "Overdue" : "Pending"}
                          </Badge>
                          {!isSubmitted && !isGraded && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span>My Classes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {classes.slice(0, 3).map((classItem) => (
                    <div key={classItem.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{classItem.name}</p>
                        <p className="text-xs text-muted-foreground">Teacher: {classItem.teacher.name}</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {classItem.assignments.length} assignments
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Join Class Tab */}
        {activeTab === "join" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Join a Class</h1>

            <Card className="bg-white border-gray-200 shadow-sm max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-green-500" />
                  <span>Enter Class Code</span>
                </CardTitle>
                <CardDescription>
                  Ask your teacher for the class code to join their class
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class Code</label>
                  <Input
                    value={joinClassCode}
                    onChange={(e) => setJoinClassCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code"
                    maxLength={6}
                    className="uppercase"
                  />
                </div>
                <Button
                  onClick={handleJoinClass}
                  disabled={joinLoading || !joinClassCode.trim()}
                  className="w-full"
                >
                  {joinLoading ? "Joining..." : "Join Class"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">All Assignments</h1>

            {assignments.length === 0 ? (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                    <p className="text-gray-500">Join a class to see assignments from your teachers.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {assignments.map((assignment) => {
                  const isOverdue = new Date(assignment.dueDate) < new Date()
                  const hasSubmission = assignment.submission
                  const isGraded = hasSubmission?.status === "graded"

                  return (
                    <Card key={assignment.id} className="bg-white border-gray-200 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {assignment.subject}
                              </Badge>
                            </div>

                            {assignment.description && (
                              <p className="text-gray-600 mb-3">{assignment.description}</p>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Teacher:</span>
                                <p className="font-medium">{assignment.class?.teacher.name}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Class:</span>
                                <p className="font-medium">{assignment.class?.name}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Total Marks:</span>
                                <p className="font-medium">{assignment.totalMarks}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Due Date:</span>
                                <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                  {new Date(assignment.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4 text-right">
                            {isGraded ? (
                              <div className="space-y-2">
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  Graded
                                </Badge>
                                <div className="text-lg font-bold text-green-600">
                                  {assignment.submission?.marks}/{assignment.totalMarks}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ({((assignment.submission?.marks || 0) / assignment.totalMarks * 100).toFixed(1)}%)
                                </div>
                              </div>
                            ) : hasSubmission ? (
                              <div className="space-y-2">
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                  Submitted
                                </Badge>
                                <div className="text-xs text-gray-500">
                                  Submitted on {new Date(hasSubmission.submittedAt).toLocaleDateString()}
                                </div>
                                <Button size="sm" variant="outline">
                                  View Submission
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Badge variant={isOverdue ? "destructive" : "secondary"}>
                                  {isOverdue ? "Overdue" : "Pending"}
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAssignmentForSubmission(assignment)
                                    setIsSubmissionModalOpen(true)
                                  }}
                                  disabled={isOverdue}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Submit Assignment
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isGraded && assignment.submission?.feedback && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-1">Teacher Feedback:</h4>
                            <p className="text-green-800 text-sm">{assignment.submission.feedback}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "classes" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-gray-600">Class details view coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Submit Assignment Modal */}
      <SubmitAssignmentModal
        isOpen={isSubmissionModalOpen}
        onClose={() => {
          setIsSubmissionModalOpen(false)
          setSelectedAssignmentForSubmission(null)
        }}
        assignment={selectedAssignmentForSubmission}
        onSuccess={() => {
          fetchStudentData() // Refresh data after submission
        }}
      />
    </div>
  )
}