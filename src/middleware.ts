import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight middleware - NO next-auth import
 * Checks for session cookie existence only
 * Actual auth validation happens in API routes via auth()
 */
export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Public routes - always allowed
    const publicPaths = ["/", "/login", "/register", "/products", "/api/auth", "/api/public"];
    const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
    const isStaticFile = pathname.startsWith("/_next") || pathname.startsWith("/uploads") || pathname.includes(".");

    if (isStaticFile || isPublicPath) {
        return NextResponse.next();
    }

    // Check for session cookie (next-auth sets these)
    const sessionToken =
        req.cookies.get("__Secure-authjs.session-token")?.value ||
        req.cookies.get("authjs.session-token")?.value ||
        req.cookies.get("__Secure-next-auth.session-token")?.value ||
        req.cookies.get("next-auth.session-token")?.value;

    // Not logged in → redirect to login
    if (!sessionToken) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // For admin routes, we can't verify the role in Edge without decoding JWT
    // So we allow access here - the actual role check happens server-side in admin pages/API
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
    ],
};
