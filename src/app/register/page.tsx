import { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register - Gradex",
  description: "Create your Gradex account",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex flex-col items-center justify-center">
            <img
              src="https://res.cloudinary.com/dolpat4s3/image/upload/v1766249987/Black_Green_Letter_G_Logo_wafmuu.svg"
              alt="Gradex Logo"
              className="h-20 w-auto"
            />
            <h2 className="text-3xl font-bold text-gray-900">
              Create Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Start automating your grading today
            </p>
          </div>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm />
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="text-violet-600 hover:text-violet-700 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-violet-600 hover:text-violet-700 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
