import { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register - Gradex",
  description: "Create your Gradex account",
}

export default function RegisterPage() {
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
            <h2 className="text-xl font-semibold text-gray-900">
              Start automating your grading today
            </h2>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
