import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for user profile creation
const createUserProfileSchema = z.object({
  role: z.string().min(1, "Role is required"),
  institutionType: z.string().min(1, "Institution type is required"),
  institutionName: z.string().min(1, "Institution name is required"),
  studentCount: z.string().min(1, "Student count is required"),
  subjects: z.string().min(1, "Subjects are required"),
  experience: z.string().min(1, "Experience is required"),
  plan: z.string().min(1, "Plan selection is required"),
  paymentMethod: z.string().optional(),
})

// POST - Create/Update user profile with onboarding data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate the request data
    const validationResult = createUserProfileSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const {
      role,
      institutionType,
      institutionName,
      studentCount,
      subjects,
      experience,
      plan,
      paymentMethod,
    } = validationResult.data

    // Create or update user profile
    const userProfile = await prisma.userProfile.upsert({
      where: {
        userId: user.id
      },
      update: {
        role,
        institutionType,
        institutionName,
        studentCount,
        subjects,
        experience,
        plan,
        paymentMethod: paymentMethod || null,
        isOnboardingComplete: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        role,
        institutionType,
        institutionName,
        studentCount,
        subjects,
        experience,
        plan,
        paymentMethod: paymentMethod || null,
        isOnboardingComplete: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(
      {
        message: "User profile saved successfully",
        profile: userProfile
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error saving user profile:", error)
    return NextResponse.json(
      { error: "Failed to save user profile" },
      { status: 500 }
    )
  }
}

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    )
  }
}