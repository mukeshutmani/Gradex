import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import cloudinary from "@/lib/cloudinary"

// Force Node.js runtime for file operations
export const runtime = 'nodejs'

// Simple AI grading function (mock implementation)
async function gradeSubmission(assignment: any, content: string): Promise<{ marks: number, feedback: string }> {
  // This is a simple mock AI grading system
  // In a real implementation, you would integrate with OpenAI, Google AI, or other AI services

  const totalMarks = assignment.totalMarks
  const subject = assignment.subject.toLowerCase()
  const assignmentTitle = assignment.title.toLowerCase()

  // Basic scoring algorithm based on content length and keywords
  let score = 0
  let feedback = ""

  // Content length scoring (30% of marks)
  const wordCount = content.trim().split(/\s+/).length
  const lengthScore = Math.min(wordCount / 50, 1) * 0.3 // 50 words = full length score
  score += lengthScore

  // Subject-specific keyword scoring (40% of marks)
  let keywordScore = 0
  const mathKeywords = ['equation', 'solve', 'calculate', 'formula', 'result', 'answer', 'x', 'y', 'graph', 'function']
  const scienceKeywords = ['hypothesis', 'experiment', 'observation', 'conclusion', 'data', 'analysis', 'theory', 'scientific', 'method']
  const englishKeywords = ['character', 'theme', 'plot', 'analysis', 'author', 'metaphor', 'symbolism', 'narrative', 'literary']
  const historyKeywords = ['event', 'historical', 'period', 'cause', 'effect', 'timeline', 'civilization', 'culture', 'political']

  let relevantKeywords: string[] = []
  if (subject.includes('math')) relevantKeywords = mathKeywords
  else if (subject.includes('science') || subject.includes('physics') || subject.includes('chemistry') || subject.includes('biology')) relevantKeywords = scienceKeywords
  else if (subject.includes('english') || subject.includes('literature')) relevantKeywords = englishKeywords
  else if (subject.includes('history') || subject.includes('social')) relevantKeywords = historyKeywords
  else relevantKeywords = [...mathKeywords, ...scienceKeywords, ...englishKeywords] // General keywords

  const contentLower = content.toLowerCase()
  const foundKeywords = relevantKeywords.filter(keyword => contentLower.includes(keyword))
  keywordScore = Math.min(foundKeywords.length / 5, 1) * 0.4 // 5 keywords = full keyword score
  score += keywordScore

  // Structure and effort scoring (30% of marks)
  const hasProperStructure = content.includes('\n') || content.length > 100
  const hasConclusion = contentLower.includes('conclusion') || contentLower.includes('therefore') || contentLower.includes('in summary')
  const hasExplanation = contentLower.includes('because') || contentLower.includes('since') || contentLower.includes('explain')

  let structureScore = 0
  if (hasProperStructure) structureScore += 0.1
  if (hasConclusion) structureScore += 0.1
  if (hasExplanation) structureScore += 0.1
  score += structureScore

  // Calculate final marks
  const finalMarks = Math.round(score * totalMarks)
  const percentage = (finalMarks / totalMarks) * 100

  // Generate feedback based on performance
  if (percentage >= 90) {
    feedback = "Excellent work! Your answer demonstrates strong understanding of the topic with clear explanations and proper structure. Keep up the great work!"
  } else if (percentage >= 80) {
    feedback = "Very good submission! You show good understanding of the concepts. Consider adding more detailed explanations to strengthen your answer."
  } else if (percentage >= 70) {
    feedback = "Good effort! Your answer covers the main points but could benefit from more depth and examples. Try to elaborate more on your explanations."
  } else if (percentage >= 60) {
    feedback = "Satisfactory work. Your answer addresses some key points but needs more development. Consider including more relevant details and explanations."
  } else if (percentage >= 50) {
    feedback = "Your submission shows some understanding but needs significant improvement. Try to include more relevant content and structure your answer better."
  } else {
    feedback = "Your answer needs more work. Please review the assignment requirements and provide more detailed explanations with relevant examples."
  }

  // Add specific suggestions based on what was missing
  const suggestions = []
  if (wordCount < 30) suggestions.push("Try to write more detailed explanations")
  if (foundKeywords.length < 2) suggestions.push(`Include more ${subject}-specific terminology`)
  if (!hasConclusion) suggestions.push("Add a conclusion to summarize your main points")
  if (!hasExplanation) suggestions.push("Provide reasoning for your answers using 'because' or 'since'")

  if (suggestions.length > 0) {
    feedback += "\n\nSuggestions for improvement:\n• " + suggestions.join("\n• ")
  }

  return {
    marks: Math.max(finalMarks, 1), // Minimum 1 mark for effort
    feedback
  }
}

