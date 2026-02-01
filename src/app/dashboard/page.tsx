"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Footer } from "@/components/layout/footer"
import { OnboardingModal } from "@/components/onboarding/onboarding-modal"
import {
  ClipboardCheck,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  Award,
  PlayCircle,
  FileCheck,
  CheckCircle2,
  Bot,
  LogOut,
  User,
  LayoutDashboard,
  Sparkles,
  DollarSign,
  HelpCircle,
  ChevronDown
} from "lucide-react"
import { useRef } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [showLoginAsTeacherModal, setShowLoginAsTeacherModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSending, setIsSending] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  // Handle authentication check for auto-grading buttons
  const handleStartAutoGrading = () => {
    if (status === "unauthenticated") {
      // Redirect to login if user is not authenticated
      router.push("/login")
    } else if (session) {
      // Check if user already has a subscription/completed onboarding
      if (userProfile?.profile?.isOnboardingComplete) {
        setShowSubscriptionModal(true)
      } else {
        // Open onboarding modal if user hasn't completed onboarding
        setIsOnboardingOpen(true)
      }
    }
  }

  // Handle pricing button clicks
  const handlePricingClick = () => {
    if (session?.user?.role === "student") {
      setShowLoginAsTeacherModal(true)
    } else if (session?.user?.role === "client") {
      setIsOnboardingOpen(true)
    } else {
      router.push("/login")
    }
  }

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      alert('Please fill in all fields')
      return
    }

    setIsSending(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contactForm,
          to: 'mukeshutmani.dev@gmail.com'
        }),
      })

      if (response.ok) {
        alert('Message sent successfully! We will get back to you soon.')
        setContactForm({ name: '', email: '', subject: '', message: '' })
        setShowContactModal(false)
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  // Fetch user profile to check onboarding status
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const response = await fetch('/api/user-profile')
          if (response.ok) {
            const data = await response.json()
            setUserProfile(data.user)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        } finally {
          setProfileLoading(false)
        }
      } else {
        setProfileLoading(false)
      }
    }

    fetchUserProfile()
  }, [status, session])

  // Dashboard is now accessible to everyone (logged in or public)
  // No redirect needed

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

  // Dashboard is accessible to everyone - no session check needed

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <img
                  src="https://res.cloudinary.com/dolpat4s3/image/upload/v1766249987/Black_Green_Letter_G_Logo_wafmuu.svg"
                  alt="Gradex Logo"
                  className="h-16 w-auto"
                />
              </div>
            </div>

            {/* Navigation Tabs - Hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button
                onClick={() => {
                  document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors cursor-pointer"
              >
                Support
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              {session ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 hidden sm:block">
                      {session?.user?.name || session?.user?.email}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{session?.user?.name || session?.user?.email}</p>
                          <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                        </div>

                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false)
                            router.push(`/admin/${session?.user?.username}`)
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-3 text-gray-600" />
                          <span className="font-medium text-gray-900">Admin Panel</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false)
                            router.push(`/admin/${session?.user?.username}`)
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-600" />
                          <span className="font-medium text-gray-900">Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false)
                            document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <HelpCircle className="h-4 w-4 mr-3 text-gray-600" />
                          <span className="font-medium text-gray-900">Help & Support</span>
                        </button>

                        <div className="border-t border-gray-100 my-1" />

                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false)
                            signOut({ callbackUrl: '/login' })
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push("/login")}>
                    Sign In
                  </Button>
                  <Button onClick={() => router.push("/register")}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Width Grid Background */}
      <div className="relative w-full bg-gradient-to-br from-violet-50 to-white overflow-hidden">
        {/* Grid Line Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, #C4B5FD 1px, transparent 1px), linear-gradient(to bottom, #C4B5FD 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.4
          }}
        ></div>
        {/* Center Radial Blur/Fade */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245,243,255,0.95) 25%, rgba(245,243,255,0.6) 50%, transparent 75%)'
          }}
        ></div>

        <div className="relative text-center py-28 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold text-black mb-4">
            Welcome to <span className="text-violet-600">Gradex!</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Gradex is an innovative platform that helps teachers with automatic assignment checking and grading.
            We provide AI-powered solutions to streamline the evaluation process for colleges, schools, and universities.
          </p>

          {/* Start Your Plan Button - Only for clients */}
          {session?.user?.role === "client" && (
            <div className="flex items-center justify-center space-x-4">
              <Button size="lg" className="px-8" onClick={handleStartAutoGrading}>
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Auto-Grading
              </Button>
              <Button variant="outline" size="lg">
                Explore Features
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Platform Services */}
        {/* Our Services */}
        <div id="features" className="mb-16 mt-8 scroll-mt-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
            <p className="mt-2 text-gray-500 max-w-2xl mx-auto">Everything you need to automate grading and manage your classroom efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative bg-white border border-violet-200 rounded-2xl p-8 text-center hover:shadow-xl hover:border-violet-400 transition-all duration-300">
              <div className="mx-auto w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center mb-5 group-hover:bg-violet-600 group-hover:scale-110 transition-all duration-300">
                <Bot className="h-7 w-7 text-black group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Powered Grading</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Advanced AI algorithms that automatically grade assignments, essays, and tests with detailed feedback for students.
              </p>
            </div>

            <div className="group relative bg-white border border-violet-200 rounded-2xl p-8 text-center hover:shadow-xl hover:border-violet-400 transition-all duration-300">
              <div className="mx-auto w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center mb-5 group-hover:bg-violet-600 group-hover:scale-110 transition-all duration-300">
                <FileCheck className="h-7 w-7 text-black group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Assignment Management</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Upload, distribute, and collect assignments seamlessly. Track submission status and manage deadlines efficiently.
              </p>
            </div>

            <div className="group relative bg-white border border-violet-200 rounded-2xl p-8 text-center hover:shadow-xl hover:border-violet-400 transition-all duration-300">
              <div className="mx-auto w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center mb-5 group-hover:bg-violet-600 group-hover:scale-110 transition-all duration-300">
                <CheckCircle2 className="h-7 w-7 text-black group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Plagiarism Detection</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Comprehensive plagiarism detection that ensures academic integrity and provides detailed similarity reports.
              </p>
            </div>
          </div>
        </div>

        {/* Teacher Dashboard Features */}
        {session?.user?.role === "client" && (
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h2>
              <p className="mt-2 text-gray-500 max-w-2xl mx-auto">Powerful tools to manage your classes, track progress, and generate reports</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-white border border-violet-200 rounded-2xl p-6 hover:shadow-xl hover:border-violet-400 transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="h-6 w-6 text-violet-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Grading Analytics</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                  Monitor grading progress and view detailed analytics for your classes
                </p>
                <Button variant="outline" size="sm" className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 cursor-pointer">
                  View Analytics
                </Button>
              </div>

              <div className="group bg-white border border-violet-200 rounded-2xl p-6 hover:shadow-xl hover:border-violet-400 transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:scale-110 transition-all duration-300">
                  <Calendar className="h-6 w-6 text-violet-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Assignment Scheduler</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                  Schedule assignments, set deadlines, and manage submission dates
                </p>
                <Button variant="outline" size="sm" className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 cursor-pointer">
                  Manage Schedule
                </Button>
              </div>

              <div className="group bg-white border border-violet-200 rounded-2xl p-6 hover:shadow-xl hover:border-violet-400 transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:scale-110 transition-all duration-300">
                  <Award className="h-6 w-6 text-violet-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Grade Reports</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                  Generate comprehensive grade reports and student performance summaries
                </p>
                <Button variant="outline" size="sm" className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 cursor-pointer">
                  Generate Reports
                </Button>
              </div>

              <div className="group bg-white border border-violet-200 rounded-2xl p-6 hover:shadow-xl hover:border-violet-400 transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:scale-110 transition-all duration-300">
                  <Users className="h-6 w-6 text-violet-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Class Management</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                  Manage student enrollment, view submissions, and track class progress
                </p>
                <Button variant="outline" size="sm" className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 cursor-pointer">
                  Manage Classes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Features - Student */}
        {session?.user?.role === "student" && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Student Dashboard Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BookOpen className="mr-2 h-5 w-5 text-violet-600" />
                    My Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    View all your assignments, track deadlines, and submit work on time
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full border-violet-300 text-violet-700 hover:bg-violet-100 hover:text-violet-700">
                    View Assignments
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Award className="mr-2 h-5 w-5 text-violet-600" />
                    My Grades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    Check your grades, view feedback, and track your academic progress
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full border-violet-400 text-violet-700 hover:bg-violet-100 hover:text-violet-700">
                    View Grades
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="mr-2 h-5 w-5 text-violet-600" />
                    My Classes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    Access your enrolled classes and view class-specific assignments
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full border-violet-300 text-violet-700 hover:bg-violet-100 hover:text-violet-700">
                    View Classes
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="mr-2 h-5 w-5 text-violet-600" />
                    Due Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    Stay organized with upcoming deadlines and assignment schedules
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full border-violet-400 text-violet-700 hover:bg-violet-100 hover:text-violet-700">
                    View Calendar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Quick Actions - Only for clients (teachers) */}
        {session?.user?.role === "client" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex flex-col">
                <ClipboardCheck className="h-6 w-6 mb-1" />
                Upload Assignment
              </Button>
              <Button variant="outline" className="h-16 flex flex-col" onClick={handleStartAutoGrading}>
                <Bot className="h-6 w-6 mb-1" />
                Start Auto-Grade
              </Button>
              <Button variant="outline" className="h-16 flex flex-col">
                <FileCheck className="h-6 w-6 mb-1" />
                Review Submissions
              </Button>
              <Button variant="outline" className="h-16 flex flex-col">
                <TrendingUp className="h-6 w-6 mb-1" />
                View Reports
              </Button>
            </div>
          </div>
        )}


        {/* Pricing Section */}
        <div id="pricing" className="mt-16 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the perfect plan for your institution. All plans include our core AI-powered grading features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <Card className="border-2 border-gray-200 hover:border-violet-300 transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Basic</CardTitle>
                <CardDescription className="text-gray-600">Perfect for individual teachers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-gray-900">
                  $29<span className="text-lg text-gray-600">/month</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Up to 100 assignments/month
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    AI-powered grading
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Basic analytics
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Email support
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePricingClick} className="w-full bg-violet-600 text-white hover:bg-violet-700">Get Started</Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-violet-600 shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-violet-600 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Pro</CardTitle>
                <CardDescription className="text-gray-600">Best for schools & departments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-gray-900">
                  $79<span className="text-lg text-gray-600">/month</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Up to 500 assignments/month
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Advanced AI grading
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Plagiarism detection
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Priority support
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePricingClick} className="w-full bg-violet-600 text-white hover:bg-violet-700">Get Started</Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-200 hover:border-violet-300 transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Enterprise</CardTitle>
                <CardDescription className="text-gray-600">For universities & institutions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-gray-900">
                  Custom
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Unlimited assignments
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Custom AI models
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    White-label solution
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Dedicated support
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-violet-600" />
                    Custom integrations
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePricingClick} className="w-full bg-violet-600 text-white hover:bg-violet-700">Contact Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Support Section */}
        <div id="support" className="mt-16 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Get Support</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're here to help you succeed. Reach out to our support team anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <HelpCircle className="mr-2 h-5 w-5 text-violet-600" />
                  Help Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Browse our comprehensive documentation and FAQs to find answers to common questions.
                </p>
                <Button variant="outline" className="w-full border-violet-300 text-violet-700 hover:bg-violet-100 hover:text-violet-700">Visit Help Center</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5 text-violet-600" />
                  Community Forum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Connect with other educators and share best practices in our community forum.
                </p>
                <Button variant="outline" className="w-full border-violet-300 text-violet-700 hover:bg-violet-100 hover:text-violet-700">Join Community</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileCheck className="mr-2 h-5 w-5 text-violet-600" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Get in touch with our support team for personalized assistance.
                </p>
                <Button onClick={() => setShowContactModal(true)} className="w-full bg-violet-600 text-white hover:bg-violet-700">Contact Us</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Already Have Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-green-500">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h3>
              <p className="text-gray-700 mb-6">
                You already have an active subscription and your account is ready to use.
              </p>
              <div className="bg-green-50 p-4 rounded-lg w-full mb-6">
                <p className="text-sm text-green-800 font-medium">
                  Plan: <span className="capitalize">{userProfile?.profile?.plan || 'Active'}</span>
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  onClick={() => setShowSubscriptionModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => router.push(`/admin/${session?.user?.username}`)}
                  className="bg-green-600 text-white hover:bg-green-700 flex-1"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login as Teacher Modal */}
      {showLoginAsTeacherModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-red-500">
            <h3 className="text-xl font-bold text-red-600 mb-4">Teacher Access Required</h3>
            <p className="text-gray-700 mb-6">
              This feature is only available for teachers. Please login as a teacher to access pricing and subscription plans.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => setShowLoginAsTeacherModal(false)}
                className="bg-red-600 text-white hover:bg-red-700 px-8"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-black">
            <h3 className="text-2xl font-bold text-black mb-4">Contact Support</h3>
            <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you shortly.</p>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  type="text"
                  placeholder="Your name"
                  className="w-full"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <Input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowContactModal(false)
                    setContactForm({ name: '', email: '', subject: '', message: '' })
                  }}
                  variant="outline"
                  className="flex-1 border-black text-black hover:bg-gray-100"
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-black text-white hover:bg-black/90"
                  disabled={isSending}
                >
                  {isSending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}