import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"


export const metadata: Metadata = {
  title: "Login - Gradex",
  description: "Sign in to your account",
}


export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white py-8 px-4 border border-gray-200 rounded-lg shadow-sm sm:px-10">
          <div className="flex flex-col items-center justify-center mb-6">
            <img
              src="https://res.cloudinary.com/dolpat4s3/image/upload/v1766249987/Black_Green_Letter_G_Logo_wafmuu.svg"
              alt="Gradex Logo"
              className="h-14 w-auto"
            />
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to your Gradex account to continue
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}