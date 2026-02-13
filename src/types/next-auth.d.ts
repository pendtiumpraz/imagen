import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role?: string;
        plan?: string;
    }

    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
            role: string;
            plan: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        plan: string;
    }
}
