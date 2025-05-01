import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = req.cookies.get(name)
          return cookie?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        },
      },
    }
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Auth routes - redirect to dashboard if already authenticated
    if (user && (req.nextUrl.pathname === "/signin" || req.nextUrl.pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Protected routes - redirect to signin if not authenticated
    if (
      !user &&
      req.nextUrl.pathname !== "/signin" &&
      req.nextUrl.pathname !== "/signup" &&
      !req.nextUrl.pathname.startsWith("/api/auth") &&
      !req.nextUrl.pathname.startsWith("/_next") &&
      !req.nextUrl.pathname.includes(".")
    ) {
      return NextResponse.redirect(new URL("/signin", req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // If there's an error, allow the request to proceed
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