// Validation schema for submission
const createSubmissionSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  content: z.string().optional(),
})

// POST - Submit assignment
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

    const formData = await request.formData()
    const assignmentId = formData.get('assignmentId') as string
    const content = formData.get('content') as string
    const file = formData.get('file') as File | null

    // Validate required fields
    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      )
    }

    if (!content?.trim() && !file) {
      return NextResponse.json(
        { error: "Please provide either written content or upload a file" },
        { status: 400 }
      )
    }

    // Find the assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
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

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    // Check if assignment is past due (allow late submission with warning)
    const isOverdue = new Date(assignment.dueDate) < new Date()

    // Check if student already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId: user.id
        }
      }
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted this assignment" },
        { status: 400 }
      )
    }

    // Handle file upload
    let fileUrl = null
    if (file) {
      // Check if Cloudinary is configured
      const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                           process.env.CLOUDINARY_API_KEY &&
                           process.env.CLOUDINARY_API_SECRET &&
                           process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here'

      if (useCloudinary) {
        // Upload to Cloudinary
        try {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64Data = buffer.toString('base64')
          const dataURI = `data:${file.type};base64,${base64Data}`

          // Remove extension from filename to avoid double extension
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '_')

          // Detect if file is PDF or image
          const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
          const resourceType = isPDF ? 'raw' : 'auto' // Use 'raw' for PDFs to enable direct viewing

          const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: 'gradex/submissions',
            resource_type: resourceType,
            public_id: `${Date.now()}-${fileNameWithoutExt}`,
            type: 'upload',
            access_mode: 'public',
            invalidate: true,
          })

          fileUrl = uploadResponse.secure_url
          console.log(`File uploaded to Cloudinary: ${fileUrl}`)
        } catch (error) {
          console.error('Error uploading to Cloudinary:', error)
          return NextResponse.json(
            { error: "Failed to upload file to Cloudinary. Please check your credentials." },
            { status: 500 }
          )
        }
      } else {
        // Fallback: Save to local storage
        console.log('Cloudinary not configured, using local storage')
        try {
          const fs = require('fs').promises
          const path = require('path')

          const uploadDir = path.join(process.cwd(), 'public', 'uploads')
          await fs.mkdir(uploadDir, { recursive: true })

          const timestamp = Date.now()
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const fileName = `${timestamp}-${sanitizedFileName}`
          const filePath = path.join(uploadDir, fileName)

          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          await fs.writeFile(filePath, buffer)

          fileUrl = `/uploads/${fileName}`
          console.log(`File saved locally: ${filePath}`)
        } catch (error) {
          console.error('Error saving file locally:', error)
          return NextResponse.json(
            { error: "Failed to save uploaded file" },
            { status: 500 }
          )
        }
      }
    }

    // Don't auto-grade immediately - let the AI grading modal handle it
    // This allows for the step-by-step grading UI experience

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId: assignment.id,
        studentId: user.id,
        content: content || null,
        fileUrl: fileUrl,
        marks: null,
        feedback: null,
        status: "submitted",
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
        message: isOverdue
          ? "Late submission accepted. AI grading will begin now."
          : "Assignment submitted successfully! AI grading in progress...",
        submission,
        isLate: isOverdue
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error submitting assignment:", error)
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    )
  }
}

// GET - Fetch user's submissions
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

    // Fetch user's submissions
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: user.id
      },
      include: {
        assignment: {
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
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json({
      submissions
    })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    )
  }
}