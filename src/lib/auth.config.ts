import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (NO Prisma, NO bcrypt)
 * Used by middleware.ts which runs in Edge Runtime on Vercel
 */
export const authConfig: NextAuthConfig = {
    providers: [], // providers are added in the full auth.ts
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as unknown as Record<string, unknown>).role;
                token.plan = (user as unknown as Record<string, unknown>).plan;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as unknown as Record<string, unknown>).role = token.role;
                (session.user as unknown as Record<string, unknown>).plan = token.plan;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const role = (auth?.user as unknown as Record<string, unknown>)?.role;
            const pathname = nextUrl.pathname;

            // Public routes
            const publicPaths = ["/", "/login", "/register", "/api/auth", "/api/public"];
            const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
            const isStaticFile = pathname.startsWith("/_next") || pathname.startsWith("/uploads") || pathname.includes(".");

            if (isStaticFile || isPublicPath) {
                return true;
            }

            // Protected routes
            if (!isLoggedIn) {
                return false; // redirects to signIn page
            }

            // Admin routes
            if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
                if (role !== "ADMIN") {
                    return Response.redirect(new URL("/dashboard", nextUrl.origin));
                }
            }

            return true;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
};
