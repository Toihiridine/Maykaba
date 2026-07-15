import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protéger l'accès Admin
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Protéger l'accès Store Manager
    if (path.startsWith("/store") && token?.role !== "STORE_MANAGER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Appliquer le middleware uniquement sur les tableaux de bord (ne pas bloquer l'API)
export const config = {
  matcher: ["/admin/:path*", "/store/:path*"],
};
