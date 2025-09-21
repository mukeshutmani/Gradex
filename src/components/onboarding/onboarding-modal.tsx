"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, ChevronRight, ChevronLeft, Check, Star, CreditCard, Smartphone } from "lucide-react"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  role: string
  username: string
  institutionType: string
  institutionName: string
  studentCount: string
  subjects: string
  experience: string
  plan: string
  paymentMethod: string
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<FormData>({
    role: "teacher",
    username: "",
    institutionType: "",
    institutionName: "",
    studentCount: "",
    subjects: "",
    experience: "",
    plan: "",
    paymentMethod: ""
  })

  // Auto-fill username from session data when modal opens
  useEffect(() => {
    if (isOpen && session?.user?.name && !formData.username) {
      setFormData(prev => ({
        ...prev,
        username: session.user?.name || ""
      }))
    }
  }, [isOpen, session?.user?.name, formData.username])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const totalSteps = 5

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.username.trim()) {
        newErrors.username = "Username is required"
      }
      if (!formData.institutionType) {
        newErrors.institutionType = "Institution type is required"
      }
    }

    if (currentStep === 2) {
      if (!formData.institutionName.trim()) {
        newErrors.institutionName = "Institution name is required"
      }
      if (!formData.studentCount) {
        newErrors.studentCount = "Student count is required"
      }
    }

    if (currentStep === 3) {
      if (!formData.subjects.trim()) {
        newErrors.subjects = "Please enter at least one subject"
      }
      if (!formData.experience) {
        newErrors.experience = "Teaching experience is required"
      }
    }

    if (currentStep === 4) {
      if (!formData.plan) {
        newErrors.plan = "Please select a plan"
      }
    }

    if (currentStep === 5 && formData.plan !== "free") {
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = "Please select a payment method"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      setErrors({}) // Clear errors when moving to next step
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col border border-gray-700 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Start Auto-Grading</h2>
            <p className="text-gray-300">Step {currentStep} of {totalSteps}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-white hover:bg-gray-200 text-black">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2 flex-shrink-0">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 p-6 text-white overflow-y-auto">
          {/* Step 1: User Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Basic Information</h3>

                {/* Role Selection */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-gray-300">Your Role</label>
                  <Select value={formData.role} onValueChange={(value) => updateFormData("role", value)}>
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="coordinator">Academic Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-gray-300">Username</label>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => updateFormData("username", e.target.value)}
                    readOnly={!!session?.user?.name}
                    className={`w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${errors.username ? "border-red-500" : ""} ${!!session?.user?.name ? "cursor-not-allowed opacity-75" : ""}`}
                  />
                  {errors.username && (
                    <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                  )}
                </div>

                {/* Institution Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Institution Type</label>
                  <Select value={formData.institutionType} onValueChange={(value) => updateFormData("institutionType", value)}>
                    <SelectTrigger className={`w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${errors.institutionType ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select institution type" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="institute">Training Institute</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.institutionType && (
                    <p className="text-red-400 text-sm mt-1">{errors.institutionType}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Institution Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Institution Details</h3>

                {/* Institution Name */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-gray-300">
                    {formData.institutionType === "school" ? "School" :
                     formData.institutionType === "college" ? "College" :
                     formData.institutionType === "university" ? "University" : "Institution"} Name
                  </label>
                  <Input
                    type="text"
                    placeholder={`Enter your ${formData.institutionType || 'institution'} name`}
                    value={formData.institutionName}
                    onChange={(e) => updateFormData("institutionName", e.target.value)}
                    className={`w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${errors.institutionName ? "border-red-500" : ""}`}
                  />
                  {errors.institutionName && (
                    <p className="text-red-400 text-sm mt-1">{errors.institutionName}</p>
                  )}
                </div>

                {/* Student Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Number of Students</label>
                  <Select value={formData.studentCount} onValueChange={(value) => updateFormData("studentCount", value)}>
                    <SelectTrigger className={`w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${errors.studentCount ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select student count range" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="1-50">1-50 students</SelectItem>
                      <SelectItem value="51-200">51-200 students</SelectItem>
                      <SelectItem value="201-500">201-500 students</SelectItem>
                      <SelectItem value="501-1000">501-1000 students</SelectItem>
                      <SelectItem value="1000+">1000+ students</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.studentCount && (
                    <p className="text-red-400 text-sm mt-1">{errors.studentCount}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Additional Information</h3>

                {/* Subjects */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-gray-300">Subjects You Teach</label>
                  <Input
                    type="text"
                    placeholder="Enter subjects you teach (e.g., Mathematics, Science, English)"
                    value={formData.subjects}
                    onChange={(e) => updateFormData("subjects", e.target.value)}
                    className={`w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${errors.subjects ? "border-red-500" : ""}`}
                  />
                  {errors.subjects && (
                    <p className="text-red-400 text-sm mt-1">{errors.subjects}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    You can separate multiple subjects with commas
                  </div>
                </div>

                {/* Teaching Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Teaching Experience</label>
                  <Select value={formData.experience} onValueChange={(value) => updateFormData("experience", value)}>
                    <SelectTrigger className={`w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${errors.experience ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience && (
                    <p className="text-red-400 text-sm mt-1">{errors.experience}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Plan Selection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Choose Your Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Free Plan */}
                  <Card className={`cursor-pointer transition-all bg-gray-800 border-gray-600 text-white ${formData.plan === "free" ? "ring-2 ring-blue-500 bg-gray-700" : ""}`}
                        onClick={() => updateFormData("plan", "free")}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        Free
                        {formData.plan === "free" && <Check className="ml-2 h-5 w-5 text-blue-500" />}
                      </CardTitle>
                      <CardDescription>Perfect for trying out</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">₹0/month</div>
                      <ul className="text-sm space-y-1">
                        <li>✓ 10 assignments/month</li>
                        <li>✓ Basic grading</li>
                        <li>✓ Email support</li>
                        <li>✗ Advanced analytics</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Standard Plan */}
                  <Card className={`cursor-pointer transition-all bg-gray-800 border-gray-600 text-white ${formData.plan === "standard" ? "ring-2 ring-blue-500 bg-gray-700" : ""}`}
                        onClick={() => updateFormData("plan", "standard")}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        Standard
                        <Star className="ml-2 h-4 w-4 text-yellow-500" />
                        {formData.plan === "standard" && <Check className="ml-2 h-5 w-5 text-blue-500" />}
                      </CardTitle>
                      <CardDescription>Most popular choice</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">₹999/month</div>
                      <ul className="text-sm space-y-1">
                        <li>✓ 100 assignments/month</li>
                        <li>✓ Advanced grading</li>
                        <li>✓ Analytics dashboard</li>
                        <li>✓ Priority support</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Premium Plan */}
                  <Card className={`cursor-pointer transition-all bg-gray-800 border-gray-600 text-white ${formData.plan === "premium" ? "ring-2 ring-blue-500 bg-gray-700" : ""}`}
                        onClick={() => updateFormData("plan", "premium")}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        Premium
                        {formData.plan === "premium" && <Check className="ml-2 h-5 w-5 text-blue-500" />}
                      </CardTitle>
                      <CardDescription>For institutions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">₹2499/month</div>
                      <ul className="text-sm space-y-1">
                        <li>✓ Unlimited assignments</li>
                        <li>✓ AI-powered insights</li>
                        <li>✓ Custom rubrics</li>
                        <li>✓ 24/7 dedicated support</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                {errors.plan && (
                  <p className="text-red-400 text-sm mt-2">{errors.plan}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Payment Method */}
          {currentStep === 5 && formData.plan !== "free" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Payment Method</h3>

                <div className="space-y-4">
                  {/* Selected Plan Summary */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-white">Selected Plan: {formData.plan?.charAt(0).toUpperCase() + formData.plan?.slice(1)}</h4>
                    <p className="text-lg font-bold text-white">
                      {formData.plan === "standard" ? "₹999" : "₹2499"}/month
                    </p>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Select Payment Method</label>

                    <div className="space-y-2">
                      <Card className={`cursor-pointer transition-all p-4 bg-gray-800 border-gray-600 text-white ${formData.paymentMethod === "card" ? "ring-2 ring-blue-500 bg-gray-700" : ""}`}
                            onClick={() => updateFormData("paymentMethod", "card")}>
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-3" />
                          <div>
                            <div className="font-medium">Credit/Debit Card</div>
                            <div className="text-sm text-gray-400">Visa, Mastercard, RuPay</div>
                          </div>
                          {formData.paymentMethod === "card" && <Check className="ml-auto h-5 w-5 text-blue-500" />}
                        </div>
                      </Card>

                      <Card className={`cursor-pointer transition-all p-4 bg-gray-800 border-gray-600 text-white ${formData.paymentMethod === "upi" ? "ring-2 ring-blue-500 bg-gray-700" : ""}`}
                            onClick={() => updateFormData("paymentMethod", "upi")}>
                        <div className="flex items-center">
                          <Smartphone className="h-5 w-5 mr-3" />
                          <div>
                            <div className="font-medium">UPI</div>
                            <div className="text-sm text-gray-400">GPay, PhonePe, Paytm</div>
                          </div>
                          {formData.paymentMethod === "upi" && <Check className="ml-auto h-5 w-5 text-blue-500" />}
                        </div>
                      </Card>

                      <Card className={`cursor-pointer transition-all p-4 ${formData.paymentMethod === "netbanking" ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                            onClick={() => updateFormData("paymentMethod", "netbanking")}>
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-3" />
                          <div>
                            <div className="font-medium">Net Banking</div>
                            <div className="text-sm text-gray-600">All major banks</div>
                          </div>
                          {formData.paymentMethod === "netbanking" && <Check className="ml-auto h-5 w-5 text-blue-500" />}
                        </div>
                      </Card>
                    </div>
                    {errors.paymentMethod && (
                      <p className="text-red-400 text-sm mt-2">{errors.paymentMethod}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Free Plan Completion */}
          {currentStep === 5 && formData.plan === "free" && (
            <div className="space-y-6 text-center">
              <div>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Welcome to Gradex!</h3>
                <p className="text-gray-300 mb-4">
                  Your free account has been set up successfully. You can start using Gradex right away with your free plan.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-white">Your Free Plan Includes:</h4>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>✓ 10 assignments per month</li>
                    <li>✓ Basic auto-grading</li>
                    <li>✓ Email support</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index + 1 <= currentStep ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} className="flex items-center">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (validateCurrentStep()) {
                  if (formData.plan === "free") {
                    // Handle free plan completion and redirect to admin dashboard
                    console.log("Free plan setup complete:", formData)
                    onClose()
                    router.push(`/admin/${session?.user?.email}`)
                  } else {
                    // Handle payment processing and redirect to admin dashboard
                    console.log("Processing payment:", formData)
                    onClose()
                    router.push(`/admin/${session?.user?.email}`)
                  }
                }
              }}
              className="flex items-center"
            >
              {formData.plan === "free" ? "Start Using Gradex" : "Complete Payment"}
              <Check className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}