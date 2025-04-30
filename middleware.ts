import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition
  if (!session && !req.nextUrl.pathname.startsWith("/signin") && !req.nextUrl.pathname.startsWith("/signup")) {
    // Redirect to login if accessing protected routes and not authenticated
    const redirectUrl = new URL("/signin", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and trying to access auth pages, redirect to dashboard
  if (session && (req.nextUrl.pathname.startsWith("/signin") || req.nextUrl.pathname.startsWith("/signup"))) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
