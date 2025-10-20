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
  Bell,
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
  HelpCircle
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
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

  // Handle authentication check for auto-grading buttons
  const handleStartAutoGrading = () => {
    if (status === "unauthenticated") {
      // Redirect to login if user is not authenticated
      router.push("/login")
    } else if (session) {
      // Open onboarding modal if user is authenticated
      setIsOnboardingOpen(true)
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

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/register")
    }
    // Both clients and students can access this dashboard
  }, [status])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <ClipboardCheck className="h-8 w-8 text-black" />
                <span className="ml-2 text-xl font-bold text-black">Gradex</span>
              </div>
            </div>

            {/* Navigation Tabs - Hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-black transition-colors cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4 text-blue-500" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-black transition-colors cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Features</span>
              </button>
              <button
                onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-black transition-colors cursor-pointer"
              >
                <DollarSign className="h-4 w-4 text-green-500" />
                <span>Pricing</span>
              </button>
              <button
                onClick={() => {
                  document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-black transition-colors cursor-pointer"
              >
                <HelpCircle className="h-4 w-4 text-orange-500" />
                <span>Support</span>
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-black" />
                  </div>
                  <button
                    onClick={() => router.push(`/admin/${session.user?.username}`)}
                    className="text-sm hover:underline cursor-pointer transition-colors"
                  >
                    <span className="text-black font-semibold">Welcome,</span>{" "}
                    <span className="text-gray-700">{session.user?.name || session.user?.email}</span>
                  </button>
                </div>
                <Button
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="bg-black text-white hover:bg-black/90"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center relative py-12 bg-gradient-to-br from-green-50 to-white rounded-lg">
          {/* Dotted Background Pattern */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage: 'radial-gradient(circle, #70be78 3px, transparent 3px)',
              backgroundSize: '30px 30px',
              opacity: 0.15
            }}
          ></div>

          <h1 className="text-3xl font-bold text-black mb-2 flex items-center justify-center gap-2">
            Welcome to Gradex!
            <ClipboardCheck className="h-8 w-8 text-black" />
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-4xl mx-auto">
            Gradex is an innovative platform that helps teachers with automatic assignment checking and grading.
            We provide AI-powered solutions to streamline the evaluation process for colleges, schools, and universities.
          </p>

          {/* Start Your Plan Button - Only for clients */}
          {session.user?.role === "client" && (
            <div className="flex items-center space-x-4">
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

        {/* Platform Services */}
        <div id="features" className="mb-8 scroll-mt-20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-blue-600" />
                  AI-Powered Grading
                </CardTitle>
                <CardDescription>
                  Automated assignment checking with intelligent evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Advanced AI algorithms that automatically grade assignments, essays, and tests with detailed feedback for students.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="mr-2 h-5 w-5 text-green-600" />
                  Assignment Management
                </CardTitle>
                <CardDescription>
                  Streamlined workflow for assignment distribution and collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Upload, distribute, and collect assignments seamlessly. Track submission status and manage deadlines efficiently.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-purple-600" />
                  Plagiarism Detection
                </CardTitle>
                <CardDescription>
                  Advanced plagiarism checking and originality verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Comprehensive plagiarism detection that ensures academic integrity and provides detailed similarity reports.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dashboard Features - Teacher */}
        {session.user?.role === "client" && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Teacher Dashboard Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5 text-orange-600" />
                  Grading Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Monitor grading progress and view detailed analytics for your classes
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full border-orange-400 text-orange-700 hover:bg-orange-100">
                  View Analytics
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-cyan-600" />
                  Assignment Scheduler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Schedule assignments, set deadlines, and manage submission dates
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full border-cyan-400 text-cyan-700 hover:bg-cyan-100">
                  Manage Schedule
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Award className="mr-2 h-5 w-5 text-yellow-600" />
                  Grade Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Generate comprehensive grade reports and student performance summaries
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-100">
                  Generate Reports
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5 text-teal-600" />
                  Class Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Manage student enrollment, view submissions, and track class progress
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full border-teal-400 text-teal-700 hover:bg-teal-100">
                  Manage Classes
                </Button>
              </CardFooter>
            </Card>
          </div>
          </div>
        )}

        {/* Dashboard Features - Student */}
        {session.user?.role === "student" && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Student Dashboard Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BookOpen className="mr-2 h-5 w-5 text-pink-600" />
                    My Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    View all your assignments, track deadlines, and submit work on time
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full border-pink-400 text-pink-700 hover:bg-pink-100 hover:text-pink-700">
                    View Assignments
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Award className="mr-2 h-5 w-5 text-indigo-600" />
                    My Grades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    Check your grades, view feedback, and track your academic progress
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full border-indigo-400 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-700">
                    View Grades
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="mr-2 h-5 w-5 text-emerald-600" />
                    My Classes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    Access your enrolled classes and view class-specific assignments
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full border-emerald-400 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700">
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
        {session.user?.role === "client" && (
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

        {/* Getting Started Section */}
        {/* Auto-Grading CTA - Only for clients */}
        {session.user?.role === "client" && (
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Start Auto-Grading?</h3>
              <p className="text-gray-600 mb-4">
                Upload your first assignment and experience the power of AI-driven automatic grading and feedback generation.
              </p>
              <Button size="lg" className="px-8" onClick={handleStartAutoGrading}>
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Auto-Grading Now
              </Button>
            </div>
          </div>
        )}

        {/* Pricing Section */}
        <div id="pricing" className="mt-16 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Choose Your Plan</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the perfect plan for your institution. All plans include our core AI-powered grading features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <Card className="border-2 hover:border-black transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-black">Basic</CardTitle>
                <CardDescription className="text-gray-600">Perfect for individual teachers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-black">
                  $29<span className="text-lg text-gray-600">/month</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Up to 100 assignments/month
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    AI-powered grading
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Basic analytics
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Email support
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePricingClick} className="w-full bg-black text-white hover:bg-black/90">Get Started</Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-black shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-black text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-black">Pro</CardTitle>
                <CardDescription className="text-gray-600">Best for schools & departments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-black">
                  $79<span className="text-lg text-gray-600">/month</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Up to 500 assignments/month
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Advanced AI grading
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Plagiarism detection
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Priority support
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePricingClick} className="w-full bg-black text-white hover:bg-black/90">Get Started</Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 hover:border-black transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-black">Enterprise</CardTitle>
                <CardDescription className="text-gray-600">For universities & institutions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-black">
                  Custom
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Unlimited assignments
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Custom AI models
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    White-label solution
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Dedicated support
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-black" />
                    Custom integrations
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePricingClick} className="w-full bg-black text-white hover:bg-black/90">Contact Sales</Button>
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
            <Card className="bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Bell className="mr-2 h-5 w-5 text-sky-600" />
                  Help Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Browse our comprehensive documentation and FAQs to find answers to common questions.
                </p>
                <Button variant="outline" className="w-full border-sky-400 text-sky-700 hover:bg-sky-100 hover:text-sky-700">Visit Help Center</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5 text-amber-600" />
                  Community Forum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Connect with other educators and share best practices in our community forum.
                </p>
                <Button variant="outline" className="w-full border-amber-400 text-amber-700 hover:bg-amber-100 hover:text-amber-700">Join Community</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileCheck className="mr-2 h-5 w-5 text-rose-600" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Get in touch with our support team for personalized assistance.
                </p>
                <Button onClick={() => setShowContactModal(true)} className="w-full bg-black text-white hover:bg-black/90">Contact Us</Button>
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