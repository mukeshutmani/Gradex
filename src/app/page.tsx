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

export default function HomePage() {
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
                Home
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
                            if (session?.user?.role === "student") {
                              router.push(`/dashboard/student/${session?.user?.username || session?.user?.email}`)
                            } else {
                              router.push(`/admin/${session?.user?.username}`)
                            }
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-3 text-gray-600" />
                          <span className="font-medium text-gray-900">
                            {session?.user?.role === "student" ? "My Dashboard" : "Admin Panel"}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false)
                            if (session?.user?.role === "student") {
                              router.push(`/dashboard/student/${session?.user?.username || session?.user?.email}`)
                            } else {
                              router.push(`/admin/${session?.user?.username}`)
                            }
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

        <div className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <div className="text-left">
                <h1 className="text-4xl lg:text-6xl font-medium mb-6 leading-tight">
                  <span className="text-black">Grade in seconds</span>
                  <br />
                  <span className="text-violet-600">Scale to thousands</span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-lg">
                  Gradex is the AI-powered grading platform. Upload assignments, get instant AI feedback,
                  plagiarism detection, and detailed analytics for your classroom.
                </p>

                {session?.user?.role !== "student" && (
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="lg" className="px-8" onClick={handleStartAutoGrading}>
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Start Auto-Grading
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowContactModal(true)}
                    >
                      Request Demo
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Side - AI Grading Image */}
              <div className="relative flex justify-center lg:justify-end">
                <div
                  className="relative transition-transform duration-300 ease-out hover:scale-[1.02]"
                  style={{
                    transform: 'perspective(1000px) rotateY(-6deg) rotateX(2deg)',
                  }}
                >
                  <img
                    src="https://res.cloudinary.com/dolpat4s3/image/upload/q_100,f_png/v1770284005/gradex/ai-grading-modal.png"
                    alt="AI Grading in Progress"
                    className="rounded-2xl border border-violet-200 max-w-full h-auto w-80 lg:w-96 xl:w-[420px] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* How It Works */}
        <div id="features" className="mb-16 mt-8 scroll-mt-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-2 text-gray-500 max-w-2xl mx-auto">Simple 3-step process to automate your grading workflow</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl hover:border-gray-400 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">1</div>
              <div className="mx-auto w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5 mt-2">
                <FileCheck className="h-7 w-7 text-black" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Assignments</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Teachers create classes, upload assignments with rubrics, and share class codes with students to join.
              </p>
            </div>

            <div className="group relative bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl hover:border-gray-400 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">2</div>
              <div className="mx-auto w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5 mt-2">
                <Bot className="h-7 w-7 text-black" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Grades Instantly</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Our AI analyzes submissions, checks for plagiarism, evaluates content quality, and generates detailed grades with feedback.
              </p>
            </div>

            <div className="group relative bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl hover:border-gray-400 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">3</div>
              <div className="mx-auto w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-5 mt-2">
                <TrendingUp className="h-7 w-7 text-black" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Review & Track</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Teachers review AI grades, students get instant feedback, and everyone tracks progress through intuitive dashboards.
              </p>
            </div>
          </div>
        </div>

        {/* Teacher Dashboard Showcase */}
        <div className="mb-16 py-16 bg-gradient-to-br from-violet-50 to-white rounded-3xl border border-violet-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Dashboard Image */}
              <div className="relative order-2 lg:order-1">
                <div
                  className="relative transition-transform duration-300 ease-out hover:scale-[1.02]"
                  style={{
                    transform: 'perspective(1000px) rotateY(6deg) rotateX(-2deg)',
                  }}
                >
                  <img
                    src="https://res.cloudinary.com/dolpat4s3/image/upload/q_100,f_png/v1770285046/gradex/teacher-dashboard-v2.png"
                    alt="Teacher Admin Dashboard"
                    className="rounded-xl border border-violet-200 w-full"
                  />
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="order-1 lg:order-2">
                <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-4">
                  Teacher Dashboard
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Powerful Admin Panel for <span className="text-violet-600">Educators</span>
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Get a complete overview of your classes, assignments, and student performance.
                  Our intuitive dashboard helps you manage everything in one place.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Real-time Analytics</h4>
                      <p className="text-sm text-gray-500">Track class performance and grading statistics</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Student Management</h4>
                      <p className="text-sm text-gray-500">Manage enrollments and track individual progress</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <ClipboardCheck className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Assignment Overview</h4>
                      <p className="text-sm text-gray-500">View pending reviews and submission status at a glance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Dashboard Showcase */}
        <div className="mb-16 py-16 bg-white rounded-3xl">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Content */}
              <div>
                <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-4">
                  Student Portal
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Intuitive Dashboard for <span className="text-violet-600">Students</span>
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Students get a clean, focused view of their assignments, grades, and class progress.
                  Everything they need to succeed in one place.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Assignment Tracking</h4>
                      <p className="text-sm text-gray-500">View all assignments with status and due dates</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Instant Grades</h4>
                      <p className="text-sm text-gray-500">Get AI-powered feedback and grades immediately</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Class Overview</h4>
                      <p className="text-sm text-gray-500">See all enrolled classes and their assignments</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Dashboard Image */}
              <div className="relative">
                <div
                  className="relative transition-transform duration-300 ease-out hover:scale-[1.02]"
                  style={{
                    transform: 'perspective(1000px) rotateY(-6deg) rotateX(2deg)',
                  }}
                >
                  <img
                    src="https://res.cloudinary.com/dolpat4s3/image/upload/q_100,f_png/v1770285448/gradex/student-dashboard.png"
                    alt="Student Dashboard"
                    className="rounded-xl border border-violet-200 w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

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
            <Card className="border-2 border-gray-200 hover:border-gray-400 transition-colors">
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
                <Button onClick={handlePricingClick} className="w-full bg-white text-black border border-black hover:bg-gray-100 transition-colors">Get Started</Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-black hover:border-gray-500 shadow-lg relative transition-colors">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-black text-white px-4 py-1">Most Popular</Badge>
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
                <Button onClick={handlePricingClick} className="w-full bg-white text-black border border-black hover:bg-gray-100 transition-colors">Get Started</Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-200 hover:border-gray-400 transition-colors">
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
                <Button onClick={handlePricingClick} className="w-full bg-white text-black border border-black hover:bg-gray-100 transition-colors">Contact Sales</Button>
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
            <Card className="bg-white border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <HelpCircle className="mr-2 h-5 w-5 text-black" />
                  Help Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Browse our comprehensive documentation and FAQs to find answers to common questions.
                </p>
                <Button variant="outline" className="w-full border-black text-black hover:bg-gray-100">Visit Help Center</Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5 text-black" />
                  Community Forum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Connect with other educators and share best practices in our community forum.
                </p>
                <Button variant="outline" className="w-full border-black text-black hover:bg-gray-100">Join Community</Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileCheck className="mr-2 h-5 w-5 text-black" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Get in touch with our support team for personalized assistance.
                </p>
                <Button onClick={() => setShowContactModal(true)} className="w-full bg-black text-white hover:bg-gray-800">Contact Us</Button>
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