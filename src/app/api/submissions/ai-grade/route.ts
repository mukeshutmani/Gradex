import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type FileType = "pdf" | "image" | "unsupported"

function isValidCloudinaryUrl(fileUrl: string): boolean {
  try {
    const parsed = new URL(fileUrl)
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".cloudinary.com")
  } catch {
    return false
  }
}

function detectFileType(fileUrl: string): FileType {
  if (!isValidCloudinaryUrl(fileUrl)) return "unsupported"
  const url = fileUrl.toLowerCase()

  if (url.endsWith(".pdf") || url.includes("/raw/upload/")) return "pdf"

  if (url.includes("/image/upload/")) {
    if (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") ||
        url.endsWith(".gif") || url.endsWith(".webp")) {
      return "image"
    }
    return "image"
  }

  return "unsupported"
}

function getImageMediaType(fileUrl: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const url = fileUrl.toLowerCase()
  if (url.includes(".png")) return "image/png"
  if (url.includes(".gif")) return "image/gif"
  if (url.includes(".webp")) return "image/webp"
  return "image/jpeg"
}

async function fetchAsBase64(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer).toString("base64")
}

async function addFileToContent(
  content: Anthropic.ContentBlockParam[],
  fileUrl: string,
  fileType: FileType
) {
  if (fileType === "pdf") {
    const base64Data = await fetchAsBase64(fileUrl)
    content.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: base64Data },
    } as Anthropic.DocumentBlockParam)
  } else if (fileType === "image") {
    const base64Data = await fetchAsBase64(fileUrl)
    content.push({
      type: "image",
      source: { type: "base64", media_type: getImageMediaType(fileUrl), data: base64Data },
    } as Anthropic.ImageBlockParam)
  }
}

async function buildMessageContent(
  gradingPrompt: string,
  studentFileUrl: string | null,
  studentFileType: FileType | null,
  assignmentFileUrl: string | null,
): Promise<Anthropic.MessageCreateParams["messages"][0]["content"]> {
  const hasStudentFile = studentFileUrl && studentFileType && studentFileType !== "unsupported"
  const assignmentFileType = assignmentFileUrl ? detectFileType(assignmentFileUrl) : null
  const hasAssignmentFile = assignmentFileUrl && assignmentFileType && assignmentFileType !== "unsupported"

  if (!hasStudentFile && !hasAssignmentFile) {
    return gradingPrompt
  }

  const content: Anthropic.ContentBlockParam[] = []

  // Add teacher's assignment file first (context)
  if (hasAssignmentFile) {
    content.push({ type: "text", text: "TEACHER'S ASSIGNMENT FILE (reference material):" } as Anthropic.TextBlockParam)
    await addFileToContent(content, assignmentFileUrl!, assignmentFileType!)
  }

  // Add student's submission file
  if (hasStudentFile) {
    content.push({ type: "text", text: "STUDENT'S SUBMISSION FILE:" } as Anthropic.TextBlockParam)
    await addFileToContent(content, studentFileUrl!, studentFileType!)
  }

  content.push({ type: "text", text: gradingPrompt })
  return content
}

// Simple text similarity using word overlap (Jaccard similarity)
function textSimilarity(text1: string, text2: string): number {
  const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 2)
  const words1 = new Set(normalize(text1))
  const words2 = new Set(normalize(text2))
  if (words1.size === 0 || words2.size === 0) return 0
  const intersection = new Set([...words1].filter(w => words2.has(w)))
  return intersection.size / Math.max(words1.size, words2.size)
}

// Check for duplicate/similar submissions in the same assignment
async function checkForDuplicates(
  assignmentId: string,
  currentSubmissionId: string,
  currentContent: string | null,
  currentFileUrl: string | null
): Promise<{ isDuplicate: boolean; similarStudent: string | null; similarity: number }> {
  const otherSubmissions = await prisma.submission.findMany({
    where: {
      assignmentId,
      id: { not: currentSubmissionId },
    },
    select: {
      content: true,
      fileUrl: true,
      student: { select: { name: true } },
    }
  })

  if (otherSubmissions.length === 0) {
    return { isDuplicate: false, similarStudent: null, similarity: 0 }
  }

  let highestSimilarity = 0
  let similarStudent: string | null = null

  for (const other of otherSubmissions) {
    // Check text content similarity
    if (currentContent?.trim() && other.content?.trim()) {
      const sim = textSimilarity(currentContent, other.content)
      if (sim > highestSimilarity) {
        highestSimilarity = sim
        similarStudent = other.student.name || "Another student"
      }
    }

    // Check if exact same file was uploaded
    if (currentFileUrl && other.fileUrl && currentFileUrl === other.fileUrl) {
      highestSimilarity = 1.0
      similarStudent = other.student.name || "Another student"
      break
    }
  }

  return {
    isDuplicate: highestSimilarity >= 0.8,
    similarStudent: highestSimilarity >= 0.8 ? similarStudent : null,
    similarity: Math.round(highestSimilarity * 100)
  }
}

