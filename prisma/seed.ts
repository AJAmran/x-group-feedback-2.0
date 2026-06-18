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

  // Generate some sample feedback over the past 60 days for demo purposes
  const ratings = ["EXCELLENT", "GOOD", "AVERAGE", "POOR", "VERY_POOR"];
  const weightedRatings = ["EXCELLENT", "EXCELLENT", "GOOD", "GOOD", "GOOD", "AVERAGE", "AVERAGE", "POOR"];
  const sources = ["Social Media", "Friends & Family", "Visited Before"];
  const ageGroups = ["Below 18", "18-30", "31-50", "51+"];
  const sentiments = ["positive", "positive", "positive", "neutral", "negative"] as const;
  const names = ["John Smith", "Sarah Johnson", "Mike Chen", "Emily Davis", "Alex Kim", "Lisa Wang", "David Brown", "Anna Lee", "James Wilson", "Maria Garcia"];

  const existingCount = await prisma.feedback.count();
  if (existingCount === 0) {
    const feedbacks = [];
    for (let i = 0; i < 200; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const branchIdx = Math.floor(Math.random() * BRANCHES.length);
      const branch = BRANCHES[branchIdx];
      const rating = weightedRatings[Math.floor(Math.random() * weightedRatings.length)];
      const sentiment = rating === "EXCELLENT" || rating === "GOOD" ? "positive" : rating === "AVERAGE" ? "neutral" : "negative";

      feedbacks.push({
        feedbackId: `DEMO-${String(i + 1).padStart(4, "0")}`,
        branchCode: branch.code,
        branchName: branch.name,
        guestName: names[Math.floor(Math.random() * names.length)],
        guestContact: `guest${i + 1}@email.com`,
        ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        foodRating: weightedRatings[Math.floor(Math.random() * weightedRatings.length)],
        serviceRating: weightedRatings[Math.floor(Math.random() * weightedRatings.length)],
        environmentRating: weightedRatings[Math.floor(Math.random() * weightedRatings.length)],
        eventRating: weightedRatings[Math.floor(Math.random() * weightedRatings.length)],
        overallRating: rating,
        comments: i % 3 === 0 ? "Great experience! Will visit again." : i % 5 === 0 ? "Service could be improved." : "Good food and ambiance.",
        sentimentLabel: sentiment,
        wouldRecommend: rating !== "POOR" && rating !== "VERY_POOR",
        createdAt: date,
      });
    }
    await prisma.feedback.createMany({ data: feedbacks });
    console.log(`✅ ${feedbacks.length} sample feedback entries created`);
  } else {
    console.log(`⏭️ ${existingCount} feedback entries already exist, skipping demo data`);
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
