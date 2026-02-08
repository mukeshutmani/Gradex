import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE - Remove a failed/ungraded submission so student can resubmit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Find the submission
    const submission = await prisma.submission.findUnique({
      where: { id },
    })

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      )
    }

    // Only allow deleting own submissions
    if (submission.studentId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this submission" },
        { status: 403 }
      )
    }

    // Only allow deleting ungraded submissions (status != "graded")
    if (submission.status === "graded") {
      return NextResponse.json(
        { error: "Cannot delete a graded submission" },
        { status: 400 }
      )
    }

    await prisma.submission.delete({ where: { id } })

    return NextResponse.json({ message: "Submission deleted successfully" })
  } catch (error) {
    console.error("Error deleting submission:", error)
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 500 }
    )
  }
}
