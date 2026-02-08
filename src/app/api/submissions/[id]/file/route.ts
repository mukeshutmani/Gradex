import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"

function getFileExtension(fileUrl: string): string {
  const extMatch = fileUrl.match(/\.(\w+)$/)
  if (extMatch) return extMatch[1].toLowerCase()
  // If no extension, check URL patterns
  if (fileUrl.includes("/raw/upload/")) return "pdf"
  return "pdf" // default
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  }
  return types[ext] || "application/octet-stream"
}

// GET - Download submission file
export async function GET(
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

    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { fileUrl: true, studentId: true, assignment: { select: { teacherId: true } } },
    })

    if (!submission || !submission.fileUrl) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    // Allow both the student who submitted and the teacher who owns the assignment
    const isOwner = submission.studentId === session.user.id
    const isTeacher = submission.assignment.teacherId === session.user.id
    if (!isOwner && !isTeacher) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      )
    }

    // Extract public_id from Cloudinary URL
    const match = submission.fileUrl.match(/\/(?:image|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[^./]+)?$/)
    if (!match) {
      return NextResponse.json(
        { error: "Invalid file URL" },
        { status: 400 }
      )
    }

    const publicId = match[1]
    const ext = getFileExtension(submission.fileUrl)
    const contentType = getContentType(ext)
    const fileName = `submission-${id}.${ext}`

    // Try 1: private_download_url (serves actual file, not ZIP)
    try {
      const privateUrl = cloudinary.utils.private_download_url(publicId, ext, {
        resource_type: "image",
        type: "upload",
      })

      const privateRes = await fetch(privateUrl)
      if (privateRes.ok) {
        const buffer = await privateRes.arrayBuffer()
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Content-Length": buffer.byteLength.toString(),
          },
        })
      }
    } catch {
      // Fall through to next method
    }

    // Try 2: Direct Cloudinary URL (works if PDF delivery is unblocked)
    try {
      const directRes = await fetch(submission.fileUrl)
      if (directRes.ok) {
        const buffer = await directRes.arrayBuffer()
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Content-Length": buffer.byteLength.toString(),
          },
        })
      }
    } catch {
      // Fall through to ZIP fallback
    }

    // Fallback: ZIP download via Cloudinary Admin API (always works)
    const zipUrl = cloudinary.utils.download_zip_url({
      public_ids: [publicId],
      resource_type: "image",
      flatten_folders: true,
    })

    return NextResponse.redirect(zipUrl)
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    )
  }
}
