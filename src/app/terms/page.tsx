import { Metadata } from "next"
import Link from "next/link"
import { ClipboardCheck, FileText, Key, UserCheck, GraduationCap, AlertTriangle, XCircle, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms of Service - Gradex",
  description: "Terms of Service for Gradex",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <ClipboardCheck className="h-8 w-8 text-black" />
              <span className="text-2xl font-bold text-black">Gradex</span>
            </Link>
            <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-black transition">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-16 w-16" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-indigo-100">Please read these terms carefully</p>
          <p className="text-sm text-indigo-200 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <FileText className="h-6 w-6" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                By accessing and using Gradex, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Key className="h-6 w-6" />
                Use License
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700 mb-2">Under this license you may not:</p>
              {["Modify or copy materials", "Use for commercial purposes", "Reverse engineer software", "Remove proprietary notations", "Transfer to another person"].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <UserCheck className="h-6 w-6" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding your account credentials and for any activities or actions under your account.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <GraduationCap className="h-6 w-6" />
                Academic Integrity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Users must maintain academic integrity when using our platform. Gradex is a tool to assist in the grading process and should not be used to circumvent educational standards or policies.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-6 w-6" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Gradex shall not be liable for any damages arising out of the use or inability to use the service, even if Gradex has been notified orally or in writing of the possibility of such damage.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-6 w-6" />
                Termination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-pink-50 to-rose-100 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Mail className="h-6 w-6" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">
              For any questions regarding these Terms of Service, please contact us:
            </p>
            <a
              href="mailto:mukeshutmani.dev@gmail.com"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-black/90 transition"
            >
              <Mail className="h-5 w-5" />
              mukeshutmani.dev@gmail.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
