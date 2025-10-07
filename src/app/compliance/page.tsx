import { Metadata } from "next"
import Link from "next/link"
import { ClipboardCheck, Shield, FileCheck, Users, Lock, Accessibility, GraduationCap, Search, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Compliance - Gradex",
  description: "Compliance and Regulatory Information for Gradex",
}

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
              <ClipboardCheck className="h-8 w-8 text-black" />
              <span className="text-2xl font-bold text-black">Gradex</span>
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-black transition">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <FileCheck className="h-16 w-16" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Compliance</h1>
          <p className="text-xl text-cyan-100">Our commitment to regulatory compliance and standards</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Shield className="h-6 w-6" />
                GDPR Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Gradex is committed to compliance with the General Data Protection Regulation (GDPR). We ensure that all personal data of EU residents is processed lawfully, fairly, and transparently.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <GraduationCap className="h-6 w-6" />
                FERPA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                For educational institutions in the United States, we comply with the Family Educational Rights and Privacy Act (FERPA) to protect student education records.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Users className="h-6 w-6" />
                COPPA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We comply with the Children's Online Privacy Protection Act (COPPA). Our service is designed for users aged 13 and above. We do not knowingly collect data from children under 13.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Lock className="h-6 w-6" />
                Data Security Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700 mb-2">We adhere to industry-standard security practices:</p>
              {["SOC 2 Type II compliance framework", "ISO 27001 information security standards", "Regular security audits and penetration testing", "Encryption of data in transit and at rest", "Multi-factor authentication support"].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-700">
                <Accessibility className="h-6 w-6" />
                Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Gradex is committed to making our platform accessible to all users, following WCAG 2.1 Level AA guidelines to ensure our service is usable by people with disabilities.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <GraduationCap className="h-6 w-6" />
                Academic Integrity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We support academic integrity initiatives and provide tools that help maintain educational standards while respecting student privacy and academic freedom.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-700">
                <Search className="h-6 w-6" />
                Regular Audits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our compliance program includes regular internal and external audits to ensure ongoing adherence to all applicable regulations and standards.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-pink-50 to-rose-100 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Mail className="h-6 w-6" />
              Compliance Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">
              For compliance-related questions or concerns, please contact our compliance team:
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
