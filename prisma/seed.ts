import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.upsert({
        where: { email: "admin@posterdakwah.com" },
        update: {},
        create: {
            name: "Admin",
            email: "admin@posterdakwah.com",
            password: adminPassword,
            role: "ADMIN",
            plan: "PRO",
            dailyQuota: 200,
        },
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // Create demo user
    const userPassword = await bcrypt.hash("user123", 12);
    const user = await prisma.user.upsert({
        where: { email: "demo@posterdakwah.com" },
        update: {},
        create: {
            name: "Demo User",
            email: "demo@posterdakwah.com",
            password: userPassword,
            role: "USER",
            plan: "FREE",
            dailyQuota: 10,
        },
    });
    console.log(`✅ Demo user created: ${user.email}`);

    console.log("\n🎉 Seeding complete!");
    console.log("\n📋 Login Credentials:");
    console.log("  Admin: admin@posterdakwah.com / admin123");
    console.log("  User:  demo@posterdakwah.com / user123");
    console.log("\n⚠️  Remember to configure AI providers in Admin > AI Provider");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
