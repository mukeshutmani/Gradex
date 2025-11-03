import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for class creation
const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
})

// Generate unique class code
function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// POST - Create new class
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
    const validationResult = createClassSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { name, description } = validationResult.data

    // Generate unique class code
    let classCode = generateClassCode()
    let existingClass = await prisma.class.findUnique({
      where: { classCode }
    })

    // Ensure unique class code
    while (existingClass) {
      classCode = generateClassCode()
      existingClass = await prisma.class.findUnique({
        where: { classCode }
      })
    }

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        classCode,
        teacherId: user.id,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      {
        message: "Class created successfully",
        class: newClass
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    )
  }
}

// GET - Fetch user's classes
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
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Fetch user's classes
    const classes = await prisma.class.findMany({
      where: {
        teacherId: user.id
      },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true
              }
            }
          }
        },
        assignments: {
          select: {
            id: true,
            title: true,
            subject: true,
            dueDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      classes: classes.map(cls => ({
        ...cls,
        studentCount: cls.enrollments.length
      }))
    })
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a class
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('id')

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      )
    }

    // Check if class exists and belongs to the teacher
    const existingClass = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: user.id
      }
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found or you don't have permission to delete it" },
        { status: 404 }
      )
    }

    // Delete the class (this will also delete related enrollments and assignments due to cascade)
    await prisma.class.delete({
      where: { id: classId }
    })

    return NextResponse.json(
      {
        message: "Class deleted successfully"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    )
  }
}