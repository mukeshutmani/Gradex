"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
  Bot
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

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

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/register")
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <ClipboardCheck className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-gray-900">Gradex</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <span className="text-sm text-gray-700">Welcome, {session.user?.name || session.user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Gradex! 📝
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Gradex is an innovative platform that helps teachers with automatic assignment checking and grading.
            We provide AI-powered solutions to streamline the evaluation process for colleges, schools, and universities.
          </p>

          {/* Start Your Plan Button */}
          <div className="flex items-center space-x-4">
            <Button size="lg" className="px-8" onClick={handleStartAutoGrading}>
              <PlayCircle className="mr-2 h-5 w-5" />
              Start Auto-Grading
            </Button>
            <Button variant="outline" size="lg">
              Explore Features
            </Button>
          </div>
        </div>

        {/* Platform Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-blue-500" />
                  AI-Powered Grading
                </CardTitle>
                <CardDescription>
                  Automated assignment checking with intelligent evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Advanced AI algorithms that automatically grade assignments, essays, and tests with detailed feedback for students.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="mr-2 h-5 w-5 text-green-500" />
                  Assignment Management
                </CardTitle>
                <CardDescription>
                  Streamlined workflow for assignment distribution and collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Upload, distribute, and collect assignments seamlessly. Track submission status and manage deadlines efficiently.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-purple-500" />
                  Plagiarism Detection
                </CardTitle>
                <CardDescription>
                  Advanced plagiarism checking and originality verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Comprehensive plagiarism detection that ensures academic integrity and provides detailed similarity reports.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dashboard Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Teacher Dashboard Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5 text-orange-500" />
                  Grading Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Monitor grading progress and view detailed analytics for your classes
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View Analytics
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                  Assignment Scheduler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Schedule assignments, set deadlines, and manage submission dates
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Manage Schedule
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Award className="mr-2 h-5 w-5 text-yellow-500" />
                  Grade Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Generate comprehensive grade reports and student performance summaries
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Generate Reports
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5 text-green-500" />
                  Class Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Manage student enrollment, view submissions, and track class progress
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Manage Classes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
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

        {/* Getting Started Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
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
      </main>

      <Footer />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  )
}