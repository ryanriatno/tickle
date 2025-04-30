import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth routes - redirect to dashboard if already authenticated
  if (session && (req.nextUrl.pathname === "/signin" || req.nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Protected routes - redirect to signin if not authenticated
  if (
    !session &&
    req.nextUrl.pathname !== "/signin" &&
    req.nextUrl.pathname !== "/signup" &&
    !req.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.redirect(new URL("/signin", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
