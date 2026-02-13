import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const checks: Record<string, string> = {};

    // Check env vars
    checks.AUTH_SECRET = process.env.AUTH_SECRET ? "SET" : "MISSING";
    checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "SET" : "MISSING";
    checks.DATABASE_URL = process.env.DATABASE_URL ? "SET (" + process.env.DATABASE_URL.substring(0, 20) + "...)" : "MISSING";
    checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "NOT SET";
    checks.AUTH_URL = process.env.AUTH_URL || "NOT SET";
    checks.NODE_ENV = process.env.NODE_ENV || "NOT SET";

    // Check DB connection
    try {
        const userCount = await prisma.user.count();
        checks.DB_CONNECTION = "OK - " + userCount + " users";
    } catch (e: unknown) {
        checks.DB_CONNECTION = "FAILED - " + (e instanceof Error ? e.message : String(e));
    }

    return NextResponse.json(checks, { status: 200 });
}
