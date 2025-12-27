import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
})

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

    // Get submission content
    const submissionContent = submission.content || ""

    if (!submissionContent.trim()) {
      return NextResponse.json(
        { error: "No submission content to grade" },
        { status: 400 }
      )
    }

    // Build the grading prompt
    const gradingPrompt = `You are an expert teacher grading a student's assignment submission.

ASSIGNMENT DETAILS:
- Title: ${submission.assignment.title}
- Subject: ${submission.assignment.subject}
- Description: ${submission.assignment.description || "No description provided"}
- Assignment Content/Questions: ${submission.assignment.textContent || "No specific questions provided"}
- Total Marks: ${submission.assignment.totalMarks}

STUDENT'S SUBMISSION:
${submissionContent}

Please grade this submission and provide:
1. A score out of ${submission.assignment.totalMarks} marks
2. Detailed constructive feedback explaining the grade

Consider the following criteria:
- Accuracy and correctness of the content
- Completeness (did they answer all parts?)
- Quality of explanation and understanding demonstrated
- Grammar, spelling, and presentation
- Relevance to the assignment topic

IMPORTANT: Respond in the following JSON format ONLY:
{
  "marks": <number between 0 and ${submission.assignment.totalMarks}>,
  "feedback": "<detailed feedback string explaining the grade and areas for improvement>"
}

Be fair but constructive in your grading. Provide specific feedback that helps the student improve.`

    // Call OpenRouter API (using free model)
    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        {
          role: "system",
          content: "You are an expert educational grader. You provide fair, accurate, and constructive feedback. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: gradingPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      )
    }

    // Parse the AI response
    let gradingResult: { marks: number; feedback: string }

    try {
      // Clean up the response in case it has markdown code blocks
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

      gradingResult = JSON.parse(cleanedResponse.trim())
    } catch {
      console.error("Failed to parse AI response:", responseContent)
      return NextResponse.json(
        { error: "Failed to parse AI grading response" },
        { status: 500 }
      )
    }

    // Validate the marks
    const marks = Math.min(Math.max(0, Math.round(gradingResult.marks)), submission.assignment.totalMarks)
    const feedback = gradingResult.feedback || "No feedback provided"

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
      submission: updatedSubmission
    })

  } catch (error) {
    console.error("Error in AI grading:", error)

    // Check for OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid OpenAI API key. Please check your configuration." },
          { status: 500 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "OpenAI rate limit exceeded. Please try again later." },
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
