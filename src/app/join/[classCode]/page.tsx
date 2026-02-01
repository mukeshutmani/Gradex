"use client"

import { useEffect, useState, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from "lucide-react"

interface ClassInfo {
  id: string
  name: string
  description: string
  teacher: {
    name: string
    email: string
  }
  studentCount: number
  isActive: boolean
}

export default function JoinClassPage({ params }: { params: Promise<{ classCode: string }> }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")
  const { classCode } = use(params)

  // Fetch class information
  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const response = await fetch(`/api/classes/join?classCode=${classCode}`)
        const data = await response.json()

        if (response.ok) {
          setClassInfo(data.class)
        } else {
          setError(data.error)
        }
      } catch (error) {
        console.error('Error fetching class info:', error)
        setError('Failed to load class information')
      } finally {
        setLoading(false)
      }
    }

    if (classCode) {
      fetchClassInfo()
    }
  }, [classCode])

  // Handle joining the class
  const handleJoinClass = async () => {
    if (!session?.user?.email) {
      router.push('/login')
      return
    }

    setJoining(true)
    try {
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classCode }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        router.push(`/dashboard/student/${session.user.id}`)
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('Error joining class:', error)
      setError('Failed to join class. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  if (status === "loading" || loading) {
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {error ? (
          /* Error State */
          <Card className="bg-white border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>Unable to Join Class</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push(session?.user?.id ? `/dashboard/student/${session.user.id}` : '/login')}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : classInfo ? (
          /* Class Info and Join */
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6 text-blue-500" />
                <span>Join Class</span>
              </CardTitle>
              <CardDescription>
                You've been invited to join this class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Class Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{classInfo.name}</h3>
                  {classInfo.description && (
                    <p className="text-gray-600 mt-1">{classInfo.description}</p>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{classInfo.studentCount} students</span>
                  </div>
                  <Badge variant={classInfo.isActive ? "default" : "outline"}>
                    {classInfo.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Teacher</div>
                  <div className="font-medium text-gray-900">{classInfo.teacher.name}</div>
                  <div className="text-xs text-gray-500">{classInfo.teacher.email}</div>
                </div>
              </div>

              {/* Join Actions */}
              <div className="space-y-3">
                {!session?.user?.email ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      You need to be logged in to join this class.
                    </p>
                    <Button
                      onClick={() => router.push('/login')}
                      className="w-full"
                    >
                      Login to Join
                    </Button>
                  </div>
                ) : !classInfo.isActive ? (
                  <div className="space-y-3">
                    <p className="text-sm text-red-600">
                      This class is no longer accepting new students.
                    </p>
                    <Button
                      onClick={() => router.push(session?.user?.id ? `/dashboard/student/${session.user.id}` : '/login')}
                      variant="outline"
                      className="w-full"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleJoinClass}
                    disabled={joining}
                    className="w-full"
                  >
                    {joining ? (
                      "Joining..."
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Join Class
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={() => router.push(session?.user?.id ? `/dashboard/student/${session.user.id}` : '/login')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Student Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}