import { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { ClipboardCheck } from "lucide-react"


export const metadata: Metadata = {
  title: "Login - Gradex",
  description: "Sign in to your account",
}


export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex items-center justify-center gap-3">
            <ClipboardCheck className="h-10 w-10 text-black" />
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome back to Gradex
            </h2>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            Continue automating your assignment grading
          </p>
          <p className="mt-1 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-black hover:text-gray-700 underline"
            >
              Create one here
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}