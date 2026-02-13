import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Middleware using Edge-compatible auth config
 * Does NOT import Prisma or bcrypt — safe for Vercel Edge Runtime
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
    ],
};
