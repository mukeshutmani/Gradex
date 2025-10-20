import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for grading
const gradeSubmissionSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  marks: z.number().min(0, "Marks must be non-negative"),
  feedback: z.string().min(1, "Feedback is required"),
  status: z.enum(["submitted", "graded"]).optional(),
})

// POST - Update submission with grading results
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
    const validation = gradeSubmissionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { submissionId, marks, feedback, status } = validation.data

    // Find the submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            totalMarks: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      )
    }

    // Verify the submission belongs to the current user (students can only grade their own)
    // or user is a teacher/admin (for future teacher grading feature)
    if (submission.studentId !== user.id && user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to grade this submission" },
        { status: 403 }
      )
    }

    // Validate marks don't exceed total marks
    if (marks > submission.assignment.totalMarks) {
      return NextResponse.json(
        { error: `Marks cannot exceed total marks (${submission.assignment.totalMarks})` },
        { status: 400 }
      )
    }

    // Update the submission with grading results
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        marks,
        feedback,
        status: status || "graded",
        gradedAt: new Date()
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            totalMarks: true
          }
        },
        student: {
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
        message: "Submission graded successfully",
        submission: updatedSubmission
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error grading submission:", error)
    return NextResponse.json(
      { error: "Failed to grade submission" },
      { status: 500 }
    )
  }
}
