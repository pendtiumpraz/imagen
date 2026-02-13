import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;

    // Public routes
    const publicPaths = ["/", "/login", "/register", "/api/auth", "/api/public"];
    const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
    const isStaticFile = pathname.startsWith("/_next") || pathname.startsWith("/uploads") || pathname.includes(".");

    if (isStaticFile || isPublicPath) {
        return NextResponse.next();
    }

    // Protected routes - redirect to login
    if (!isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
    ],
};
