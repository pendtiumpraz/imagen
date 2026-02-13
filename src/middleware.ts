import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Middleware using Edge-compatible auth config
 * Does NOT import Prisma or bcrypt — safe for Vercel Edge Runtime
 */
export default auth;

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
    ],
};
