import { Metadata } from "next"
import Link from "next/link"
import { ClipboardCheck, Database, Lock, Clock, UserCheck, Shield, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Data Protection - Gradex",
  description: "Data Protection Policy for Gradex",
}

export default function DataProtectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
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
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-10 w-10 sm:h-16 sm:w-16" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Data Protection Policy</h1>
          <p className="text-xl text-green-100">Your data security is our priority</p>
          <p className="text-sm text-green-200 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Shield className="h-6 w-6" />
                Data Collection and Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Gradex is committed to protecting your personal data. We collect and process data in accordance with applicable data protection laws and regulations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Database className="h-6 w-6" />
                Types of Data We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["Personal identification (Name, Email)", "Account credentials (encrypted)", "Educational data (assignments, grades)", "Usage data and analytics", "Communication data (emails, tickets)"].map((item, i) => (
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
                <Lock className="h-6 w-6" />
                Data Storage and Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700 mb-2">We implement industry-standard security measures:</p>
              {["Encrypted data transmission (HTTPS/TLS)", "Secure database with encryption at rest", "Regular security audits and updates", "Access controls and authentication", "Regular backups and disaster recovery"].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Clock className="h-6 w-6" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. Educational records may be retained for academic integrity purposes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <UserCheck className="h-6 w-6" />
                Your Data Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700 mb-2">Under data protection laws, you have the right to:</p>
              {["Access your personal data", "Rectify inaccurate data", "Request erasure of your data", "Restrict processing of your data", "Data portability", "Object to processing", "Withdraw consent at any time"].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-700">
                <Shield className="h-6 w-6" />
                Third-Party Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We do not sell, trade, or transfer your personal data to third parties without your consent, except as required by law or to provide our services (e.g., cloud hosting providers, email services).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-pink-50 to-rose-100 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Mail className="h-6 w-6" />
              Contact Our Data Protection Officer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">
              For any data protection inquiries or to exercise your rights, please contact us:
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
