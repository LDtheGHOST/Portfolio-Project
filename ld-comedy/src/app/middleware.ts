import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    console.log("=== MIDDLEWARE DEBUG ===")
    console.log("Path:", pathname)
    console.log("Token exists:", !!token)
    console.log("Token role:", token?.role)
    console.log("Token email:", token?.email)

    // Si l'utilisateur essaie d'accéder à un dashboard qui ne correspond pas à son rôle
    if (token?.role === "ARTIST" && pathname.startsWith("/dashboard-theatre")) {
      return NextResponse.redirect(new URL("/dashboard-artiste", req.url))
    }

    if (token?.role === "THEATER" && pathname.startsWith("/dashboard-artiste")) {
      return NextResponse.redirect(new URL("/dashboard-theatre", req.url))
    }

    // Si l'utilisateur n'a pas de rôle ou est en attente et essaie d'accéder à une page protégée
    if (
      token &&
      (!token.role || token.role === "PENDING") &&
      pathname !== "/choix-roles" &&
      !pathname.startsWith("/api") &&
      pathname !== "/connexion"
    ) {
      console.log("Redirecting to choix-roles - no role or PENDING")
      return NextResponse.redirect(new URL("/choix-roles", req.url))
    }

    // Si l'utilisateur a déjà un rôle et essaie d'accéder à la page de choix des rôles
    if (token?.role && token.role !== "PENDING" && pathname === "/choix-roles") {
      console.log("Redirecting from choix-roles to dashboard, role:", token.role)
      switch (token.role) {
        case "ARTIST":
          return NextResponse.redirect(new URL("/dashboard-artiste", req.url))
        case "THEATER":
          return NextResponse.redirect(new URL("/dashboard-theatre", req.url))
        default:
          return NextResponse.redirect(new URL("/", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        const publicPages = ["/", "/connexion", "/inscription", "/spectacles", "/comediens", "/actualites", "/contact"]
        
        if (publicPages.includes(pathname)) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard-artiste",
    "/dashboard-theatre",
    "/choix-roles",
    "/profil/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}