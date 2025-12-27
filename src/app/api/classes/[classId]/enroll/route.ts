import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for enrollment
const enrollSchema = z.object({
  classCode: z.string().min(1, "Class code is required"),
})

// POST - Enroll student in class using class code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
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
    const validationResult = enrollSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { classCode } = validationResult.data

    // Find the class by class code
    const classToJoin = await prisma.class.findUnique({
      where: { classCode },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!classToJoin) {
      return NextResponse.json(
        { error: "Invalid class code" },
        { status: 404 }
      )
    }

    if (!classToJoin.isActive) {
      return NextResponse.json(
        { error: "This class is no longer active" },
        { status: 400 }
      )
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: classToJoin.id,
          studentId: user.id
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "You are already enrolled in this class" },
        { status: 400 }
      )
    }

    // Create enrollment
    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId: classToJoin.id,
        studentId: user.id,
      },
      include: {
        class: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Also create teacher-student relationship if it doesn't exist
    const existingRelationship = await prisma.studentTeacher.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: classToJoin.teacherId,
          studentId: user.id
        }
      }
    })

    if (!existingRelationship) {
      await prisma.studentTeacher.create({
        data: {
          teacherId: classToJoin.teacherId,
          studentId: user.id,
        }
      })
    }

    return NextResponse.json(
      {
        message: "Successfully enrolled in class",
        enrollment,
        class: classToJoin
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error enrolling in class:", error)
    return NextResponse.json(
      { error: "Failed to enroll in class" },
      { status: 500 }
    )
  }
}