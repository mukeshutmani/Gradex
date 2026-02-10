"use client"

import React, { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
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
  Eye,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  Menu,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreVertical,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  AlertTriangle
} from "lucide-react"
import { SubmitAssignmentModal } from "@/components/assignments/submit-assignment-modal"
import { ViewAssignmentModal } from "@/components/assignments/view-assignment-modal"
import { FeedbackSections } from "@/components/feedback-section"

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
    attemptNumber?: number
    content?: string | null
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
  attemptNumber?: number
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

export default function StudentDashboard({ params }: { params: Promise<{ username: string }> }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [resolvedParams, setResolvedParams] = useState<{ username: string } | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [joinClassCode, setJoinClassCode] = useState("")
  const [joinLoading, setJoinLoading] = useState(false)
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)
  const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"title" | "dueDate" | "subject" | "status" | "submittedDate">("submittedDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedAssignmentForView, setSelectedAssignmentForView] = useState<Assignment | null>(null)
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false)
  const [selectedDescription, setSelectedDescription] = useState<{ title: string; description: string; imageUrl?: string } | null>(null)
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null)
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null)
  const [actionMenuPos, setActionMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [resubmitLimitPopup, setResubmitLimitPopup] = useState(false)
  const [resubmitting, setResubmitting] = useState(false)
  const [resubmitConfirm, setResubmitConfirm] = useState<{ submissionId: string; attemptNumber: number } | null>(null)

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

  // Handle resubmit - show confirmation popup
  const handleResubmit = (submissionId: string, attemptNumber: number) => {
    if (attemptNumber >= 2) {
      setResubmitLimitPopup(true)
      setOpenActionMenuId(null)
      return
    }
    setOpenActionMenuId(null)
    setResubmitConfirm({ submissionId, attemptNumber })
  }

  // Execute resubmit after confirmation
  const executeResubmit = async () => {
    if (!resubmitConfirm) return
    setResubmitting(true)
    setResubmitConfirm(null)
    try {
      const res = await fetch(`/api/submissions/${resubmitConfirm.submissionId}`, { method: "POST" })
      if (res.ok) {
        fetchStudentData()
        fetchSubmissions()
      } else {
        const data = await res.json()
        if (data.error?.includes("all 2")) {
          setResubmitLimitPopup(true)
        }
      }
    } catch {
      // silently fail
    } finally {
      setResubmitting(false)
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

  // Resolve async params (Next.js 15)
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  // Auth & authorization check
  useEffect(() => {
    if (status === "loading" || !resolvedParams) return

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user) {
      const loggedInUsername = session.user.username || session.user.email
      const urlUsername = resolvedParams.username

      // If user is not a student, redirect to their correct dashboard
      if (session.user.role !== "student") {
        router.replace(`/dashboard`)
        return
      }

      // If URL username doesn't match logged-in user, redirect to their own dashboard
      if (loggedInUsername !== urlUsername) {
        router.replace(`/dashboard/student/${loggedInUsername}`)
        return
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, resolvedParams])

  useEffect(() => {
    if (session?.user?.email) {
      fetchStudentData()
      fetchSubmissions()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email])

  if (status === "loading" || !resolvedParams) {
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
    if (percentage >= 80) return "text-violet-600 bg-violet-100 border-violet-300"
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
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    let filtered = assignments.filter(assignment => {
      // Hide assignments that expired more than 15 days ago AND have no submission
      const dueDate = new Date(assignment.dueDate)
      const isExpiredOver15Days = dueDate < fifteenDaysAgo
      const hasNoSubmission = !assignment.submission

      // If expired over 15 days and no submission, hide it
      if (isExpiredOver15Days && hasNoSubmission) {
        return false
      }

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
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case "submittedDate":
          // Pending (unsubmitted) assignments always show first (need attention), then by submission date
          if (a.submission?.submittedAt && b.submission?.submittedAt) {
            comparison = new Date(a.submission.submittedAt).getTime() - new Date(b.submission.submittedAt).getTime()
          } else if (a.submission?.submittedAt) {
            // b is pending, b should come first in desc
            comparison = -1
          } else if (b.submission?.submittedAt) {
            // a is pending, a should come first in desc
            comparison = 1
          } else {
            // Both pending — latest due date first
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

  const handleSort = (column: "title" | "dueDate" | "subject" | "status" | "submittedDate") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const sidebarNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "assignments", label: "Assignments", icon: BookOpen },
    { id: "join", label: "Join Class", icon: Plus },
    { id: "results", label: "Results", icon: Award },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-violet-50 border-r border-violet-200 transition-all duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-60'} w-60`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-violet-200">
          <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
            <img
              src="https://res.cloudinary.com/dolpat4s3/image/upload/v1766249987/Black_Green_Letter_G_Logo_wafmuu.svg"
              alt="Gradex Logo"
              className="h-10 w-auto"
            />
            {(!sidebarCollapsed || mobileMenuOpen) && <span className="ml-1 text-lg font-bold text-gray-900">Gradex</span>}
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-violet-400 hover:text-violet-600 hover:bg-violet-100 transition-colors cursor-pointer lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Collapse button on desktop */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-violet-400 hover:text-violet-600 hover:bg-violet-100 transition-colors cursor-pointer hidden lg:block"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-violet-200 text-black border-l-4 border-violet-600'
                  : 'text-black hover:bg-violet-100'
              } ${sidebarCollapsed && !mobileMenuOpen ? 'lg:justify-center' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${activeTab === item.id ? 'text-violet-600' : 'text-black'}`} />
              {(!sidebarCollapsed || mobileMenuOpen) && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-violet-200 p-3">
          <button
            onClick={() => {
              setShowProfilePopup(true)
              setMobileMenuOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer ${sidebarCollapsed && !mobileMenuOpen ? 'lg:justify-center' : ''}`}
            title={sidebarCollapsed ? session.user?.name || 'Profile' : undefined}
          >
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-gray-900 truncate">{session.user?.name || "Student"}</div>
                <div className="text-xs text-gray-500">Student</div>
              </div>
            )}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer ${sidebarCollapsed && !mobileMenuOpen ? 'lg:justify-center' : ''}`}
            title={sidebarCollapsed ? 'Log out' : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {(!sidebarCollapsed || mobileMenuOpen) && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-60'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 capitalize">
              {activeTab === "join" ? "Join Class" : activeTab}
            </h1>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {/* Total Assignments Card - Vertical Bar Chart */}
              <Card className="bg-white border-violet-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Total Assignments</CardTitle>
                  <BookOpen className="h-4 w-4 text-violet-500" />
                </CardHeader>
                <CardContent>
                  {(() => {
                    const maxVal = Math.max(totalAssignments, submittedAssignments, pendingAssignments, overdueAssignments, 1)
                    const bars = [
                      { label: "Total", value: totalAssignments, color: "#7c3aed" },
                      { label: "Submitted", value: submittedAssignments, color: "#22c55e" },
                      { label: "Pending", value: pendingAssignments, color: "#f97316" },
                      { label: "Overdue", value: overdueAssignments, color: "#ef4444" },
                    ]
                    return (
                      <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-gray-900 mb-2">{totalAssignments}</div>
                      <div className="flex items-end justify-center gap-4 h-24">
                        {bars.map((bar) => (
                          <div key={bar.label} className="flex flex-col items-center h-full">
                            <span className="text-[10px] font-semibold text-gray-600 mb-1">{bar.value}</span>
                            <div className="flex-1 w-5 bg-gray-100 rounded-sm relative flex flex-col justify-end overflow-hidden">
                              <div
                                className="w-full rounded-sm transition-all duration-500"
                                style={{ height: `${(bar.value / maxVal) * 100}%`, minHeight: bar.value > 0 ? '6px' : '0', backgroundColor: bar.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                        {bars.map((bar) => (
                          <div key={bar.label} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bar.color }} />
                            <span className="text-[9px] text-gray-500">{bar.label} ({bar.value})</span>
                          </div>
                        ))}
                      </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Submission Status Card - Pie Donut Chart */}
              <Card className="bg-white border-violet-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Submission Status</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {(() => {
                    const totalSubs = submittedAssignments + pendingAssignments
                    const submittedPct = totalSubs > 0 ? Math.round((submittedAssignments / totalSubs) * 100) : 0
                    const pendingPct = totalSubs > 0 ? Math.round((pendingAssignments / totalSubs) * 100) : 100
                    const outerR = 50
                    const innerR = 25

                    const getArcPath = (startAngle: number, endAngle: number, outer: number, inner: number) => {
                      const startRad = (startAngle - 90) * (Math.PI / 180)
                      const endRad = (endAngle - 90) * (Math.PI / 180)
                      const x1 = 60 + outer * Math.cos(startRad)
                      const y1 = 60 + outer * Math.sin(startRad)
                      const x2 = 60 + outer * Math.cos(endRad)
                      const y2 = 60 + outer * Math.sin(endRad)
                      const x3 = 60 + inner * Math.cos(endRad)
                      const y3 = 60 + inner * Math.sin(endRad)
                      const x4 = 60 + inner * Math.cos(startRad)
                      const y4 = 60 + inner * Math.sin(startRad)
                      const largeArc = endAngle - startAngle > 180 ? 1 : 0
                      return `M ${x1} ${y1} A ${outer} ${outer} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${largeArc} 0 ${x4} ${y4} Z`
                    }

                    const getLabelPos = (startAngle: number, endAngle: number, r: number) => {
                      const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180)
                      return { x: 60 + r * Math.cos(midAngle), y: 60 + r * Math.sin(midAngle) }
                    }

                    const segments = [
                      { label: `${submittedPct}%`, value: submittedAssignments, color: "#22c55e", name: "Submitted" },
                      { label: `${pendingPct}%`, value: pendingAssignments, color: "#f97316", name: "Pending" },
                    ]

                    let currentAngle = 0
                    const midR = (outerR + innerR) / 2

                    return (
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <svg width="140" height="140" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r={outerR} fill="#f3f4f6" />
                            <circle cx="60" cy="60" r={innerR} fill="white" />
                            {totalSubs > 0 ? (() => {
                              const fullSegment = segments.find(s => s.value === totalSubs)
                              if (fullSegment) {
                                return (
                                  <g>
                                    <circle cx="60" cy="60" r={outerR} fill={fullSegment.color} />
                                    <circle cx="60" cy="60" r={innerR} fill="white" />
                                    <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">
                                      100%
                                    </text>
                                  </g>
                                )
                              }
                              return segments.map((seg) => {
                                if (seg.value === 0) return null
                                const angle = (seg.value / totalSubs) * 360
                                const startAngle = currentAngle
                                const endAngle = currentAngle + angle
                                currentAngle = endAngle
                                const path = getArcPath(startAngle, endAngle, outerR, innerR)
                                const labelPos = getLabelPos(startAngle, endAngle, midR)
                                const showLabel = angle > 20

                                return (
                                  <g key={seg.name}>
                                    <path d={path} fill={seg.color} />
                                    {showLabel && (
                                      <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">
                                        {seg.label}
                                      </text>
                                    )}
                                  </g>
                                )
                              })
                            })() : (
                              <circle cx="60" cy="60" r={outerR} fill="#e5e7eb" />
                            )}
                            <circle cx="60" cy="60" r={innerR} fill="white" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-gray-900">{totalSubs}</span>
                            <span className="text-[9px] text-gray-400">Total</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                          {segments.map((seg) => (
                            <div key={seg.name} className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                              <span className="text-[9px] text-gray-500">{seg.name} ({seg.value})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Average Grade Card - Semi-circle Gauge */}
              <Card className="bg-white border-violet-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Average Grade</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {(() => {
                    const gradeColor = averagePercentage >= 80 ? "#22c55e" : averagePercentage >= 60 ? "#7c3aed" : averagePercentage >= 40 ? "#f97316" : "#ef4444"
                    const gradeLetter = averagePercentage >= 90 ? "A+" : averagePercentage >= 80 ? "A" : averagePercentage >= 70 ? "B" : averagePercentage >= 60 ? "C" : "D"
                    const radius = 45
                    const strokeW = 8
                    const halfCircumference = Math.PI * radius
                    const filledArc = (averagePercentage / 100) * halfCircumference

                    return (
                      <div className="flex flex-col items-center">
                        <div className="relative" style={{ width: '140px', height: '85px' }}>
                          <svg width="140" height="85" viewBox="0 0 120 70" overflow="visible">
                            <path
                              d={`M ${60 - radius} 60 A ${radius} ${radius} 0 0 1 ${60 + radius} 60`}
                              fill="none"
                              stroke="#f3f4f6"
                              strokeWidth={strokeW}
                              strokeLinecap="round"
                            />
                            <path
                              d={`M ${60 - radius} 60 A ${radius} ${radius} 0 0 1 ${60 + radius} 60`}
                              fill="none"
                              stroke={gradeColor}
                              strokeWidth={strokeW}
                              strokeLinecap="round"
                              strokeDasharray={`${filledArc} ${halfCircumference}`}
                            />
                          </svg>
                          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                            <span className="text-2xl font-bold text-gray-900">{averagePercentage.toFixed(1)}%</span>
                            <span className="text-[10px] text-gray-400">Average Grade</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-gray-100">
                          <div className="flex-1 border-l-2 pl-2" style={{ borderColor: gradeColor }}>
                            <div className="text-lg font-bold text-gray-900">{gradeLetter}</div>
                            <div className="text-[10px] text-gray-400">Grade Letter</div>
                          </div>
                          <div className="flex-1 border-l-2 border-gray-300 pl-2 text-right">
                            <div className="text-lg font-bold text-gray-900">{gradedSubmissions.length}</div>
                            <div className="text-[10px] text-gray-400">Graded</div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Best Grade & Classes Card */}
              <Card className="bg-white border-violet-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Performance</CardTitle>
                  <Star className="h-4 w-4 text-violet-500" />
                </CardHeader>
                <CardContent>
                  {(() => {
                    const bestColor = bestGrade >= 80 ? "#22c55e" : bestGrade >= 60 ? "#7c3aed" : bestGrade >= 40 ? "#f97316" : "#ef4444"
                    const radius = 40
                    const strokeWidth = 10
                    const circumference = 2 * Math.PI * radius
                    const filled = (bestGrade / 100) * circumference

                    return (
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
                            <circle cx="50" cy="50" r={radius} fill="none" stroke={bestColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={`${filled} ${circumference}`} strokeDashoffset={circumference / 4} transform="rotate(-90 50 50)" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-gray-900">{bestGrade.toFixed(0)}%</span>
                            <span className="text-[9px] text-gray-400">Best</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between w-full mt-2 pt-3 border-t border-gray-100">
                          <div className="flex-1 border-l-2 border-violet-400 pl-2">
                            <div className="text-lg font-bold text-gray-900">{classes.length}</div>
                            <div className="text-[10px] text-gray-400">Classes</div>
                          </div>
                          <div className="flex-1 border-l-2 border-gray-300 pl-2 text-right">
                            <div className="text-lg font-bold text-gray-900">{overdueAssignments}</div>
                            <div className="text-[10px] text-gray-400">Overdue</div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Recent Assignments and Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-violet-500" />
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
                            hasSubmission ? "bg-violet-100 text-violet-800 border-violet-300" : ""
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
                      <Badge variant="outline" className="bg-violet-50 text-violet-700">
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
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  fetchStudentData()
                  fetchSubmissions()
                }}
                disabled={loading}
                className="border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-violet-600 h-9 w-9 shrink-0"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
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
              <>
              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {getFilteredAndSortedAssignments().map((assignment) => {
                  const isResetSubmission = assignment.submission?.status === "pending" && !assignment.submission?.content
                  const hasSubmission = isResetSubmission ? null : assignment.submission
                  const isGraded = hasSubmission?.status === "graded"
                  const isOverdue = new Date(assignment.dueDate) < new Date() && !hasSubmission

                  return (
                    <Card key={assignment.id} className="bg-white border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 mr-3">
                            <h3 className="font-semibold text-gray-900 truncate">{assignment.title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{assignment.class?.name || "N/A"} &middot; {assignment.class?.teacher.name || "N/A"}</p>
                          </div>
                          {isGraded ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300 shrink-0">Graded</Badge>
                          ) : hasSubmission ? (
                            <Badge className="bg-violet-100 text-violet-800 border-violet-300 shrink-0">Submitted</Badge>
                          ) : (
                            <Badge variant={isOverdue ? "destructive" : "secondary"} className="shrink-0">
                              {isOverdue ? "Overdue" : "Pending"}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm mb-3">
                          <div className="flex items-center gap-4">
                            <span className={`${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                            <span className="text-gray-600">
                              Submitted: {hasSubmission ? new Date(assignment.submission!.submittedAt).toLocaleDateString() : "—"}
                            </span>
                            <span className="text-gray-600">Marks: {assignment.totalMarks}</span>
                          </div>
                          {isGraded && (
                            <div className={`font-bold ${
                              ((assignment.submission?.marks || 0) / assignment.totalMarks * 100) >= 80
                                ? 'text-green-600'
                                : ((assignment.submission?.marks || 0) / assignment.totalMarks * 100) >= 60
                                  ? 'text-violet-600'
                                  : 'text-red-600'
                            }`}>
                              {assignment.submission?.marks}/{assignment.totalMarks} ({((assignment.submission?.marks || 0) / assignment.totalMarks * 100).toFixed(0)}%)
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {(assignment.description || assignment.imageUrl) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDescription({
                                  title: assignment.title,
                                  description: assignment.description || "",
                                  imageUrl: assignment.imageUrl
                                })
                                setIsDescriptionModalOpen(true)
                              }}
                              className="text-violet-600 border-violet-200 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          )}
                          {!hasSubmission ? (
                            isOverdue ? (
                              <Button size="sm" variant="outline" disabled className="border-red-200 text-red-500 cursor-not-allowed opacity-70 text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Expired
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedAssignmentForSubmission(assignment)
                                  setIsSubmissionModalOpen(true)
                                }}
                                className="bg-white hover:bg-gray-100 text-black border border-gray-300 text-xs"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Submit
                              </Button>
                            )
                          ) : isGraded ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300 text-black hover:bg-gray-100 text-xs px-2 py-1 h-7"
                                onClick={() => {
                                  setSelectedDescription({
                                    title: `AI Feedback`,
                                    description: assignment.submission?.feedback || "No feedback provided yet."
                                  })
                                  setIsDescriptionModalOpen(true)
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Feedback
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-orange-200 text-orange-600 hover:bg-orange-50 text-xs px-2 py-1 h-7"
                                disabled={resubmitting}
                                onClick={() => {
                                  handleResubmit(
                                    assignment.submission!.id,
                                    assignment.submission!.attemptNumber || 1
                                  )
                                }}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Resubmit
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                              onClick={async () => {
                                if (!assignment.submission) return
                                try {
                                  await fetch(`/api/submissions/${assignment.submission.id}`, { method: "DELETE" })
                                  fetchStudentData()
                                  fetchSubmissions()
                                } catch (e) {
                                  console.error("Failed to delete submission:", e)
                                }
                              }}
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {getFilteredAndSortedAssignments().length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                    <p className="text-gray-500">Try adjusting your search query.</p>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <Card className="bg-white border-gray-200 shadow-sm hidden md:block">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[240px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("title")}
                            className="h-auto p-0 hover:bg-transparent font-semibold text-sm"
                          >
                            Title
                            {sortBy === "title" && (
                              sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                            )}
                            {sortBy !== "title" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center w-[40px] px-1">Desc</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Teacher</TableHead>
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
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("submittedDate")}
                            className="h-auto p-0 hover:bg-transparent font-semibold"
                          >
                            Submitted
                            {sortBy === "submittedDate" && (
                              sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                            )}
                            {sortBy !== "submittedDate" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
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
                        <TableHead className="text-center px-2">Marks</TableHead>
                        <TableHead className="text-center px-2">Score</TableHead>
                        <TableHead className="text-center px-2">%</TableHead>
                        <TableHead className="text-center px-2 w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredAndSortedAssignments().map((assignment) => {
                        // A reset submission (pending + no content) is treated as "no submission"
                        const isResetSubmission = assignment.submission?.status === "pending" && !assignment.submission?.content
                        const hasSubmission = isResetSubmission ? null : assignment.submission
                        const isGraded = hasSubmission?.status === "graded"
                        const isOverdue = new Date(assignment.dueDate) < new Date() && !hasSubmission

                        const matchedSubmission = submissions.find(s => s.assignment.id === assignment.id)

                        return (
                          <TableRow key={assignment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <div className="font-semibold text-gray-900 text-sm">
                                {assignment.title.length > 30 ? (
                                  <>
                                    {assignment.title.slice(0, 30)}...
                                    <button
                                      onClick={() => {
                                        setSelectedDescription({
                                          title: "Assignment Title",
                                          description: assignment.title
                                        })
                                        setIsDescriptionModalOpen(true)
                                      }}
                                      className="text-gray-900 hover:text-gray-700 text-xs font-normal ml-1"
                                    >
                                      see more
                                    </button>
                                  </>
                                ) : (
                                  assignment.title
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center px-1">
                              {assignment.description || assignment.imageUrl ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedDescription({
                                      title: assignment.title,
                                      description: assignment.description || "",
                                      imageUrl: assignment.imageUrl
                                    })
                                    setIsDescriptionModalOpen(true)
                                  }}
                                  className="text-gray-900 hover:text-gray-700 hover:bg-gray-100 h-7 w-7"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              ) : (
                                <span className="text-gray-300">
                                  <Eye className="h-4 w-4 inline" />
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{assignment.class?.name || "N/A"}</TableCell>
                            <TableCell className="text-sm text-gray-600">{assignment.class?.teacher.name || "N/A"}</TableCell>
                            <TableCell>
                              <div className={`text-sm whitespace-nowrap ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {hasSubmission ? (
                                <div className="text-sm text-gray-900 whitespace-nowrap">
                                  {new Date(assignment.submission!.submittedAt).toLocaleDateString()}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {isGraded ? (
                                <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                  Graded
                                </Badge>
                              ) : hasSubmission ? (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                                  Not Graded
                                </Badge>
                              ) : (
                                <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-xs">
                                  {isOverdue ? "Overdue" : "Pending"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center text-sm font-semibold">{assignment.totalMarks}</TableCell>
                            <TableCell className="text-center">
                              {isGraded ? (
                                <span className={`font-bold text-sm ${
                                  ((assignment.submission?.marks || 0) / assignment.totalMarks * 100) >= 80
                                    ? 'text-green-600'
                                    : ((assignment.submission?.marks || 0) / assignment.totalMarks * 100) >= 60
                                      ? 'text-violet-600'
                                      : ((assignment.submission?.marks || 0) / assignment.totalMarks * 100) >= 40
                                        ? 'text-orange-600'
                                        : 'text-red-600'
                                }`}>
                                  {assignment.submission?.marks}
                                </span>
                              ) : hasSubmission ? (
                                <span className="text-sm text-orange-600 font-medium">—</span>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {isGraded ? (
                                <Badge variant="outline" className={`text-xs ${
                                  ((assignment.submission?.marks || 0) / assignment.totalMarks * 100) >= 80
                                    ? 'bg-green-50 text-green-700 border-green-300'
                                    : ((assignment.submission?.marks || 0) / assignment.totalMarks * 100) >= 60
                                      ? 'bg-violet-50 text-violet-700 border-violet-300'
                                      : ((assignment.submission?.marks || 0) / assignment.totalMarks * 100) >= 40
                                        ? 'bg-orange-50 text-orange-700 border-orange-300'
                                        : 'bg-red-50 text-red-700 border-red-300'
                                }`}>
                                  {((assignment.submission?.marks || 0) / assignment.totalMarks * 100).toFixed(0)}%
                                </Badge>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center px-2 relative">
                              {!hasSubmission ? (
                                isOverdue ? (
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    disabled
                                    className="border-red-200 text-red-500 cursor-not-allowed opacity-70 h-7 w-7"
                                    title="Expired"
                                  >
                                    <AlertCircle className="h-3.5 w-3.5" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="icon"
                                    onClick={() => {
                                      setSelectedAssignmentForSubmission(assignment)
                                      setIsSubmissionModalOpen(true)
                                    }}
                                    className="bg-white hover:bg-gray-100 text-black border border-gray-300 h-7 w-7"
                                    title="Submit"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                  </Button>
                                )
                              ) : (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-gray-600 hover:bg-gray-100"
                                  onClick={(e) => {
                                    if (openActionMenuId === assignment.id) {
                                      setOpenActionMenuId(null)
                                    } else {
                                      const rect = e.currentTarget.getBoundingClientRect()
                                      setActionMenuPos({ top: rect.bottom + 4, left: rect.right - 160 })
                                      setOpenActionMenuId(assignment.id)
                                    }
                                  }}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
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

              {/* Action menu portal - rendered outside table to avoid scrollbar */}
              {openActionMenuId && (() => {
                const assignment = getFilteredAndSortedAssignments().find(a => a.id === openActionMenuId)
                const matchedSub = submissions.find(s => s.assignment.id === openActionMenuId)
                if (!assignment) return null
                return (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenActionMenuId(null)} />
                    <div
                      className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px]"
                      style={{ top: actionMenuPos.top, left: actionMenuPos.left }}
                    >
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setSelectedDescription({
                            title: `AI Feedback`,
                            description: assignment.submission?.feedback || "No feedback provided yet."
                          })
                          setIsDescriptionModalOpen(true)
                          setOpenActionMenuId(null)
                        }}
                      >
                        <MessageSquare className="h-4 w-4 text-violet-600" />
                        View Feedback
                      </button>
                      {matchedSub?.fileUrl && (
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => {
                            window.open(matchedSub.fileUrl, "_blank")
                            setOpenActionMenuId(null)
                          }}
                        >
                          <ExternalLink className="h-4 w-4 text-violet-600" />
                          View Assignment
                        </button>
                      )}
                      {assignment.submission && assignment.submission.status === "submitted" && (
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                          disabled={resubmitting}
                          onClick={async () => {
                            setResubmitting(true)
                            setOpenActionMenuId(null)
                            try {
                              await fetch(`/api/submissions/${assignment.submission!.id}`, { method: "DELETE" })
                              await fetchStudentData()
                              await fetchSubmissions()
                              setSelectedAssignmentForSubmission(assignment)
                              setIsSubmissionModalOpen(true)
                            } catch {
                              // silently fail
                            } finally {
                              setResubmitting(false)
                            }
                          }}
                        >
                          <RotateCcw className="h-4 w-4 text-violet-600" />
                          {resubmitting ? "Resetting..." : "Resubmit"}
                        </button>
                      )}
                      {assignment.submission && assignment.submission.status === "graded" && (
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                          disabled={resubmitting}
                          onClick={() => {
                            handleResubmit(
                              assignment.submission!.id,
                              assignment.submission!.attemptNumber || 1
                            )
                          }}
                        >
                          <RotateCcw className="h-4 w-4 text-orange-500" />
                          {resubmitting ? "Resetting..." : "Resubmit"}
                          {(assignment.submission.attemptNumber || 1) >= 2 && (
                            <span className="ml-auto text-xs text-red-500">Limit</span>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                )
              })()}

              </>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && (
          <div className="space-y-6">
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
                    {/* Mobile Card View */}
                    <div className="space-y-3 md:hidden">
                      {submissions.map((submission) => {
                        const percentage = submission.marks
                          ? (submission.marks / submission.assignment.totalMarks) * 100
                          : 0
                        const isGraded = submission.status === "graded"
                        const isFailing = percentage < 50

                        return (
                          <Card key={submission.id} className="bg-white border-gray-200 shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0 mr-3">
                                  <h3 className="font-semibold text-gray-900 truncate">{submission.assignment.title}</h3>
                                  <p className="text-xs text-gray-500 mt-0.5">{submission.assignment.subject} &middot; {submission.assignment.teacher.name}</p>
                                </div>
                                {isGraded ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-300 shrink-0">Graded</Badge>
                                ) : (
                                  <Badge className="bg-violet-100 text-violet-800 border-violet-300 shrink-0">Pending</Badge>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-sm mb-3">
                                <span className="text-gray-500">Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                                {isGraded && (
                                  <div className="text-right">
                                    <span className={`font-bold text-lg ${isFailing ? 'text-red-600' : 'text-gray-900'}`}>
                                      {submission.marks}/{submission.assignment.totalMarks}
                                    </span>
                                    <span className={`ml-1.5 text-xs font-medium ${isFailing ? 'text-red-500' : 'text-gray-500'}`}>
                                      {percentage.toFixed(0)}% ({getGradeLetter(percentage)})
                                    </span>
                                  </div>
                                )}
                              </div>

                              {isGraded && submission.feedback && (
                                <button
                                  onClick={() => setExpandedFeedbackId(expandedFeedbackId === submission.id ? null : submission.id)}
                                  className="w-full flex items-center justify-between text-xs text-violet-600 font-medium py-2 border-t border-gray-100 cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    AI Feedback
                                  </span>
                                  {expandedFeedbackId === submission.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </button>
                              )}
                              {expandedFeedbackId === submission.id && submission.feedback && (
                                <div className="mt-2">
                                  <FeedbackSections feedback={submission.feedback} size="sm" />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    {/* Desktop Table View */}
                    <Card className="bg-white border-gray-200 shadow-sm hidden md:block">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold text-gray-700">Assignment</TableHead>
                              <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                              <TableHead className="font-semibold text-gray-700">Teacher</TableHead>
                              <TableHead className="font-semibold text-gray-700">Submitted</TableHead>
                              <TableHead className="text-center font-semibold text-gray-700">Status</TableHead>
                              <TableHead className="text-center font-semibold text-gray-700">
                                <div className="flex flex-col items-center">
                                  <span>Score</span>
                                  <span className="text-xs font-normal text-gray-400">(Marks / Total)</span>
                                </div>
                              </TableHead>
                              <TableHead className="text-center font-semibold text-gray-700">Grade</TableHead>
                              <TableHead className="text-center font-semibold text-gray-700">Feedback</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {submissions.map((submission) => {
                              const percentage = submission.marks
                                ? (submission.marks / submission.assignment.totalMarks) * 100
                                : 0
                              const isGraded = submission.status === "graded"
                              const isFailing = percentage < 50
                              const isExpanded = expandedFeedbackId === submission.id

                              return (
                                <React.Fragment key={submission.id}>
                                  <TableRow className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-violet-50/30' : ''}`}>
                                    <TableCell>
                                      <div className="font-semibold text-gray-900">{submission.assignment.title}</div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                                        {submission.assignment.subject}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">{submission.assignment.teacher.name}</TableCell>
                                    <TableCell className="text-sm text-violet-600 font-medium">
                                      {new Date(submission.submittedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isGraded ? (
                                        <Badge className="bg-green-100 text-green-800 border-green-300">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Graded
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-violet-100 text-violet-800 border-violet-300">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Pending
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isGraded ? (
                                        <span className={`font-bold text-lg ${isFailing ? 'text-red-600' : 'text-gray-900'}`}>
                                          {submission.marks}/{submission.assignment.totalMarks}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">&mdash;</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isGraded ? (
                                        <div className="flex flex-col items-center gap-0.5">
                                          <span className={`text-sm font-semibold ${isFailing ? 'text-red-600' : 'text-gray-900'}`}>
                                            {getGradeLetter(percentage)}
                                          </span>
                                          <span className={`text-xs ${isFailing ? 'text-red-500' : 'text-gray-500'}`}>
                                            {percentage.toFixed(1)}%
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">&mdash;</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isGraded && submission.feedback ? (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setExpandedFeedbackId(isExpanded ? null : submission.id)}
                                          className={`text-violet-600 hover:text-violet-700 hover:bg-violet-50 ${isExpanded ? 'bg-violet-100' : ''}`}
                                        >
                                          <MessageSquare className="h-4 w-4 mr-1" />
                                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                        </Button>
                                      ) : (
                                        <span className="text-gray-300">
                                          <MessageSquare className="h-4 w-4 inline" />
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                  {/* Expandable Feedback Row */}
                                  {isExpanded && submission.feedback && (
                                    <TableRow>
                                      <TableCell colSpan={8} className="py-2 px-6">
                                        <div className="max-w-3xl">
                                          <FeedbackSections feedback={submission.feedback} size="sm" />
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </React.Fragment>
                              )
                            })}
                          </TableBody>
                        </Table>
                        {submissions.length === 0 && (
                          <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                            <p className="text-gray-500">Submit some assignments to see your results here.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
              </>
            )}
          </div>
        )}
        </main>
      </div>

      {/* Submit Assignment Modal */}
      <SubmitAssignmentModal
        isOpen={isSubmissionModalOpen}
        onClose={() => {
          setIsSubmissionModalOpen(false)
        }}
        assignment={selectedAssignmentForSubmission}
        onSuccess={() => {
          setSelectedAssignmentForSubmission(null)
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

      {/* Description / Feedback Modal */}
      {isDescriptionModalOpen && selectedDescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setIsDescriptionModalOpen(false); setSelectedDescription(null) }}>
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-900">{selectedDescription.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsDescriptionModalOpen(false)
                  setSelectedDescription(null)
                }}
                className="text-gray-400 hover:text-gray-600 h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedDescription.description && (
              <div>
                <FeedbackSections feedback={selectedDescription.description} size="md" />
              </div>
            )}
            {selectedDescription.imageUrl && (
              <div className="mt-3">
                <a
                  href={selectedDescription.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-violet-50 border border-violet-200 rounded-lg text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-colors text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Assignment File
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resubmit Confirmation Popup */}
      {resubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setResubmitConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="h-7 w-7 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Resubmit Assignment?</h3>
            <p className="text-sm text-gray-600 mb-1">
              Your current submission and grade will be deleted.
            </p>
            <p className="text-sm text-violet-600 font-medium mb-5">
              You have 1 resubmit remaining after this.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setResubmitConfirm(null)}
                className="flex-1 border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                Cancel
              </Button>
              <Button
                onClick={executeResubmit}
                disabled={resubmitting}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              >
                {resubmitting ? "Resetting..." : "Yes, Resubmit"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resubmit Limit Popup */}
      {resubmitLimitPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setResubmitLimitPopup(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Submission Limit Reached</h3>
            <p className="text-sm text-gray-600 mb-4">
              You have used all 2 submission attempts for this assignment. No more resubmissions are allowed.
            </p>
            <Button
              onClick={() => setResubmitLimitPopup(false)}
              className="bg-violet-600 hover:bg-violet-700 text-white w-full"
            >
              Understood
            </Button>
          </div>
        </div>
      )}

      {/* Profile Popup */}
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
              <h4 className="text-lg font-semibold text-gray-900">{session.user?.name || "Student"}</h4>
              <p className="text-sm text-gray-500">{session.user?.email}</p>
              <Badge className="mt-2 bg-violet-100 text-violet-700 border-violet-200">Student</Badge>
            </div>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Classes Enrolled</span>
                <span className="text-gray-900 font-medium">{classes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Assignments</span>
                <span className="text-gray-900 font-medium">{assignments.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Submitted</span>
                <span className="text-gray-900 font-medium">{submissions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Average Score</span>
                <span className="text-gray-900 font-medium">{averagePercentage.toFixed(1)}%</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700 cursor-pointer"
                onClick={() => {
                  setShowProfilePopup(false)
                  setActiveTab("results")
                }}
              >
                <Award className="h-4 w-4 mr-2" />
                View Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