// POST - AI Grade a submission
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { submissionId } = body

    if (!submissionId) {
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 }
      )
    }

    // Find the submission with assignment details
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            subject: true,
            description: true,
            textContent: true,
            totalMarks: true,
            imageUrl: true,
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Get submission content - handle both text and file submissions
    const submissionContent = submission.content || ""
    const hasFile = !!submission.fileUrl
    const hasText = !!submissionContent.trim()

    // No content and no file - cannot grade
    if (!hasText && !hasFile) {
      await prisma.submission.delete({ where: { id: submissionId } })
      return NextResponse.json(
        { error: "No submission content to grade. Your submission has been removed so you can try again." },
        { status: 400 }
      )
    }

    // Detect file type for AI vision grading
    const fileType = hasFile ? detectFileType(submission.fileUrl!) : null
    const canAIGradeFile = fileType === "pdf" || fileType === "image"

    // File-only submission with unsupported type - needs manual review
    if (!hasText && hasFile && !canAIGradeFile) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: "submitted",
          feedback: "File submission received. DOC/DOCX files require manual review by your teacher.",
        }
      })

      return NextResponse.json({
        success: true,
        requiresManualReview: true,
        message: "File submitted successfully. Your teacher will review and grade it manually.",
        submission: await prisma.submission.findUnique({ where: { id: submissionId } })
      })
    }

    // Check for duplicate submissions
    const duplicateCheck = await checkForDuplicates(
      submission.assignmentId,
      submissionId,
      submissionContent,
      submission.fileUrl
    )

    // Check if assignment has enough context for meaningful grading
    const hasDescription = !!submission.assignment.description?.trim()
    const hasAssignmentContent = !!submission.assignment.textContent?.trim()
    const hasAssignmentFile = !!submission.assignment.imageUrl
    const hasContext = hasDescription || hasAssignmentContent || hasAssignmentFile

    // Build the grading prompt
    const hasVisualFile = hasFile && canAIGradeFile

    let studentAnswerSection: string
    if (hasText && hasVisualFile) {
      studentAnswerSection = `The student submitted both text and a ${fileType === "pdf" ? "PDF document" : "image"} (attached above). Evaluate both together.

TEXT CONTENT:
${submissionContent}`
    } else if (hasVisualFile) {
      studentAnswerSection = `The student submitted a ${fileType === "pdf" ? "PDF document" : "image"} (attached above). Read and evaluate its contents carefully. If it contains handwritten work, do your best to read it. If parts are unreadable, note that in your feedback.`
    } else {
      studentAnswerSection = submissionContent
    }

    const duplicateWarning = duplicateCheck.isDuplicate
      ? `\nDUPLICATE ALERT: This submission is ${duplicateCheck.similarity}% similar to another student's submission. Factor this into your grading — deduct marks significantly if the work appears copied.`
      : ""

    const gradingPrompt = `You are a teacher grading a student's assignment. Be concise.

ASSIGNMENT:
- Title: ${submission.assignment.title}
- Subject: ${submission.assignment.subject}
${hasDescription ? `- Description: ${submission.assignment.description}` : ""}
${hasAssignmentContent ? `- Questions/Content: ${submission.assignment.textContent}` : ""}
${hasAssignmentFile ? `- The teacher also uploaded an assignment file (attached above as "TEACHER'S ASSIGNMENT FILE"). Use it as the reference for grading.` : ""}
- Total Marks: ${submission.assignment.totalMarks}
${duplicateWarning}
STUDENT'S ANSWER:
${studentAnswerSection}

GRADING RULES:
${!hasContext ? `- Grade based on the assignment title, subject, and quality of the student's response.` : `- Grade strictly based on how well the student answered the assignment requirements.`}
- Be SHORT and SPECIFIC. No generic advice.

