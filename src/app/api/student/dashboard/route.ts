import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch student dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Fetch student's enrolled classes
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        studentId: userId,
        status: "active"
      },
      include: {
        class: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true
              }
            },
            assignments: {
              include: {
                submissions: {
                  where: {
                    studentId: userId
                  },
                  select: {
                    id: true,
                    marks: true,
                    status: true,
                    submittedAt: true
                  }
                }
              },
              orderBy: {
                dueDate: 'asc'
              }
            }
          }
        }
      }
    })

    // Fetch all assignments from enrolled classes
    const allAssignments = []
    const classes = []

    for (const enrollment of enrollments) {
      const classInfo = {
        id: enrollment.class.id,
        name: enrollment.class.name,
        description: enrollment.class.description,
        classCode: enrollment.class.classCode,
        teacher: {
          id: enrollment.class.teacher.id,
          name: enrollment.class.teacher.username || enrollment.class.teacher.name || enrollment.class.teacher.email,
          email: enrollment.class.teacher.email
        },
        assignments: enrollment.class.assignments.map(assignment => ({
          id: assignment.id,
          title: assignment.title,
          subject: assignment.subject,
          description: assignment.description,
          textContent: assignment.textContent,
          imageUrl: assignment.imageUrl,
          totalMarks: assignment.totalMarks,
          dueDate: assignment.dueDate.toISOString(),
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
          teacherId: assignment.teacherId,
          submission: assignment.submissions[0] || null
        }))
      }

      classes.push(classInfo)

      // Add assignments to the all assignments list
      for (const assignment of enrollment.class.assignments) {
        allAssignments.push({
          id: assignment.id,
          title: assignment.title,
          subject: assignment.subject,
          description: assignment.description,
          textContent: assignment.textContent,
          imageUrl: assignment.imageUrl,
          totalMarks: assignment.totalMarks,
          dueDate: assignment.dueDate.toISOString(),
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
          teacherId: assignment.teacherId,
          class: {
            name: enrollment.class.name,
            teacher: {
              name: enrollment.class.teacher.username || enrollment.class.teacher.name || enrollment.class.teacher.email
            }
          },
          submission: assignment.submissions[0] || null
        })
      }
    }

    // Also fetch assignments from direct teacher-student relationships
    const teacherStudentRelations = await prisma.studentTeacher.findMany({
      where: {
        studentId: userId,
        status: "active"
      },
      include: {
        teacher: {
          include: {
            assignments: {
              where: {
                classId: null // Only assignments not assigned to specific classes
              },
              include: {
                submissions: {
                  where: {
                    studentId: userId
                  },
                  select: {
                    id: true,
                    marks: true,
                    status: true,
                    submittedAt: true
                  }
                }
              },
              orderBy: {
                dueDate: 'asc'
              }
            }
          }
        }
      }
    })

    // Add direct teacher assignments
    for (const relation of teacherStudentRelations) {
      for (const assignment of relation.teacher.assignments) {
        allAssignments.push({
          id: assignment.id,
          title: assignment.title,
          subject: assignment.subject,
          description: assignment.description,
          textContent: assignment.textContent,
          imageUrl: assignment.imageUrl,
          totalMarks: assignment.totalMarks,
          dueDate: assignment.dueDate.toISOString(),
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
          teacherId: assignment.teacherId,
          class: {
            name: "Direct Assignment",
            teacher: {
              name: relation.teacher.username || relation.teacher.name || relation.teacher.email
            }
          },
          submission: assignment.submissions[0] || null
        })
      }
    }

    // Sort assignments by due date
    allAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    return NextResponse.json({
      classes,
      assignments: allAssignments,
      stats: {
        totalClasses: classes.length,
        totalAssignments: allAssignments.length,
        submittedAssignments: allAssignments.filter(a =>
          a.submission && (a.submission.status === "graded" || a.submission.status === "submitted")
        ).length,
        pendingAssignments: allAssignments.filter(a =>
          !a.submission || a.submission.status === "pending"
        ).length,
        overdueAssignments: allAssignments.filter(a =>
          new Date(a.dueDate) < new Date() && (!a.submission || a.submission.status === "pending")
        ).length
      }
    })
  } catch (error) {
    console.error("Error fetching student dashboard:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}