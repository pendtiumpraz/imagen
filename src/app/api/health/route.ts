import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    const checks: Record<string, string> = {};

    // Check env vars
    checks.AUTH_SECRET = process.env.AUTH_SECRET ? "SET" : "MISSING";
    checks.DATABASE_URL = process.env.DATABASE_URL ? "SET" : "MISSING";
    checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "NOT SET";
    checks.AUTH_URL = process.env.AUTH_URL || "NOT SET";
    checks.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST || "NOT SET";
    checks.NODE_ENV = process.env.NODE_ENV || "NOT SET";

    // Test DB connection
    try {
        const userCount = await prisma.user.count();
        checks.DB_CONNECTION = "OK - " + userCount + " users";
    } catch (e: unknown) {
        checks.DB_CONNECTION = "FAILED - " + (e instanceof Error ? e.message : String(e));
    }

    // Test finding admin user (same as authorize does)
    try {
        const user = await prisma.user.findUnique({
            where: { email: "admin@posterdakwah.com", deletedAt: null },
        });
        if (user) {
            checks.FIND_USER = "OK - found user id=" + user.id;
            // Test password
            const isValid = await bcrypt.compare("admin123", user.password);
            checks.PASSWORD_CHECK = isValid ? "OK - password matches" : "FAIL - password mismatch";
            checks.USER_ROLE = user.role;
            checks.USER_BANNED = String(user.isBanned);
        } else {
            checks.FIND_USER = "NOT FOUND";
        }
    } catch (e: unknown) {
        checks.FIND_USER = "ERROR - " + (e instanceof Error ? e.message : String(e));
    }

    return NextResponse.json(checks, { status: 200 });
}
