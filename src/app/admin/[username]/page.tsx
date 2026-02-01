"use client"

import { useEffect, useState, use } from "react"
import { useSession, signOut } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import Link from "next/link"
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
import { PDFViewer } from "@/components/pdf-viewer"
import {
  ClipboardCheck,
  Upload,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Settings,
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
  X,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [isViewClassModalOpen, setIsViewClassModalOpen] = useState(false)
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false)
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
  const [isViewSubmissionModalOpen, setIsViewSubmissionModalOpen] = useState(false)
  const [isEditSubmissionModalOpen, setIsEditSubmissionModalOpen] = useState(false)
  const [showGradeSuccessModal, setShowGradeSuccessModal] = useState(false)
  const [gradeLoading, setGradeLoading] = useState(false)
  const { username } = use(params)

  // Fetch assignments from database
  const fetchAssignments = async (showLoader = true) => {
    if (!session?.user?.email) return

    if (showLoader && assignments.length === 0) {
      setLoading(true)
    }
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
                assignmentSubject: assignment.subject,
                assignmentTotalMarks: assignment.totalMarks
              })
            })
          }
        })
        setAllSubmissions(submissions)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch assignments:', response.status, errorData)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user profile from database
  const fetchUserProfile = async (showLoader = false) => {
    if (!session?.user?.email) return

    // Only show loading spinner on initial load or when explicitly requested
    if (showLoader) {
      setProfileLoading(true)
    }

    try {
      const response = await fetch('/api/user-profile')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
        setEditProfileData(data.user)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch user profile:', response.status, errorData)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      if (showLoader) {
        setProfileLoading(false)
      }
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
        setIsEditingProfile(false)

        // Refetch the profile data with loader to show updated data
        await fetchUserProfile(true)

        setShowSuccessModal(true)
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

    if (classes.length === 0) {
      setClassesLoading(true)
    }
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

  // Handle view class
  const handleViewClass = (classItem: any) => {
    setSelectedClass(classItem)
    setIsViewClassModalOpen(true)
  }

  // Handle edit class
  const handleEditClass = (classItem: any) => {
    setSelectedClass(classItem)
    setIsEditClassModalOpen(true)
  }

  // Handle view submission
  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission)
    setIsViewSubmissionModalOpen(true)
  }

  // Handle edit submission
  const handleEditSubmission = (submission: any) => {
    setSelectedSubmission(submission)
    setIsEditSubmissionModalOpen(true)
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
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role === "student") {
      router.push(`/dashboard/student/${session.user.username}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (session?.user?.email) {
      fetchAssignments()
      // Only show loader on initial load (when userProfile is null)
      fetchUserProfile(userProfile === null)
      fetchClasses()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email])

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <div className="animate-pulse">
          <img
            src="https://res.cloudinary.com/dolpat4s3/image/upload/v1766249987/Black_Green_Letter_G_Logo_wafmuu.svg"
            alt="Gradex Logo"
            width={64}
            height={64}
            className="h-16 w-16"
          />
        </div>
        <div className="mt-6 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
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

  const sidebarNavItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "classes", label: "Classes", icon: GraduationCap },
    { id: "assignments", label: "Assignments", icon: BookOpen },
    { id: "submissions", label: "Submissions", icon: FileCheck },
    { id: "students", label: "Students", icon: Users },
    { id: "analytics", label: "Analytics", icon: Award },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-violet-50 border-r border-violet-200 transition-all duration-300 ${sidebarCollapsed ? 'w-[72px]' : 'w-60'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-violet-200">
          <Link href="/dashboard" className="flex items-center cursor-pointer">
            <img
              src="https://res.cloudinary.com/dolpat4s3/image/upload/v1766249987/Black_Green_Letter_G_Logo_wafmuu.svg"
              alt="Gradex Logo"
              className="h-10 w-auto"
            />
            {!sidebarCollapsed && <span className="ml-0 text-lg font-bold text-gray-900">Gradex</span>}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-violet-400 hover:text-violet-600 hover:bg-violet-100 transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-violet-200 text-black border-l-4 border-violet-600'
                  : 'text-black hover:bg-violet-100'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0 text-black" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-violet-200 p-3">
          <button
            onClick={() => setShowProfilePopup(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? session.user?.name || 'Profile' : undefined}
          >
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-gray-900 truncate">{session.user?.name || "Teacher"}</div>
                <div className="text-xs text-violet-600">Administrator</div>
              </div>
            )}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? 'Log out' : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-60'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <h1 className="text-lg font-semibold text-gray-900 capitalize">{activeTab}</h1>
        </header>

        <main className="px-6 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-violet-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Total Assignments</CardTitle>
                  <BookOpen className="h-4 w-4 text-black" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalAssignments}</div>
                  <p className="text-xs text-gray-600">
                    Total assignments created
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-violet-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Pending Reviews</CardTitle>
                  <Clock className="h-4 w-4 text-black" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{pendingSubmissions}</div>
                  <p className="text-xs text-gray-600">
                    Requires your attention
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-violet-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Average Grade</CardTitle>
                  <TrendingUp className="h-4 w-4 text-black" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{averageGrade.toFixed(1)}%</div>
                  <p className="text-xs text-gray-600">
                    Class average grade
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-violet-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-black" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
                  <p className="text-xs text-gray-600">
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
                        size="sm"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-2 bg-violet-600 text-white hover:bg-violet-200 border-none"
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

        {/* Classes Tab */}
        {activeTab === "classes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
              <Button onClick={() => setIsCreateClassModalOpen(true)} className="bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Class
              </Button>
            </div>

            <Card>
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
                              <div className="text-xs text-gray-500 mt-1">{classItem.description}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 font-mono">
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
                            <Badge
                              variant={classItem.isActive ? "default" : "outline"}
                              className={classItem.isActive ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" : "bg-red-100 text-red-800 border-red-300"}
                            >
                              {classItem.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {new Date(classItem.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewClass(classItem)}
                                className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClass(classItem)}
                                className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
                              >
                                <Edit className="h-4 w-4 mr-1" />
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
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                    <p className="text-gray-500 mb-4">Create your first class to start organizing students.</p>
                    <Button onClick={() => setIsCreateClassModalOpen(true)} className="bg-violet-600 hover:bg-violet-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Class
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
                                  className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
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

            {/* Search Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Search by student name, assignment, or subject..."
                    value={submissionSearchQuery}
                    onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submissions Table */}
            <Card>
              <CardContent>
                {loading && allSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-lg text-gray-500">Loading submissions...</div>
                  </div>
                ) : allSubmissions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Assignment Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Graded Marks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allSubmissions
                        .filter((submission) => {
                          const query = submissionSearchQuery.toLowerCase()
                          return (
                            (submission.student?.name || "").toLowerCase().includes(query) ||
                            (submission.assignmentTitle || "").toLowerCase().includes(query) ||
                            (submission.assignmentSubject || "").toLowerCase().includes(query)
                          )
                        })
                        .map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">
                              {submission.student?.name || submission.student?.username || "Unknown"}
                            </TableCell>
                            <TableCell>{submission.assignmentTitle}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{submission.assignmentSubject || "N/A"}</Badge>
                            </TableCell>
                            <TableCell>
                              {submission.status === "graded" ? (
                                <div className="font-semibold">
                                  {submission.marks}/{submission.assignmentTotalMarks}
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({((submission.marks / submission.assignmentTotalMarks) * 100).toFixed(1)}%)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not graded</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={submission.status === "graded" ? "default" : "outline"}
                                className={
                                  submission.status === "submitted" || submission.status === "pending"
                                    ? "text-orange-600 border-orange-600 bg-orange-100"
                                    : "bg-green-600"
                                }
                              >
                                {submission.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewSubmission(submission)}
                                  className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditSubmission(submission)}
                                  className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
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
                    <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                    <p className="text-gray-500">Student submissions will appear here once they start submitting assignments.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <Button
                onClick={() => setIsInviteStudentModalOpen(true)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Invite Students
              </Button>
            </div>

            <div className="space-y-4">
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
                              <TableCell className="font-medium">{student.username || "Unknown"}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-violet-50 text-violet-700">
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
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${settingsTab === tab.id
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
                    <Button onClick={handleEditProfile} className="bg-violet-600 hover:bg-violet-700">
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

                {profileLoading ? (
                  <Card className="bg-white border-gray-200 shadow-sm col-span-full">
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                          <div className="text-lg text-gray-600 font-medium">Loading profile...</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : userProfile?.profile ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Information */}
                    <Card className="bg-white border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-gray-800">
                          <User className="h-5 w-5 text-violet-500" />
                          <span>User Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Name</label>
                          {isEditingProfile ? (
                            <Input
                              value={editProfileData?.name || ''}
                              onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
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
                                profile: { ...editProfileData.profile, institutionType: e.target.value }
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
                                profile: { ...editProfileData.profile, institutionName: e.target.value }
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
                                profile: { ...editProfileData.profile, studentCount: e.target.value }
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
                                profile: { ...editProfileData.profile, subjects: e.target.value }
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
                                profile: { ...editProfileData.profile, experience: e.target.value }
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
                          <Award className="h-5 w-5 text-violet-500" />
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
                                profile: { ...editProfileData.profile, plan: value }
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
                            <Select
                              value={editProfileData?.profile?.paymentMethod || ''}
                              onValueChange={(value) => setEditProfileData({
                                ...editProfileData,
                                profile: { ...editProfileData.profile, paymentMethod: value }
                              })}
                            >
                              <SelectTrigger className="border-gray-300 focus:border-gray-500">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easypaisa">Easypaisa</SelectItem>
                                <SelectItem value="jazzcash">JazzCash</SelectItem>
                                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                                <SelectItem value="debit-card">Debit Card</SelectItem>
                                <SelectItem value="credit-card">Credit Card</SelectItem>
                                <SelectItem value="raast">Raast</SelectItem>
                              </SelectContent>
                            </Select>
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
                                  className={classItem.isActive ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}>
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
                        <Button onClick={() => setIsCreateClassModalOpen(true)} className="bg-violet-600 hover:bg-violet-700">
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
      </div>

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

      {/* View Class Modal */}
      {isViewClassModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Class Details</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsViewClassModalOpen(false)
                  setSelectedClass(null)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Class Name</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{selectedClass.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">{selectedClass.description || 'No description'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Class Code</label>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 font-mono text-lg">
                    {selectedClass.classCode}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Number of Students</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedClass.studentCount || 0}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge variant={selectedClass.isActive ? "default" : "outline"}
                      className={selectedClass.isActive ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}>
                      {selectedClass.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Created Date</label>
                <p className="text-gray-900 mt-1">{new Date(selectedClass.createdAt).toLocaleDateString()}</p>
              </div>

              {selectedClass.enrollments && selectedClass.enrollments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Enrolled Students</label>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {selectedClass.enrollments.map((enrollment: any, index: number) => (
                      <div key={enrollment.student.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="text-sm text-gray-900">{enrollment.student.name || enrollment.student.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => {
                  setIsViewClassModalOpen(false)
                  setSelectedClass(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditClassModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Class</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditClassModalOpen(false)
                  setSelectedClass(null)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Class Name</label>
                <Input
                  value={selectedClass.name}
                  onChange={(e) => setSelectedClass({ ...selectedClass, name: e.target.value })}
                  placeholder="Enter class name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <Textarea
                  value={selectedClass.description || ''}
                  onChange={(e) => setSelectedClass({ ...selectedClass, description: e.target.value })}
                  placeholder="Enter class description"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select
                  value={selectedClass.isActive ? "active" : "inactive"}
                  onValueChange={(value) => setSelectedClass({ ...selectedClass, isActive: value === "active" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditClassModalOpen(false)
                  setSelectedClass(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/classes', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: selectedClass.id,
                        name: selectedClass.name,
                        description: selectedClass.description,
                        isActive: selectedClass.isActive,
                      }),
                    })
                    if (response.ok) {
                      fetchClasses()
                      setIsEditClassModalOpen(false)
                      setSelectedClass(null)
                    } else {
                      const data = await response.json()
                      console.error('Failed to update class:', data.error)
                    }
                  } catch (error) {
                    console.error('Error updating class:', error)
                  }
                }}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Popup Modal */}
      {showProfilePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProfilePopup(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Profile</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfilePopup(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mb-3">
                <User className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">{session.user?.name || "Teacher"}</h4>
              <p className="text-sm text-gray-500">{session.user?.email}</p>
              <Badge className="mt-2 bg-violet-100 text-violet-700 border-violet-200">Administrator</Badge>
            </div>

            {userProfile?.profile && (
              <div className="space-y-3 border-t border-gray-200 pt-4">
                {userProfile.profile.institutionName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Institution</span>
                    <span className="text-gray-900 font-medium">{userProfile.profile.institutionName}</span>
                  </div>
                )}
                {userProfile.profile.institutionType && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-900 font-medium capitalize">{userProfile.profile.institutionType}</span>
                  </div>
                )}
                {userProfile.profile.subjects && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subjects</span>
                    <span className="text-gray-900 font-medium">{userProfile.profile.subjects}</span>
                  </div>
                )}
                {userProfile.profile.experience && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Experience</span>
                    <span className="text-gray-900 font-medium">{userProfile.profile.experience}</span>
                  </div>
                )}
                {userProfile.profile.plan && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Plan</span>
                    <span className="text-gray-900 font-medium capitalize">{userProfile.profile.plan}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={() => {
                  setShowProfilePopup(false)
                  setActiveTab("settings")
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Save Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-green-500 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Profile Updated!</h3>
              <p className="text-gray-700 mb-6">
                Your profile has been saved successfully.
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="bg-green-600 text-white hover:bg-green-700 px-8"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Submission Modal */}
      {isViewSubmissionModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Submission Details</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsViewSubmissionModalOpen(false)
                  setSelectedSubmission(null)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Student Name</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedSubmission.student?.name || selectedSubmission.student?.username || "Unknown"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Student Email</label>
                  <p className="text-gray-900 mt-1">{selectedSubmission.student?.email || "N/A"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Assignment</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{selectedSubmission.assignmentTitle}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Subject</label>
                <div className="mt-1">
                  <Badge variant="outline">{selectedSubmission.assignmentSubject || "N/A"}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted At</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge
                      variant={selectedSubmission.status === "graded" ? "default" : "outline"}
                      className={
                        selectedSubmission.status === "submitted" || selectedSubmission.status === "pending"
                          ? "text-orange-600 border-orange-600 bg-orange-100"
                          : "bg-green-600"
                      }
                    >
                      {selectedSubmission.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedSubmission.status === "graded" && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Marks</label>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {selectedSubmission.marks}/{selectedSubmission.assignmentTotalMarks}
                    <span className="text-sm text-gray-600 ml-2">
                      ({((selectedSubmission.marks / selectedSubmission.assignmentTotalMarks) * 100).toFixed(1)}%)
                    </span>
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Submission Content</label>
                {selectedSubmission.content ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.content}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No text content submitted</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Attached File</label>
                {selectedSubmission.fileUrl ? (
                  <div className="space-y-3">
                    {/* File Preview */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      {selectedSubmission.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        // Image preview
                        <img
                          src={selectedSubmission.fileUrl}
                          alt="Submitted file"
                          className="w-full max-h-96 object-contain bg-gray-50"
                        />
                      ) : selectedSubmission.fileUrl.match(/\.pdf$/i) || selectedSubmission.fileUrl.includes('pdf') ? (
                        // PDF preview - Using react-pdf viewer
                        <PDFViewer fileUrl={selectedSubmission.fileUrl} />
                      ) : (
                        // Other files - show link
                        <div className="p-8 bg-gray-50 text-center">
                          <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">File attached</p>
                        </div>
                      )}
                    </div>

                    {/* Download button only - PDF already visible above */}
                    <div className="flex justify-center">
                      <a
                        href={selectedSubmission.fileUrl}
                        download
                        className="inline-flex items-center px-6 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 hover:bg-green-100 hover:border-green-300 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No file attached</p>
                )}
              </div>

              {selectedSubmission.feedback && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Feedback</label>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-gray-900">{selectedSubmission.feedback}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => {
                  setIsViewSubmissionModalOpen(false)
                  setSelectedSubmission(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Submission Modal */}
      {isEditSubmissionModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Grade Submission</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditSubmissionModalOpen(false)
                  setSelectedSubmission(null)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Student</label>
                <p className="text-gray-900 font-semibold">
                  {selectedSubmission.student?.name || selectedSubmission.student?.username || "Unknown"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Assignment</label>
                <p className="text-gray-900">{selectedSubmission.assignmentTitle}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Marks (Out of {selectedSubmission.assignmentTotalMarks})
                </label>
                <Input
                  type="number"
                  min="0"
                  max={selectedSubmission.assignmentTotalMarks}
                  value={selectedSubmission.marks ?? ''}
                  onChange={(e) => setSelectedSubmission({
                    ...selectedSubmission,
                    marks: e.target.value === '' ? null : parseInt(e.target.value)
                  })}
                  placeholder="Enter marks"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Feedback</label>
                <Textarea
                  value={selectedSubmission.feedback || ''}
                  onChange={(e) => setSelectedSubmission({
                    ...selectedSubmission,
                    feedback: e.target.value
                  })}
                  placeholder="Enter feedback for the student"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select
                  value={selectedSubmission.status}
                  onValueChange={(value) => setSelectedSubmission({
                    ...selectedSubmission,
                    status: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditSubmissionModalOpen(false)
                  setSelectedSubmission(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  // Validate marks is provided
                  if (selectedSubmission.marks === null || selectedSubmission.marks === undefined || selectedSubmission.marks === '') {
                    alert('Please enter marks before saving')
                    return
                  }

                  setGradeLoading(true)
                  try {
                    const response = await fetch('/api/submissions/grade', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        submissionId: selectedSubmission.id,
                        marks: selectedSubmission.marks,
                        feedback: selectedSubmission.feedback || '',
                        status: selectedSubmission.status
                      }),
                    })

                    if (response.ok) {
                      // Refresh submissions data
                      await fetchAssignments()
                      setIsEditSubmissionModalOpen(false)
                      setSelectedSubmission(null)
                      setShowGradeSuccessModal(true)
                    } else {
                      const errorData = await response.json()
                      alert(`Failed to grade submission: ${errorData.error}`)
                    }
                  } catch (error) {
                    console.error('Error grading submission:', error)
                    alert('Failed to grade submission. Please try again.')
                  } finally {
                    setGradeLoading(false)
                  }
                }}
                disabled={gradeLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {gradeLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Grade'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Success Modal */}
      {showGradeSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-green-500 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Graded Successfully!</h3>
              <p className="text-gray-700 mb-6">
                The submission has been graded and saved successfully.
              </p>
              <Button
                onClick={() => setShowGradeSuccessModal(false)}
                className="bg-green-600 text-white hover:bg-green-700 px-8"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}