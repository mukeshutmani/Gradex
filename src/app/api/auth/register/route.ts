import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["client", "student"]).default("client"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      )
    }

    
    const { username, email, password, role } = validation.data
    
    // Check for existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists", field: "email" },
        { status: 409 }
      )
    }

    // Check for existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken", field: "username" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}