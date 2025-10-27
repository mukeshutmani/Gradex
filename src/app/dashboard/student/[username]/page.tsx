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
  User,
  BarChart3,
  Star,
  ArrowLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye
} from "lucide-react"
import { SubmitAssignmentModal } from "@/components/assignments/submit-assignment-modal"
import { ViewAssignmentModal } from "@/components/assignments/view-assignment-modal"

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
    feedback?: string
  }
}

interface Submission {
  id: string
  content?: string
  fileUrl?: string
  submittedAt: string
  marks?: number
  feedback?: string
  status: string
  assignment: {
    id: string
    title: string
    subject: string
    totalMarks: number
    dueDate: string
    teacher: {
      name: string
      email: string
    }
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

export default function StudentDashboard({ params }: { params: { username: string } }) {
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
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [resultsActiveTab, setResultsActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"title" | "dueDate" | "subject" | "status">("dueDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedAssignmentForView, setSelectedAssignmentForView] = useState<Assignment | null>(null)

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

  // Fetch student's submissions
  const fetchSubmissions = async () => {
    if (!session?.user?.email) return

    try {
      const response = await fetch('/api/submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
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
      fetchSubmissions()
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
  const submittedAssignments = assignments.filter(a => a.submission).length
  const pendingAssignments = assignments.filter(a => !a.submission).length
  const overdueAssignments = assignments.filter(a =>
    new Date(a.dueDate) < new Date() && !a.submission
  ).length

  // Results stats
  const gradedSubmissions = submissions.filter(s => s.status === "graded" && s.marks !== null)
  const totalMarks = gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0)
  const totalPossible = gradedSubmissions.reduce((sum, s) => sum + s.assignment.totalMarks, 0)
  const averagePercentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0
  const bestGrade = gradedSubmissions.length > 0
    ? Math.max(...gradedSubmissions.map(s => ((s.marks || 0) / s.assignment.totalMarks) * 100))
    : 0

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-100 border-green-300"
    if (percentage >= 80) return "text-blue-600 bg-blue-100 border-blue-300"
    if (percentage >= 70) return "text-yellow-600 bg-yellow-100 border-yellow-300"
    if (percentage >= 60) return "text-orange-600 bg-orange-100 border-orange-300"
    return "text-red-600 bg-red-100 border-red-300"
  }

  const getGradeLetter = (percentage: number) => {
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

  // Filter and sort assignments
  const getFilteredAndSortedAssignments = () => {
    let filtered = assignments.filter(assignment => {
      const searchLower = searchQuery.toLowerCase()
      return (
        assignment.title.toLowerCase().includes(searchLower) ||
        assignment.subject.toLowerCase().includes(searchLower) ||
        (assignment.class?.name || '').toLowerCase().includes(searchLower) ||
        (assignment.class?.teacher?.name || '').toLowerCase().includes(searchLower)
      )
    })

    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "subject":
          comparison = a.subject.localeCompare(b.subject)
          break
        case "dueDate":
          // First prioritize by submission date (recently submitted first)
          if (a.submission?.submittedAt && b.submission?.submittedAt) {
            comparison = new Date(b.submission.submittedAt).getTime() - new Date(a.submission.submittedAt).getTime()
          } else if (a.submission?.submittedAt) {
            comparison = -1 // a has submission, put it first
          } else if (b.submission?.submittedAt) {
            comparison = 1 // b has submission, put it first
          } else {
            // Neither has submission, sort by due date
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          }
          break
        case "status":
          const getStatusValue = (assignment: Assignment) => {
            if (assignment.submission?.status === "graded") return 3
            if (assignment.submission) return 2
            if (new Date(assignment.dueDate) < new Date()) return 0
            return 1
          }
          comparison = getStatusValue(a) - getStatusValue(b)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }

  const handleSort = (column: "title" | "dueDate" | "subject" | "status") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <ClipboardCheck className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">Gradex Student</span>
            </div>
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
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: TrendingUp, color: "text-blue-500" },
              { id: "assignments", label: "Assignments", icon: BookOpen, color: "text-purple-500" },
              { id: "join", label: "Class Assignment", icon: Plus, color: "text-orange-500" },
              { id: "results", label: "View Results", icon: Award, color: "text-yellow-500" }
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
                <tab.icon className={`h-4 w-4 ${tab.color}`} />
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
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900">Total Assignments</CardTitle>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{totalAssignments}</div>
                  <p className="text-xs text-blue-600 mt-1">
                    Across all classes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-900">Submitted</CardTitle>
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">{submittedAssignments}</div>
                  <p className="text-xs text-green-600 mt-1">
                    Completed assignments
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-900">Pending</CardTitle>
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700">{pendingAssignments}</div>
                  <p className="text-xs text-orange-600 mt-1">
                    Need to submit
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-900">Overdue</CardTitle>
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-700">{overdueAssignments}</div>
                  <p className="text-xs text-red-600 mt-1">
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
                    const hasSubmission = assignment.submission
                    const isGraded = hasSubmission?.status === "graded"
                    const isOverdue = new Date(assignment.dueDate) < new Date() && !hasSubmission

                    return (
                      <div key={assignment.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">{assignment.subject}</p>
                          {isGraded && assignment.submission?.marks !== undefined && (
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
                            hasSubmission ? "secondary" :
                            isOverdue ? "destructive" : "outline"
                          } className={
                            isGraded ? "bg-green-100 text-green-800 border-green-300" :
                            hasSubmission ? "bg-blue-100 text-blue-800 border-blue-300" : ""
                          }>
                            {isGraded ? "Graded" :
                             hasSubmission ? "Submitted" :
                             isOverdue ? "Overdue" : "Pending"}
                          </Badge>
                          {!hasSubmission && (
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
                  Ask your teacher for the class code to submit your assignment
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
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">All Assignments</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

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
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[300px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("title")}
                            className="h-auto p-0 hover:bg-transparent font-semibold"
                          >
                            Title
                            {sortBy === "title" && (
                              sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                            )}
                            {sortBy !== "title" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("subject")}
                            className="h-auto p-0 hover:bg-transparent font-semibold"
                          >
                            Subject
                            {sortBy === "subject" && (
                              sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                            )}
                            {sortBy !== "subject" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                          </Button>
                        </TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead className="text-center">Total Marks</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("dueDate")}
                            className="h-auto p-0 hover:bg-transparent font-semibold"
                          >
                            Due Date
                            {sortBy === "dueDate" && (
                              sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                            )}
                            {sortBy !== "dueDate" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("status")}
                            className="h-auto p-0 hover:bg-transparent font-semibold"
                          >
                            Status
                            {sortBy === "status" && (
                              sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                            )}
                            {sortBy !== "status" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredAndSortedAssignments().map((assignment) => {
                        const hasSubmission = assignment.submission
                        const isGraded = hasSubmission?.status === "graded"
                        const isOverdue = new Date(assignment.dueDate) < new Date() && !hasSubmission

                        return (
                          <TableRow key={assignment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold text-gray-900">{assignment.title}</div>
                                {assignment.description && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{assignment.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {assignment.subject}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{assignment.class?.name || "N/A"}</TableCell>
                            <TableCell className="text-sm text-gray-600">{assignment.class?.teacher.name || "N/A"}</TableCell>
                            <TableCell className="text-center font-semibold">{assignment.totalMarks}</TableCell>
                            <TableCell>
                              <div className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {isGraded ? (
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  Graded
                                </Badge>
                              ) : hasSubmission ? (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                  Submitted
                                </Badge>
                              ) : (
                                <Badge variant={isOverdue ? "destructive" : "secondary"}>
                                  {isOverdue ? "Overdue" : "Pending"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {isGraded ? (
                                <div>
                                  <div className="font-bold text-green-600">
                                    {assignment.submission?.marks}/{assignment.totalMarks}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ({((assignment.submission?.marks || 0) / assignment.totalMarks * 100).toFixed(1)}%)
                                  </div>
                                </div>
                              ) : hasSubmission ? (
                                <div className="text-xs text-gray-500">Awaiting</div>
                              ) : (
                                <div className="text-xs text-gray-400">-</div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {!hasSubmission ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAssignmentForSubmission(assignment)
                                    setIsSubmissionModalOpen(true)
                                  }}
                                  className={isOverdue ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"}
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  {isOverdue ? "Submit Late" : "Submit"}
                                </Button>
                              ) : isGraded && assignment.submission?.feedback ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-200 text-green-700"
                                >
                                  View Feedback
                                </Button>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  {getFilteredAndSortedAssignments().length === 0 && (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                      <p className="text-gray-500">Try adjusting your search query.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && (
          <div className="space-y-6">
            {/* Results Sub-Tabs */}
            <div className="flex space-x-4 border-b">
              {[
                { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
                { id: "submissions", label: "All Submissions", icon: FileText, color: "text-green-500" },
                { id: "subjects", label: "By Subject", icon: BookOpen, color: "text-purple-500" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setResultsActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-all duration-300 ${
                    resultsActiveTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div className={`${resultsActiveTab === tab.id ? 'bg-primary/10 p-1.5 rounded-lg' : ''}`}>
                    <tab.icon className={`h-4 w-4 ${tab.color} ${resultsActiveTab === tab.id ? 'animate-pulse' : ''}`} />
                  </div>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {submissions.length === 0 ? (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                    <p className="text-gray-500">Submit some assignments to see your results here.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Overview Sub-Tab */}
                {resultsActiveTab === "overview" && (
                  <div className="space-y-6">
                    {/* Statistics Cards with Colorful Gradients */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group animate-fade-in">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-white">Overall Average</CardTitle>
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-12">
                            <TrendingUp className="h-5 w-5 text-white" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{averagePercentage.toFixed(1)}%</div>
                          <p className="text-xs text-blue-100 mt-1">
                            Grade: {getGradeLetter(averagePercentage)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-white">Best Grade</CardTitle>
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-12">
                            <Star className="h-5 w-5 text-white group-hover:animate-spin" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{bestGrade.toFixed(1)}%</div>
                          <p className="text-xs text-yellow-100 mt-1">
                            Grade: {getGradeLetter(bestGrade)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-white">Total Submissions</CardTitle>
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-12">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{submissions.length}</div>
                          <p className="text-xs text-green-100 mt-1">
                            {gradedSubmissions.length} graded
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-white">Points Earned</CardTitle>
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-12">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{totalMarks}</div>
                          <p className="text-xs text-purple-100 mt-1">
                            out of {totalPossible} possible
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Performance Overview with Enhanced Design */}
                    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-gray-900">Performance Overview</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-6">
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                            <div className="flex justify-between text-sm mb-3">
                              <span className="font-semibold text-gray-700">Overall Progress</span>
                              <span className="font-bold text-indigo-600">{averagePercentage.toFixed(1)}%</span>
                            </div>
                            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${averagePercentage}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                              </div>
                            </div>
                          </div>

                          {gradedSubmissions.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 text-center hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <CheckCircle2 className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-green-600 mb-1">
                                  {gradedSubmissions.filter(s => ((s.marks || 0) / s.assignment.totalMarks) >= 0.8).length}
                                </div>
                                <div className="text-sm font-medium text-green-700">Assignments with 80%+</div>
                              </div>
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200 text-center hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                  {gradedSubmissions.filter(s => ((s.marks || 0) / s.assignment.totalMarks) >= 0.7).length}
                                </div>
                                <div className="text-sm font-medium text-blue-700">Assignments with 70%+</div>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 text-center hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Star className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-purple-600 mb-1">
                                  {gradedSubmissions.filter(s => ((s.marks || 0) / s.assignment.totalMarks) >= 0.6).length}
                                </div>
                                <div className="text-sm font-medium text-purple-700">Assignments with 60%+</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Combined Styles for Overview Tab */}
                <style jsx>{`
                  @keyframes fade-in {
                    from {
                      opacity: 0;
                      transform: translateY(20px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                  @keyframes shimmer {
                    0% {
                      transform: translateX(-100%);
                    }
                    100% {
                      transform: translateX(100%);
                    }
                  }
                  .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                  }
                  .animate-shimmer {
                    animation: shimmer 2s infinite;
                  }
                `}</style>

                {/* All Submissions Sub-Tab */}
                {resultsActiveTab === "submissions" && (
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-green-500" />
                        <span>All Submissions</span>
                      </CardTitle>
                      <CardDescription>
                        Your assignment submissions and grades
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {submissions.map((submission) => {
                          const percentage = submission.marks
                            ? (submission.marks / submission.assignment.totalMarks) * 100
                            : 0
                          const isGraded = submission.status === "graded"

                          return (
                            <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-semibold text-gray-900">{submission.assignment.title}</h3>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                      {submission.assignment.subject}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">Teacher:</span>
                                      <p>{submission.assignment.teacher.name}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Submitted:</span>
                                      <p className="text-indigo-600 font-semibold">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Status:</span>
                                      <Badge
                                        variant={isGraded ? "default" : "secondary"}
                                        className={`ml-1 ${isGraded ? 'bg-green-100 text-green-800 border-green-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}
                                      >
                                        {isGraded ? "Graded" : "Submitted"}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="ml-4 text-right">
                                  {isGraded ? (
                                    <div className="space-y-2">
                                      <div className={`px-3 py-1 rounded-lg border font-bold text-lg ${getGradeColor(percentage)}`}>
                                        {submission.marks}/{submission.assignment.totalMarks}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {percentage.toFixed(1)}% ({getGradeLetter(percentage)})
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <Badge className="bg-blue-100 text-blue-800">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {isGraded && submission.feedback && (
                                <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                      <Award className="h-5 w-5 text-white" />
                                    </div>
                                    <h4 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-base">
                                      AI Feedback
                                    </h4>
                                  </div>
                                  <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed pl-10">{submission.feedback}</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* By Subject Sub-Tab */}
                {resultsActiveTab === "subjects" && (
                  <div className="space-y-6">
                    {(() => {
                      // Group submissions by subject
                      const subjectGroups = submissions.reduce((acc, submission) => {
                        const subject = submission.assignment.subject
                        if (!acc[subject]) {
                          acc[subject] = []
                        }
                        acc[subject].push(submission)
                        return acc
                      }, {} as Record<string, Submission[]>)

                      return Object.entries(subjectGroups).map(([subject, subjectSubmissions]) => {
                        const gradedInSubject = subjectSubmissions.filter(s => s.status === "graded" && s.marks !== null)
                        const subjectTotal = gradedInSubject.reduce((sum, s) => sum + (s.marks || 0), 0)
                        const subjectPossible = gradedInSubject.reduce((sum, s) => sum + s.assignment.totalMarks, 0)
                        const subjectAverage = subjectPossible > 0 ? (subjectTotal / subjectPossible) * 100 : 0

                        return (
                          <Card key={subject} className="bg-white border-gray-200 shadow-sm">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-2">
                                  <BookOpen className="h-5 w-5 text-blue-500" />
                                  <span>{subject}</span>
                                </CardTitle>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-primary">
                                    {subjectAverage.toFixed(1)}%
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Grade: {getGradeLetter(subjectAverage)}
                                  </div>
                                </div>
                              </div>
                              <CardDescription>
                                {gradedInSubject.length} graded out of {subjectSubmissions.length} submissions
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {subjectSubmissions.map((submission) => {
                                  const percentage = submission.marks
                                    ? (submission.marks / submission.assignment.totalMarks) * 100
                                    : 0
                                  const isGraded = submission.status === "graded"

                                  return (
                                    <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">{submission.assignment.title}</h4>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                          <span>Teacher: {submission.assignment.teacher.name}</span>
                                          <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                      <div className="text-right ml-4">
                                        {isGraded ? (
                                          <div className="space-y-1">
                                            <div className={`px-3 py-1 rounded-lg border font-bold ${getGradeColor(percentage)}`}>
                                              {submission.marks}/{submission.assignment.totalMarks}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {percentage.toFixed(1)}% ({getGradeLetter(percentage)})
                                            </div>
                                          </div>
                                        ) : (
                                          <Badge className="bg-blue-100 text-blue-800">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Pending
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    })()}
                  </div>
                )}
              </>
            )}
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
          // Refresh both assignments and submissions data after grading
          fetchStudentData()
          fetchSubmissions()
        }}
      />

      {/* View Assignment Modal */}
      <ViewAssignmentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedAssignmentForView(null)
        }}
        assignment={selectedAssignmentForView}
      />
    </div>
  )
}
