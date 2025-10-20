"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Clock,
  BarChart3,
  Target,
  Star,
  ArrowLeft
} from "lucide-react"

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

export default function StudentResults() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch student's submissions
  const fetchSubmissions = async () => {
    if (!session?.user?.email) return

    setLoading(true)
    try {
      const response = await fetch('/api/submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  useEffect(() => {
    if (session?.user?.email) {
      fetchSubmissions()
    }
  }, [session])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading results...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Calculate statistics
  const gradedSubmissions = submissions.filter(s => s.status === "graded" && s.marks !== null)
  const totalMarks = gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0)
  const totalPossible = gradedSubmissions.reduce((sum, s) => sum + s.assignment.totalMarks, 0)
  const averagePercentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0

  const recentSubmissions = submissions.slice(0, 5)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/dashboard/student/${session.user.id}`)}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center">
                <ClipboardCheck className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-gray-900">My Results</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{session.user?.name || "Student"}</div>
                <div className="text-gray-500">Results Dashboard</div>
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
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "submissions", label: "All Submissions", icon: FileText },
              { id: "subjects", label: "By Subject", icon: BookOpen }
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
        {submissions.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-500">Submit some assignments to see your results here.</p>
                <Button
                  onClick={() => router.push(`/dashboard/student/${session.user.id}`)}
                  className="mt-4"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averagePercentage.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Grade: {getGradeLetter(averagePercentage)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Best Grade</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bestGrade.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Grade: {getGradeLetter(bestGrade)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <FileText className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{submissions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {gradedSubmissions.length} graded
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMarks}</div>
                  <p className="text-xs text-muted-foreground">
                    out of {totalPossible} possible
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{averagePercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={averagePercentage} className="h-2" />
                  </div>

                  {gradedSubmissions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {gradedSubmissions.filter(s => ((s.marks || 0) / s.assignment.totalMarks) >= 0.8).length}
                        </div>
                        <div className="text-sm text-gray-600">Assignments with 80%+</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {gradedSubmissions.filter(s => ((s.marks || 0) / s.assignment.totalMarks) >= 0.7).length}
                        </div>
                        <div className="text-sm text-gray-600">Assignments with 70%+</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {gradedSubmissions.filter(s => ((s.marks || 0) / s.assignment.totalMarks) >= 0.6).length}
                        </div>
                        <div className="text-sm text-gray-600">Assignments with 60%+</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
              </div>
            )}

            {/* All Submissions Tab */}
            {activeTab === "submissions" && (
              <div className="space-y-6">
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
                                <p>{new Date(submission.submittedAt).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>
                                <Badge variant={isGraded ? "default" : "secondary"} className="ml-1">
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
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                            <h4 className="font-medium text-gray-900 mb-2">
                              <Award className="h-4 w-4 inline mr-1" />
                              AI Feedback:
                            </h4>
                            <p className="text-gray-700 text-sm whitespace-pre-line">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
              </div>
            )}

            {/* By Subject Tab */}
            {activeTab === "subjects" && (
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
      </main>
    </div>
  )
}