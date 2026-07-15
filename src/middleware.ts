import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protéger l'accès Admin
    if (path.startsWith("/admin") && path !== "/admin/login") {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // Protéger l'accès Partenaire (STORE_MANAGER)
    if (path.startsWith("/partenaire") && path !== "/partenaire/login") {
      if (token?.role !== "STORE_MANAGER" && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/partenaire/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // On laisse le middleware gérer la redirection manuellement
    },
  }
);

// Appliquer le middleware uniquement sur les tableaux de bord
export const config = {
  matcher: ["/admin/:path*", "/partenaire/:path*"],
};