Respond in JSON only:
{
  "marks": <number 0-${submission.assignment.totalMarks}>,
  "good": "<1-2 sentences: what the student did well>",
  "improve": "<1-2 sentences: what specifically needs improvement, or 'Nothing major' if excellent>"
}`

    // Call Anthropic Claude API
    let messageContent: Anthropic.MessageCreateParams["messages"][0]["content"]
    let message: Anthropic.Message
    try {
      messageContent = await buildMessageContent(
        gradingPrompt,
        hasVisualFile ? submission.fileUrl! : null,
        fileType,
        submission.assignment.imageUrl || null
      )

      message = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 300,
        system: "You are a concise grader. Respond with valid JSON only. Keep feedback SHORT: 1-2 sentences for what's good, 1-2 sentences for what to improve. Never write long paragraphs.",
        messages: [
          {
            role: "user",
            content: messageContent
          }
        ],
        temperature: 0.3,
      })
    } catch (apiError) {
      // If file download or vision processing fails, fall back to manual review
      if (hasVisualFile) {
        console.error("File processing failed, falling back to manual review:", apiError instanceof Error ? apiError.message : apiError)
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: "submitted",
            feedback: "File submission received. AI was unable to process this file. Your teacher will review and grade it manually.",
          }
        })
        return NextResponse.json({
          success: true,
          requiresManualReview: true,
          message: "File submitted successfully. Your teacher will review and grade it manually.",
          submission: await prisma.submission.findUnique({ where: { id: submissionId } })
        })
      }
      throw apiError
    }

    const responseContent = message.content[0]?.type === "text" ? message.content[0].text : null

    if (!responseContent) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      )
    }

    // Parse the AI response
    let parsedResult: {
      marks: number
      good?: string
      improve?: string
      feedback?: string
    }

    try {
      let cleanedResponse = responseContent.trim()
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.slice(7)
      }
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.slice(3)
      }
      if (cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.slice(0, -3)
      }

      parsedResult = JSON.parse(cleanedResponse.trim())
    } catch {
      console.error("Failed to parse AI response:", responseContent)
      return NextResponse.json(
        { error: "Failed to parse AI grading response" },
        { status: 500 }
      )
    }

    // Validate the marks
    const marks = Math.min(Math.max(0, Math.round(parsedResult.marks)), submission.assignment.totalMarks)

    // Build concise feedback
    let feedback = ""
    if (parsedResult.good && parsedResult.improve) {
      feedback = `✅ ${parsedResult.good}\n\n⚠️ ${parsedResult.improve}`
    } else {
      feedback = parsedResult.feedback || parsedResult.good || "No feedback provided"
    }

    // Add duplicate warning to feedback
    if (duplicateCheck.isDuplicate) {
      feedback = `🚨 Duplicate Alert: ${duplicateCheck.similarity}% match with ${duplicateCheck.similarStudent}. Marks deducted.\n\n${feedback}`
    }

    // Calculate percentage and grade letter
    const percentage = (marks / submission.assignment.totalMarks) * 100
    const grade = getGradeLetter(percentage)

    // Update the submission with the grading results
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        marks,
        feedback,
        status: "graded",
        gradedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      marks,
      totalMarks: submission.assignment.totalMarks,
      percentage,
      grade,
      feedback,
      duplicate: duplicateCheck.isDuplicate ? {
        similarity: duplicateCheck.similarity,
        similarStudent: duplicateCheck.similarStudent
      } : null,
      submission: updatedSubmission
    })

  } catch (error) {
    console.error("Error in AI grading:", error)

    // Check for Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid Anthropic API key. Please check your configuration." },
          { status: 500 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to grade submission" },
      { status: 500 }
    )
  }
}

function getGradeLetter(percentage: number): string {
  if (percentage >= 90) return "A+"
  if (percentage >= 85) return "A"
  if (percentage >= 80) return "A-"
  if (percentage >= 75) return "B+"
  if (percentage >= 70) return "B"
  if (percentage >= 65) return "B-"
  if (percentage >= 60) return "C+"
  if (percentage >= 55) return "C"
  if (percentage >= 50) return "C-"
  return "F"
}
