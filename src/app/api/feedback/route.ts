import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const submissionSchema = z.object({
  feedbackId: z.string().min(1),
  branchCode: z.string().min(1),
  branchName: z.string().min(1),
  submittedAt: z.string(),
  guest: z.object({
    name: z.string().min(1, "Name is required"),
    contact: z.string().min(1, "Contact is required"),
    ageGroup: z.string().optional(),
    source: z.string().optional(),
  }),
  ratings: z.object({
    FOOD: z.string().nullable().optional(),
    SERVICE: z.string().nullable().optional(),
    ENVIRONMENT: z.string().nullable().optional(),
    EVENT: z.string().nullable().optional(),
    OVERALL: z.string().nullable().optional(),
  }),
  comments: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let sentimentLabel: string | null = null;
    let wouldRecommend: boolean | null = null;
    
    if (data.ratings.OVERALL) {
      const r = data.ratings.OVERALL;
      if (r === "EXCELLENT" || r === "GOOD") sentimentLabel = "positive";
      else if (r === "AVERAGE") sentimentLabel = "neutral";
      else sentimentLabel = "negative";

      wouldRecommend = r !== "POOR" && r !== "VERY_POOR";
    }

    const feedback = await prisma.feedback.create({
      data: {
        feedbackId: data.feedbackId,
        branchCode: data.branchCode,
        branchName: data.branchName,
        guestName: data.guest.name,
        guestContact: data.guest.contact,
        ageGroup: data.guest.ageGroup || null,
        source: data.guest.source || null,
        foodRating: data.ratings.FOOD || null,
        serviceRating: data.ratings.SERVICE || null,
        environmentRating: data.ratings.ENVIRONMENT || null,
        eventRating: data.ratings.EVENT || null,
        overallRating: data.ratings.OVERALL || null,
        comments: data.comments || null,
        sentimentLabel,
        wouldRecommend,
      },
    });

    return NextResponse.json(
      {
        success: true,
        feedbackId: feedback.feedbackId,
        message: "Feedback submitted successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Unexpected error occurred." },
      { status: 500 }
    );
  }
}
