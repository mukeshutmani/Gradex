import { Metadata } from "next"
import Link from "next/link"
import { ClipboardCheck, Database, Shield, Eye, Lock, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy - Gradex",
  description: "Privacy Policy for Gradex",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100">Your privacy is important to us</p>
          <p className="text-sm text-blue-200 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Database className="h-6 w-6" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["Name and email address", "Account credentials", "Assignment and submission data", "Class enrollment information", "Usage data and analytics"].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Eye className="h-6 w-6" />
                How We Use Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["Provide and improve services", "Process assignments and feedback", "Communicate with you", "Monitor usage patterns", "Detect and prevent issues"].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Lock className="h-6 w-6" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We implement industry-standard security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted in transit and at rest.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Shield className="h-6 w-6" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["Access your personal data", "Correct inaccurate data", "Request deletion of data", "Object to data processing", "Export your data"].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-pink-50 to-rose-100 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Mail className="h-6 w-6" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">
              If you have any questions about this Privacy Policy, please contact us:
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
