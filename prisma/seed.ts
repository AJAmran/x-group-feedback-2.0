import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BRANCHES = [
  { code: "X-01", name: "Xian Restaurant" },
  { code: "X-02", name: "Xenial Restaurant" },
  { code: "X-03", name: "Xiamen Restaurant" },
  { code: "X-04", name: "Golden Chimney Restaurant" },
  { code: "X-05", name: "Xindian Restaurant" },
  { code: "X-06", name: "Xinxian Restaurant, Dhanmondi" },
  { code: "X-07", name: "Four Seasons Restaurant, Dhanmondi" },
  { code: "X-08", name: "Xian Restaurant, Mirpur-10" },
  { code: "X-09", name: "Chung Wah Restaurant" },
  { code: "X-11", name: "Xinxian Restaurant, Uttara" },
  { code: "X-12", name: "Shimanto Convention Center" },
  { code: "X-16", name: "Xinxian Restaurant, Mirpur-01" },
  { code: "X-17", name: "Zam Zam Convention Center, Mirpur-01" },
  { code: "X-18", name: "Zam Zam Convention Center, Mirpur-11" },
  { code: "X-19", name: "Four Seasons Restaurant, Mirpur-11" },
  { code: "X-20", name: "X-Group Signature, Gulshan" },
  { code: "X-21", name: "X-Group Premium, Banani" },
];

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 12);

  await prisma.user.upsert({
    where: { username: process.env.ADMIN_USERNAME || "admin" },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || "admin",
      passwordHash,
      fullName: process.env.ADMIN_FULL_NAME || "X-Group Administrator",
      email: process.env.ADMIN_EMAIL || "admin@xgroup.com",
      role: "admin",
    },
  });

  for (const branch of BRANCHES) {
    await prisma.branch.upsert({
      where: { code: branch.code },
      update: { name: branch.name, status: "active" },
      create: {
        code: branch.code,
        name: branch.name,
        status: "active",
      },
    });
  }

  console.log("✅ Seed complete: 1 admin + 17 branches created");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
