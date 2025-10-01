import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Create sample data for demonstration
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

    // Create sample class
    const sampleClass = await prisma.class.create({
      data: {
        name: "Mathematics Grade 10 - Demo",
        description: "Sample mathematics class for demonstration",
        classCode: "DEMO10",
        teacherId: user.id,
      }
    })

    // Create sample assignments
    const assignments = await Promise.all([
      prisma.assignment.create({
        data: {
          title: "Algebra Basics - Solving Linear Equations",
          subject: "Mathematics",
          description: "Solve the following linear equations and show your work step by step.",
          textContent: "1. Solve for x: 2x + 5 = 15\n2. Solve for y: 3y - 7 = 14\n3. Solve for z: 5z + 3 = 2z + 15",
          totalMarks: 30,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          teacherId: user.id,
          classId: sampleClass.id,
        }
      }),
      prisma.assignment.create({
        data: {
          title: "Scientific Method Essay",
          subject: "Science",
          description: "Write a short essay explaining the steps of the scientific method with examples.",
          totalMarks: 25,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          teacherId: user.id,
          classId: sampleClass.id,
        }
      }),
      prisma.assignment.create({
        data: {
          title: "Book Review - To Kill a Mockingbird",
          subject: "English Literature",
          description: "Write a comprehensive book review discussing the main themes and characters.",
          totalMarks: 40,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          teacherId: user.id,
          classId: sampleClass.id,
        }
      }),
      // Past due assignment for testing
      prisma.assignment.create({
        data: {
          title: "History Quiz - World War II",
          subject: "History",
          description: "Answer questions about key events and figures of World War II.",
          totalMarks: 20,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
          teacherId: user.id,
          classId: sampleClass.id,
        }
      })
    ])

    // Create sample submissions with AI grades
    const sampleSubmissions = [
      {
        assignmentId: assignments[0].id, // Math assignment
        content: `1. Solve for x: 2x + 5 = 15
Solution:
2x + 5 = 15
2x = 15 - 5
2x = 10
x = 5

2. Solve for y: 3y - 7 = 14
Solution:
3y - 7 = 14
3y = 14 + 7
3y = 21
y = 7

3. Solve for z: 5z + 3 = 2z + 15
Solution:
5z + 3 = 2z + 15
5z - 2z = 15 - 3
3z = 12
z = 4

All equations have been solved step by step with proper mathematical reasoning.`,
        marks: 28,
        feedback: "Excellent work! You demonstrated strong understanding of linear equations with clear step-by-step solutions. All answers are correct and well-organized. Keep up the great work!"
      },
      {
        assignmentId: assignments[1].id, // Science assignment
        content: `The Scientific Method: A Systematic Approach to Understanding

The scientific method is a systematic approach used by scientists to investigate phenomena and acquire knowledge. It consists of several key steps:

1. Observation: Scientists begin by observing something interesting in the natural world that raises questions.

2. Question Formation: Based on observations, scientists formulate specific questions about what they observed.

3. Hypothesis: A testable explanation or prediction is developed to answer the question.

4. Experimentation: Controlled experiments are designed and conducted to test the hypothesis.

5. Data Collection and Analysis: Results from experiments are collected, measured, and analyzed.

6. Conclusion: Based on the data analysis, scientists draw conclusions about whether the hypothesis was supported or rejected.

Example: A scientist observes that plants near a window grow taller (observation), asks why this happens (question), hypothesizes that sunlight affects plant growth (hypothesis), conducts an experiment with plants in different light conditions (experimentation), measures plant heights over time (data collection), and concludes that sunlight does indeed promote plant growth (conclusion).

This method ensures that scientific knowledge is based on evidence rather than opinion.`,
        marks: 23,
        feedback: "Very good submission! You show excellent understanding of the scientific method with clear explanations and a relevant example. Your essay is well-structured and demonstrates scientific thinking. Consider adding more specific details about experimental controls to strengthen your explanation."
      }
    ]

    for (const sub of sampleSubmissions) {
      await prisma.submission.create({
        data: {
          assignmentId: sub.assignmentId,
          studentId: user.id,
          content: sub.content,
          marks: sub.marks,
          feedback: sub.feedback,
          status: "graded",
        }
      })
    }

    return NextResponse.json(
      {
        message: "Sample data created successfully!",
        class: sampleClass,
        assignments: assignments.length,
        submissions: sampleSubmissions.length
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating sample data:", error)
    return NextResponse.json(
      { error: "Failed to create sample data" },
      { status: 500 }
    )
  }
}