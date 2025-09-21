"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ClipboardCheck,
  Upload,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  Bell,
  Award,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  GraduationCap,
  Plus,
  Eye,
  Edit,
  Download
} from "lucide-react"

// Mock data for demonstration
const mockAssignments = [
  {
    id: 1,
    name: "Mathematics Quiz - Chapter 5",
    subject: "Mathematics",
    totalMarks: 100,
    submissions: 25,
    totalStudents: 30,
    dueDate: "2024-01-25",
    status: "active",
    averageScore: 78
  },
  {
    id: 2,
    name: "Science Lab Report",
    subject: "Science",
    totalMarks: 50,
    submissions: 28,
    totalStudents: 30,
    dueDate: "2024-01-20",
    status: "completed",
    averageScore: 85
  },
  {
    id: 3,
    name: "English Essay Writing",
    subject: "English",
    totalMarks: 75,
    submissions: 15,
    totalStudents: 30,
    dueDate: "2024-01-28",
    status: "pending",
    averageScore: 0
  }
]

const mockStudentSubmissions = [
  {
    id: 1,
    studentName: "Ahmed Ali",
    assignment: "Mathematics Quiz - Chapter 5",
    submittedDate: "2024-01-24",
    marks: 85,
    totalMarks: 100,
    status: "graded",
    feedback: "Excellent work! Good understanding of concepts."
  },
  {
    id: 2,
    studentName: "Fatima Khan",
    assignment: "Science Lab Report",
    submittedDate: "2024-01-19",
    marks: 45,
    totalMarks: 50,
    status: "graded",
    feedback: "Well structured report with clear observations."
  },
  {
    id: 3,
    studentName: "Hassan Shah",
    assignment: "Mathematics Quiz - Chapter 5",
    submittedDate: "2024-01-24",
    marks: 0,
    totalMarks: 100,
    status: "pending",
    feedback: ""
  },
  {
    id: 4,
    studentName: "Zara Ahmed",
    assignment: "English Essay Writing",
    submittedDate: "2024-01-25",
    marks: 0,
    totalMarks: 75,
    status: "pending",
    feedback: ""
  }
]

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const pendingSubmissions = mockStudentSubmissions.filter(s => s.status === "pending").length
  const totalSubmissions = mockStudentSubmissions.length
  const averageGrade = mockStudentSubmissions
    .filter(s => s.status === "graded")
    .reduce((acc, s) => acc + (s.marks / s.totalMarks * 100), 0) /
    mockStudentSubmissions.filter(s => s.status === "graded").length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <ClipboardCheck className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-gray-900">Gradex Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {pendingSubmissions > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {pendingSubmissions}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{session.user?.name || "Teacher"}</div>
                  <div className="text-gray-500">Administrator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "assignments", label: "Assignments", icon: BookOpen },
              { id: "submissions", label: "Submissions", icon: FileCheck },
              { id: "students", label: "Students", icon: Users },
              { id: "analytics", label: "Analytics", icon: Award }
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAssignments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +1 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingSubmissions}</div>
                  <p className="text-xs text-muted-foreground">
                    Requires your attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageGrade.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">30</div>
                  <p className="text-xs text-muted-foreground">
                    Active students
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Assignments</CardTitle>
                  <CardDescription>Latest assignments and their progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAssignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{assignment.name}</p>
                        <p className="text-xs text-muted-foreground">{assignment.subject}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={assignment.status === "completed" ? "default" : assignment.status === "active" ? "secondary" : "outline"}>
                          {assignment.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {assignment.submissions}/{assignment.totalStudents} submitted
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Submissions</CardTitle>
                  <CardDescription>Assignments waiting for your review</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockStudentSubmissions.filter(s => s.status === "pending").map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{submission.studentName}</p>
                        <p className="text-xs text-muted-foreground">{submission.assignment}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Pending
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {submission.submittedDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </div>

            <div className="grid gap-6">
              {mockAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{assignment.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-2">
                          <span>Subject: {assignment.subject}</span>
                          <span>•</span>
                          <span>Total Marks: {assignment.totalMarks}</span>
                          <span>•</span>
                          <span>Due: {assignment.dueDate}</span>
                        </CardDescription>
                      </div>
                      <Badge variant={assignment.status === "completed" ? "default" : assignment.status === "active" ? "secondary" : "outline"}>
                        {assignment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Submission Progress</p>
                        <Progress value={(assignment.submissions / assignment.totalStudents) * 100} />
                        <p className="text-xs text-muted-foreground">
                          {assignment.submissions} of {assignment.totalStudents} students submitted
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Average Score</p>
                        <div className="text-2xl font-bold">{assignment.averageScore}%</div>
                        <p className="text-xs text-muted-foreground">
                          Class performance
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Student Submissions</h1>
              <div className="flex space-x-2">
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {pendingSubmissions} Pending Review
                </Badge>
                <Badge variant="default">
                  {mockStudentSubmissions.filter(s => s.status === "graded").length} Graded
                </Badge>
              </div>
            </div>

            <div className="grid gap-4">
              {mockStudentSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{submission.studentName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{submission.assignment}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Submitted: {submission.submittedDate}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <Badge variant={submission.status === "graded" ? "default" : "outline"}
                               className={submission.status === "pending" ? "text-orange-600 border-orange-600" : ""}>
                          {submission.status}
                        </Badge>
                        {submission.status === "graded" ? (
                          <div className="text-lg font-bold">
                            {submission.marks}/{submission.totalMarks}
                            <span className="text-sm text-gray-500 ml-1">
                              ({((submission.marks / submission.totalMarks) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ) : (
                          <Button size="sm">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Grade Now
                          </Button>
                        )}
                      </div>
                    </div>

                    {submission.feedback && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">{submission.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600">Student management features coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}