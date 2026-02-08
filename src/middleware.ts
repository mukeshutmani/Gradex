import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Role-based route protection for dashboard routes
    if (pathname.startsWith("/dashboard/student/") && token?.role !== "student") {
      // Non-students trying to access student dashboard -> redirect to /dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (pathname.startsWith("/dashboard/teacher/") && token?.role !== "client") {
      // Non-teachers trying to access teacher dashboard -> redirect to /dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Username mismatch check for student dashboard
    if (pathname.startsWith("/dashboard/student/") && token?.role === "student") {
      const urlUsername = pathname.split("/dashboard/student/")[1]?.split("/")[0]
      const sessionUsername = (token.username as string) || (token.email as string)
      if (urlUsername && sessionUsername && urlUsername !== sessionUsername) {
        return NextResponse.redirect(
          new URL(`/dashboard/student/${sessionUsername}`, req.url)
        )
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/protected/:path*",
    "/dashboard/:path*"
  ]
}
