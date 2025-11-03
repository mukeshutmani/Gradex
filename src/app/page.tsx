"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Always redirect to dashboard - both logged in and public users
  useEffect(() => {
    if (status !== "loading") {
      // Everyone goes to dashboard (logged in or not)
      router.replace("/dashboard")
    }
  }, [status, router])

  // Always show loading while redirecting (never show landing page)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  )
}
