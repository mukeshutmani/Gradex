"use client"

import { useEffect, useState, use } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateAssignmentModal } from "@/components/assignments/create-assignment-modal"
import { EditAssignmentModal } from "@/components/assignments/edit-assignment-modal"
import { ViewAssignmentModal } from "@/components/assignments/view-assignment-modal"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { CreateClassModal } from "@/components/classes/create-class-modal"
import { InviteStudentModal } from "@/components/classes/invite-student-modal"
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
  Download,
  Trash2,
  Save,
  X
} from "lucide-react"

// Remove mock data - will use real data from database

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
  submissions?: Submission[]
}

interface Submission {
  id: string
  content?: string
  fileUrl?: string
  submittedAt: string
  marks?: number
  feedback?: string
  status: string
  assignmentId: string
  studentId: string
  student: {
    id: string
    name?: string
    email: string
    username?: string
  }
}

export default function AdminDashboard({ params }: { params: Promise<{ username: string }> }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editProfileData, setEditProfileData] = useState<any>(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [studentManagementTab, setStudentManagementTab] = useState("classes")
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false)
  const [isInviteStudentModalOpen, setIsInviteStudentModalOpen] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [classesLoading, setClassesLoading] = useState(false)
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [isDeleteClassDialogOpen, setIsDeleteClassDialogOpen] = useState(false)
  const [deleteClassLoading, setDeleteClassLoading] = useState(false)
  const [settingsTab, setSettingsTab] = useState("account")
  const [allSubmissions, setAllSubmissions] = useState<any[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])
  const { username } = use(params)

  // Fetch assignments from database
  const fetchAssignments = async () => {
    if (!session?.user?.email) return

    setLoading(true)
    try {
      const response = await fetch('/api/assignments')
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.assignments || [])

        // Extract all submissions from assignments
        const submissions: any[] = []
        data.assignments.forEach((assignment: Assignment) => {
          if (assignment.submissions) {
            assignment.submissions.forEach((submission) => {
              submissions.push({
                ...submission,
                assignmentTitle: assignment.title,
                assignmentTotalMarks: assignment.totalMarks
              })
            })
          }
        })
        setAllSubmissions(submissions)
      } else {
        console.error('Failed to fetch assignments')
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user profile from database
  const fetchUserProfile = async () => {
    if (!session?.user?.email) return

    setProfileLoading(true)
    try {
      const response = await fetch('/api/user-profile')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
        setEditProfileData(data.user)
      } else {
        console.error('Failed to fetch user profile')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditingProfile(true)
    setEditProfileData({ ...userProfile })
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setEditProfileData({ ...userProfile })
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!editProfileData?.profile) return

    setSaveLoading(true)
    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editProfileData.profile),
      })

      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.profile.user)
        setIsEditingProfile(false)
        alert('Profile updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to update profile: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaveLoading(false)
    }
  }

  // Fetch classes from database
  const fetchClasses = async () => {
    if (!session?.user?.email) return

    setClassesLoading(true)
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])

        // Extract all students from enrollments
        const students: any[] = []
        const studentMap = new Map() // To avoid duplicates

        data.classes.forEach((classItem: any) => {
          if (classItem.enrollments) {
            classItem.enrollments.forEach((enrollment: any) => {
              if (!studentMap.has(enrollment.student.id)) {
                studentMap.set(enrollment.student.id, {
                  ...enrollment.student,
                  className: classItem.name,
                  classCode: classItem.classCode,
                  enrolledAt: enrollment.enrolledAt,
                  status: 'active' // You can add logic to determine status
                })
              }
            })
          }
        })

        setAllStudents(Array.from(studentMap.values()))
      } else {
        console.error('Failed to fetch classes')
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setClassesLoading(false)
    }
  }

  // Handle delete class
  const handleDeleteClass = (classItem: any) => {
    setSelectedClass(classItem)
    setIsDeleteClassDialogOpen(true)
  }

  // Confirm delete class
  const confirmDeleteClass = async () => {
    if (!selectedClass) return

    setDeleteClassLoading(true)
    try {
      const response = await fetch(`/api/classes?id=${selectedClass.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh classes after successful deletion
        await fetchClasses()
        setIsDeleteClassDialogOpen(false)
        setSelectedClass(null)
      } else {
        const errorData = await response.json()
        console.error('Failed to delete class:', errorData.error)
      }
    } catch (error) {
      console.error('Error deleting class:', error)
    } finally {
      setDeleteClassLoading(false)
    }
  }

  // Handle view assignment
  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsViewModalOpen(true)
  }

  // Handle edit assignment
  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsEditModalOpen(true)
  }

  // Handle delete assignment
  const handleDeleteAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete assignment
  const confirmDeleteAssignment = async () => {
    if (!selectedAssignment) return

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/assignments?id=${selectedAssignment.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh assignments after successful deletion
        await fetchAssignments()
        setIsDeleteDialogOpen(false)
        setSelectedAssignment(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to delete assignment: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting assignment:', error)
      alert('Failed to delete assignment. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    } else if (status === "authenticated" && session?.user) {
      // Redirect students to student dashboard
      if (session.user.role === "student") {
        redirect(`/dashboard/student/${session.user.username}`)
      }
      // Clients stay on admin panel
    }
  }, [status, session])

  useEffect(() => {
    if (session?.user?.email) {
      fetchAssignments()
      fetchUserProfile()
      fetchClasses()
    }
  }, [session])

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

  // Calculate stats from real data
  const totalAssignments = assignments.length
  const totalSubmissions = assignments.reduce((acc, assignment) => acc + (assignment.submissions?.length || 0), 0)
  const pendingSubmissions = allSubmissions.filter(s => s.status === "submitted" || s.status === "pending").length
  const gradedSubmissions = allSubmissions.filter(s => s.status === "graded").length

  // Calculate average grade from all graded submissions
  const averageGrade = gradedSubmissions > 0 ?
    allSubmissions
      .filter(s => s.status === "graded" && s.marks !== null)
      .reduce((sum, s) => sum + ((s.marks || 0) / s.assignmentTotalMarks * 100), 0) / gradedSubmissions : 0

  // Calculate total students from classes
  const totalStudents = allStudents.length

  // Calculate total enrolled students across all classes
  const totalEnrollments = classes.reduce((acc, classItem) => acc + (classItem.studentCount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "assignments", label: "Assignments", icon: BookOpen },
              { id: "submissions", label: "Submissions", icon: FileCheck },
              { id: "students", label: "Students", icon: Users },
              { id: "analytics", label: "Analytics", icon: Award },
              { id: "settings", label: "Settings", icon: Settings }
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
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900">Total Assignments</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{totalAssignments}</div>
                  <p className="text-xs text-blue-700">
                    Total assignments created
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-900">Pending Reviews</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">{pendingSubmissions}</div>
                  <p className="text-xs text-orange-700">
                    Requires your attention
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-900">Average Grade</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">{averageGrade.toFixed(1)}%</div>
                  <p className="text-xs text-green-700">
                    Class average grade
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">{totalStudents}</div>
                  <p className="text-xs text-purple-700">
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
                  {loading && assignments.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-gray-500">Loading assignments...</div>
                    </div>
                  ) : assignments.length > 0 ? (
                    assignments.slice(0, 3).map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">{assignment.subject}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={new Date(assignment.dueDate) < new Date() ? "outline" : "secondary"}>
                            {new Date(assignment.dueDate) < new Date() ? "Past Due" : "Active"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {assignment.submissions?.length || 0} submitted
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No assignments created yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-2"
                      >
                        Create First Assignment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Submissions</CardTitle>
                  <CardDescription>Assignments waiting for your review</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {allSubmissions.filter(s => s.status === "submitted" || s.status === "pending").slice(0, 3).length > 0 ? (
                    allSubmissions.filter(s => s.status === "submitted" || s.status === "pending").slice(0, 3).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{submission.student?.name || "Unknown Student"}</p>
                          <p className="text-xs text-muted-foreground">{submission.assignmentTitle}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Pending
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No pending submissions</p>
                    </div>
                  )}
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
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </div>

            <Card>
              <CardContent>
                {loading && assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-lg text-gray-500">Loading assignments...</div>
                  </div>
                ) : assignments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => {
                        const isDuePassed = new Date(assignment.dueDate) < new Date()
                        const submissionCount = assignment.submissions?.length || 0

                        return (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">
                              <div className="font-semibold text-gray-900">{assignment.title}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{assignment.subject}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold">{assignment.totalMarks}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold">
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={isDuePassed ? "destructive" : "default"}
                                     className={isDuePassed ? "" : "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"}>
                                {isDuePassed ? "Past Due" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewAssignment(assignment)}
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditAssignment(assignment)}
                                  className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAssignment(assignment)}
                                  className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                    <p className="text-gray-500 mb-4">Create your first assignment to get started with grading.</p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Assignment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  {gradedSubmissions} Graded
                </Badge>
              </div>
            </div>

            <div className="grid gap-4">
              {loading && allSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <div className="text-lg text-gray-500">Loading submissions...</div>
                    </div>
                  </CardContent>
                </Card>
              ) : allSubmissions.length > 0 ? (
                allSubmissions.map((submission) => (
                  <Card
                    key={submission.id}
                    className={
                      submission.status === "graded"
                        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                        : "bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200"
                    }
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className={
                              submission.status === "graded"
                                ? "h-4 w-4 text-green-600"
                                : "h-4 w-4 text-orange-600"
                            } />
                            <span className="font-medium text-gray-900">{submission.student?.name || "Unknown Student"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className={
                              submission.status === "graded"
                                ? "h-4 w-4 text-green-600"
                                : "h-4 w-4 text-orange-600"
                            } />
                            <span className="text-sm text-gray-700">{submission.assignmentTitle}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className={
                              submission.status === "graded"
                                ? "h-4 w-4 text-green-600"
                                : "h-4 w-4 text-orange-600"
                            } />
                            <span className="text-sm text-gray-700">
                              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-6">
                          <Badge
                            variant={submission.status === "graded" ? "default" : "outline"}
                            className={submission.status === "submitted" || submission.status === "pending" ? "text-orange-600 border-orange-600 bg-orange-100" : "bg-green-600"}
                          >
                            {submission.status}
                          </Badge>
                          {submission.status === "graded" ? (
                            <div className="text-lg font-bold text-green-900">
                              {submission.marks}/{submission.assignmentTotalMarks}
                              <span className="text-sm text-green-700 ml-1">
                                ({((submission.marks / submission.assignmentTotalMarks) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          ) : (
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Grade Now
                            </Button>
                          )}
                        </div>
                      </div>

                      {submission.feedback && (
                        <div className={
                          submission.status === "graded"
                            ? "mt-4 p-3 bg-green-100 border border-green-200 rounded-md"
                            : "mt-4 p-3 bg-orange-100 border border-orange-200 rounded-md"
                        }>
                          <p className="text-sm text-gray-700">{submission.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                      <p className="text-gray-500">Student submissions will appear here once they start submitting assignments.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsCreateClassModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Class
                </Button>
                <Button
                  onClick={() => setIsInviteStudentModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Invite Students
                </Button>
              </div>
            </div>

            {/* Class Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>Total Students</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{totalStudents}</div>
                  <p className="text-sm text-gray-500">Active students</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800">
                    <GraduationCap className="h-5 w-5 text-green-500" />
                    <span>Active Classes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{classes.length}</div>
                  <p className="text-sm text-gray-500">Classes created</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800">
                    <Target className="h-5 w-5 text-purple-500" />
                    <span>Avg. Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{averageGrade.toFixed(1)}%</div>
                  <p className="text-sm text-gray-500">Class average</p>
                </CardContent>
              </Card>
            </div>

            {/* Classes and Students Tabs */}
            <div className="bg-white border-b">
              <div className="flex space-x-8">
                {[
                  { id: "classes", label: "Classes", icon: GraduationCap },
                  { id: "allStudents", label: "All Students", icon: Users }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStudentManagementTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      studentManagementTab === tab.id
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

            {/* Classes View */}
            {studentManagementTab === "classes" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Classes</h2>
                {classesLoading && classes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-lg text-gray-500">Loading classes...</div>
                  </div>
                ) : classes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((classItem) => (
                    <Card key={classItem.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-gray-800">{classItem.name}</span>
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">
                            {classItem.studentCount} students
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600">{classItem.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Class Code:</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {classItem.classCode}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Created: {classItem.createdAt}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              classItem.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {classItem.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                    <p className="text-gray-500 mb-4">Create your first class to start organizing students.</p>
                    <Button onClick={() => setIsCreateClassModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Class
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* All Students View */}
            {studentManagementTab === "allStudents" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">All Students</h2>
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent>
                    {classesLoading && allStudents.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-lg text-gray-500">Loading students...</div>
                      </div>
                    ) : allStudents.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.name || "Unknown"}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  {student.className}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(student.enrolledAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge variant={student.status === 'active' ? 'default' : 'outline'}>
                                  {student.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
                        <p className="text-gray-500 mb-4">Students will appear here once they join your classes.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
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

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            {/* Settings Sub-Tabs */}
            <div className="bg-white border-b rounded-t-lg">
              <div className="flex space-x-8 px-6">
                {[
                  { id: "account", label: "Account Settings", icon: User },
                  { id: "classes", label: "Class Management", icon: GraduationCap }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      settingsTab === tab.id
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

            {/* Account Settings Tab */}
            {settingsTab === "account" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                  {!isEditingProfile ? (
                    <Button onClick={handleEditProfile} className="bg-blue-600 hover:bg-blue-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saveLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saveLoading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {profileLoading && !userProfile ? (
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <div className="text-lg text-gray-500">Loading profile...</div>
                      </div>
                    </CardContent>
                  </Card>
                ) : userProfile?.profile ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Information */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                      <User className="h-5 w-5 text-blue-500" />
                      <span>User Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      {isEditingProfile ? (
                        <Input
                          value={editProfileData?.name || ''}
                          onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                          className="border-gray-300 focus:border-gray-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{userProfile.name || 'Not provided'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{userProfile.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <Badge variant="outline" className="capitalize bg-gray-100 text-gray-700 border-gray-300">
                        {userProfile.profile.role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Institution Information */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                      <GraduationCap className="h-5 w-5 text-green-500" />
                      <span>Institution Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Institution Type</label>
                      {isEditingProfile ? (
                        <Input
                          value={editProfileData?.profile?.institutionType || ''}
                          onChange={(e) => setEditProfileData({
                            ...editProfileData,
                            profile: {...editProfileData.profile, institutionType: e.target.value}
                          })}
                          className="border-gray-300 focus:border-gray-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{userProfile.profile.institutionType}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Institution Name</label>
                      {isEditingProfile ? (
                        <Input
                          value={editProfileData?.profile?.institutionName || ''}
                          onChange={(e) => setEditProfileData({
                            ...editProfileData,
                            profile: {...editProfileData.profile, institutionName: e.target.value}
                          })}
                          className="border-gray-300 focus:border-gray-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{userProfile.profile.institutionName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Student Count</label>
                      {isEditingProfile ? (
                        <Input
                          value={editProfileData?.profile?.studentCount || ''}
                          onChange={(e) => setEditProfileData({
                            ...editProfileData,
                            profile: {...editProfileData.profile, studentCount: e.target.value}
                          })}
                          className="border-gray-300 focus:border-gray-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{userProfile.profile.studentCount}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Teaching Information */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                      <BookOpen className="h-5 w-5 text-orange-500" />
                      <span>Teaching Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Subjects</label>
                      {isEditingProfile ? (
                        <Textarea
                          value={editProfileData?.profile?.subjects || ''}
                          onChange={(e) => setEditProfileData({
                            ...editProfileData,
                            profile: {...editProfileData.profile, subjects: e.target.value}
                          })}
                          className="border-gray-300 focus:border-gray-500"
                          rows={3}
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{userProfile.profile.subjects}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Experience</label>
                      {isEditingProfile ? (
                        <Input
                          value={editProfileData?.profile?.experience || ''}
                          onChange={(e) => setEditProfileData({
                            ...editProfileData,
                            profile: {...editProfileData.profile, experience: e.target.value}
                          })}
                          className="border-gray-300 focus:border-gray-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{userProfile.profile.experience}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Plan & Payment Information */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                      <Award className="h-5 w-5 text-purple-500" />
                      <span>Plan & Payment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Selected Plan</label>
                      {isEditingProfile ? (
                        <Select
                          value={editProfileData?.profile?.plan || ''}
                          onValueChange={(value) => setEditProfileData({
                            ...editProfileData,
                            profile: {...editProfileData.profile, plan: value}
                          })}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-gray-500">
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free Plan</SelectItem>
                            <SelectItem value="basic">Basic Plan</SelectItem>
                            <SelectItem value="premium">Premium Plan</SelectItem>
                            <SelectItem value="pro">Pro Plan</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border-2 border-gray-200">
                          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                          <span className="font-semibold text-gray-800 capitalize text-lg">{userProfile.profile.plan}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Payment Method</label>
                      {isEditingProfile ? (
                        <Input
                          value={editProfileData?.profile?.paymentMethod || ''}
                          onChange={(e) => setEditProfileData({
                            ...editProfileData,
                            profile: {...editProfileData.profile, paymentMethod: e.target.value}
                          })}
                          className="border-gray-300 focus:border-gray-500"
                          placeholder="Enter payment method"
                        />
                      ) : userProfile.profile.paymentMethod ? (
                        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border-2 border-gray-200">
                          <div className="w-8 h-6 bg-gray-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            $$
                          </div>
                          <span className="text-gray-900 capitalize font-medium">{userProfile.profile.paymentMethod}</span>
                        </div>
                      ) : (
                        <p className="text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">Not provided</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Onboarding Status</label>
                      <div className="flex items-center space-x-2">
                        {userProfile.profile.isOnboardingComplete ? (
                          <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg border-2 border-gray-300">
                            <CheckCircle2 className="h-4 w-4 text-gray-700" />
                            <span className="font-semibold text-gray-700">Completed</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border-2 border-gray-200">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold text-gray-600">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No profile data found</h3>
                        <p className="text-gray-500">Complete your profile setup to view settings.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Class Management Tab */}
            {settingsTab === "classes" && (
              <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Class Management</h2>
                <Button onClick={() => setIsCreateClassModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Class
                </Button>
              </div>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800">
                    <GraduationCap className="h-5 w-5 text-green-500" />
                    <span>Your Classes</span>
                  </CardTitle>
                  <CardDescription>Manage and delete your classes</CardDescription>
                </CardHeader>
                <CardContent>
                  {classesLoading && classes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-lg text-gray-500">Loading classes...</div>
                    </div>
                  ) : classes.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class Name</TableHead>
                          <TableHead>Class Code</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes.map((classItem) => (
                          <TableRow key={classItem.id}>
                            <TableCell className="font-medium">
                              <div className="font-semibold text-gray-900">{classItem.name}</div>
                              {classItem.description && (
                                <div className="text-xs text-gray-500">{classItem.description}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono">
                                {classItem.classCode}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold">{classItem.studentCount || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={classItem.isActive ? "default" : "outline"}
                                     className={classItem.isActive ? "bg-green-100 text-green-800 border-green-300" : ""}>
                                {classItem.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {new Date(classItem.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClass(classItem)}
                                  className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                      <p className="text-gray-500 mb-4">Create your first class to start organizing students.</p>
                      <Button onClick={() => setIsCreateClassModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Class
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // Refresh assignments after creating new one
          fetchAssignments()
        }}
      />

      {/* View Assignment Modal */}
      <ViewAssignmentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedAssignment(null)
        }}
        assignment={selectedAssignment}
      />

      {/* Edit Assignment Modal */}
      <EditAssignmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedAssignment(null)
        }}
        onSuccess={() => {
          // Refresh assignments after editing
          fetchAssignments()
        }}
        assignment={selectedAssignment}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedAssignment(null)
        }}
        onConfirm={confirmDeleteAssignment}
        title="Delete Assignment"
        description={`Are you sure you want to delete "${selectedAssignment?.title}"? This action cannot be undone and will also delete all related submissions.`}
        confirmText="Delete Assignment"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={isCreateClassModalOpen}
        onClose={() => setIsCreateClassModalOpen(false)}
        onSuccess={() => {
          // Refresh classes after creating new one
          fetchClasses()
        }}
      />

      {/* Invite Student Modal */}
      <InviteStudentModal
        isOpen={isInviteStudentModalOpen}
        onClose={() => setIsInviteStudentModalOpen(false)}
      />

      {/* Delete Class Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteClassDialogOpen}
        onClose={() => {
          setIsDeleteClassDialogOpen(false)
          setSelectedClass(null)
        }}
        onConfirm={confirmDeleteClass}
        title="Delete Class"
        description={`Are you sure you want to delete "${selectedClass?.name}"? This action cannot be undone and will remove all students from this class and delete all related assignments.`}
        confirmText="Delete Class"
        cancelText="Cancel"
        variant="danger"
        loading={deleteClassLoading}
      />
    </div>
  )
}