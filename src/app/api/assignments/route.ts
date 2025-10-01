import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for assignment creation
const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  textContent: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  totalMarks: z.number().min(1, "Total marks must be at least 1"),
  dueDate: z.string().datetime("Invalid due date format"),
})

// GET - Fetch assignments for the authenticated teacher
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

    // Fetch assignments created by this teacher
    const assignments = await prisma.assignment.findMany({
      where: {
        teacherId: user.id
      },
      include: {
        submissions: {
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
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

// POST - Create a new assignment
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
    const validationResult = createAssignmentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const {
      title,
      subject,
      description,
      textContent,
      imageUrl,
      totalMarks,
      dueDate,
    } = validationResult.data

    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        subject,
        description,
        textContent,
        imageUrl: imageUrl || null,
        totalMarks,
        dueDate: new Date(dueDate),
        teacherId: user.id,
      },
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

    return NextResponse.json(
      {
        message: "Assignment created successfully",
        assignment
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}

// PUT - Update an existing assignment
export async function PUT(request: NextRequest) {
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
    const { assignmentId, ...updateData } = body

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      )
    }

    // Validate the request data
    const validationResult = createAssignmentSchema.safeParse(updateData)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const {
      title,
      subject,
      description,
      textContent,
      imageUrl,
      totalMarks,
      dueDate,
    } = validationResult.data

    // Check if assignment exists and belongs to the teacher
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        teacherId: user.id
      }
    })

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found or you don't have permission to edit it" },
        { status: 404 }
      )
    }

    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        title,
        subject,
        description,
        textContent,
        imageUrl: imageUrl || null,
        totalMarks,
        dueDate: new Date(dueDate),
      },
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

    return NextResponse.json(
      {
        message: "Assignment updated successfully",
        assignment: updatedAssignment
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    )
  }
}

// DELETE - Delete an assignment
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
    const assignmentId = searchParams.get('id')

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      )
    }

    // Check if assignment exists and belongs to the teacher
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        teacherId: user.id
      }
    })

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found or you don't have permission to delete it" },
        { status: 404 }
      )
    }

    // Delete the assignment (this will also delete related submissions due to cascade)
    await prisma.assignment.delete({
      where: { id: assignmentId }
    })

    return NextResponse.json(
      {
        message: "Assignment deleted successfully"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    )
  }
}