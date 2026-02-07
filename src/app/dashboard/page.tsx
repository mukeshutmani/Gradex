"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function DashboardRedirect() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      // Redirect unauthenticated users to home page
      router.replace("/")
      return
    }

    if (session?.user) {
      // Redirect based on user role
      if (session.user.role === "student") {
        router.replace(`/dashboard/student/${session.user.username || session.user.email}`)
      } else {
        // Teachers go to landing page, they can access admin from profile menu
        router.replace("/")
      }
    }
  }, [session, status, router])

  // Show loading state while redirecting
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="animate-pulse">
        <img
          src="https://res.cloudinary.com/dolpat4s3/image/upload/v1766249987/Black_Green_Letter_G_Logo_wafmuu.svg"
          alt="Gradex Logo"
          width={64}
          height={64}
          className="h-16 w-16"
        />
      </div>
      <div className="mt-6 flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <p className="mt-4 text-gray-500 text-sm">Redirecting...</p>
    </div>
  )
}
