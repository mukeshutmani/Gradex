import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"


export const metadata: Metadata = {
  title: "Login - Gradex",
  description: "Sign in to your account",
}


export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex flex-col items-center justify-center ">
            <img
              src="https://res.cloudinary.com/dolpat4s3/image/upload/v1766249987/Black_Green_Letter_G_Logo_wafmuu.svg"
              alt="Gradex Logo"
              className="h-20 w-auto"
            />
            <h2 className="text-2xl font-bold text-gray-900">
              Continue With Gradex
            </h2>
          </div>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}