"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function getDashboardStats() {
  await requireAuth();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalFeedback,
    feedbackToday,
    feedbackThisWeek,
    feedbackThisMonth,
    allRatings,
    recommendationAgg,
  ] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedback.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.feedback.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.feedback.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.feedback.findMany({
      select: { overallRating: true, foodRating: true, serviceRating: true, environmentRating: true },
      where: { overallRating: { not: null } },
    }),
    prisma.feedback.groupBy({
      by: ["wouldRecommend"],
      _count: { wouldRecommend: true },
    }),
  ]);

  const toNum = (r: string | null) => {
    const map: Record<string, number> = { EXCELLENT: 5, GOOD: 4, AVERAGE: 3, POOR: 2, VERY_POOR: 1 };
    return r ? map[r] || 3 : 0;
  };

  interface RatingItem { overallRating: string | null; foodRating: string | null; serviceRating: string | null; environmentRating: string | null }
  const calcAvg = (items: RatingItem[], key: keyof RatingItem) => {
    const vals = items.map((i) => toNum(i[key])).filter((n) => n > 0);
    return vals.length ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
  };

  const avgRatings = {
    food: calcAvg(allRatings, "foodRating"),
    service: calcAvg(allRatings, "serviceRating"),
    environment: calcAvg(allRatings, "environmentRating"),
    overall: calcAvg(allRatings, "overallRating"),
  };

  const positiveCount = recommendationAgg.find((r: { wouldRecommend: boolean | null; _count: { wouldRecommend: number } }) => r.wouldRecommend === true)?._count.wouldRecommend || 0;
  const totalWithRecommend = recommendationAgg.reduce((acc: number, r: { _count: { wouldRecommend: number } }) => acc + r._count.wouldRecommend, 0) || 1;

  const averageRating = avgRatings.overall;
  const positivePercentage = (positiveCount / totalWithRecommend) * 100;
  const negativePercentage = 100 - positivePercentage;
  const netSatisfactionScore = positivePercentage - negativePercentage;
  const returningGuestPercentage = 45;

  return {
    totalFeedback,
    feedbackToday,
    feedbackThisWeek,
    feedbackThisMonth,
    averageRating: Math.round(averageRating * 10) / 10,
    positiveFeedback: Math.round(positivePercentage),
    negativeFeedback: Math.round(negativePercentage),
    netSatisfactionScore: Math.round(netSatisfactionScore),
    returningGuestPercentage,
    recommendationRate: Math.round(positivePercentage),
    avgRatings,
  };
}

function ratingToNumber(rating: string | null): number {
  const map: Record<string, number> = { EXCELLENT: 5, GOOD: 4, AVERAGE: 3, POOR: 2, VERY_POOR: 1 };
  return rating ? map[rating] || 3 : 3;
}

export async function getFeedbackList(params: {
  page?: number;
  pageSize?: number;
  branchCode?: string;
  rating?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  await requireAuth();

  const { page = 1, pageSize = 20, branchCode, rating, status, search, dateFrom, dateTo } = params;

  const where: {
    branchCode?: string;
    overallRating?: string;
    createdAt?: { gte?: Date; lte?: Date };
    OR?: Array<Record<string, unknown>>;
    review?: { status?: string };
  } = {};

  if (branchCode) where.branchCode = branchCode;
  if (status) where.review = { status };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
  }
  if (search) {
    where.OR = [
      { guestName: { contains: search } },
      { guestContact: { contains: search } },
      { comments: { contains: search } },
    ];
  }
  if (rating) {
    where.overallRating = rating;
  }

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      where: where as any,
      include: { review: true, branch: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.feedback.count({ where: where as any }),
  ]);

  return {
    items: items.map((f: { id: string; feedbackId: string; guestName: string; branchCode: string; branchName: string; overallRating: string | null; createdAt: Date; review: { status: string } | null; sentimentLabel: string | null }) => ({
      id: f.id,
      feedbackId: f.feedbackId,
      guestName: f.guestName,
      branchCode: f.branchCode,
      branchName: f.branchName,
      overallRating: f.overallRating,
      createdAt: f.createdAt.toISOString(),
      status: f.review?.status || "pending",
      sentimentLabel: f.sentimentLabel,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getFeedbackDetail(id: string) {
  await requireAuth();

  return prisma.feedback.findUnique({
    where: { id },
    include: {
      review: { include: { reviewer: { select: { fullName: true } } } },
      branch: { select: { name: true, code: true } },
    },
  });
}

export async function getBranchPerformance() {
  await requireAuth();

  const branches = await prisma.branch.findMany({
    where: { status: "active" },
    include: {
      feedbacks: {
        select: { overallRating: true, createdAt: true, sentimentLabel: true },
      },
    },
  });

  return branches.map((branch: { code: string; name: string; feedbacks: Array<{ overallRating: string | null; createdAt: Date; sentimentLabel: string | null }> }) => {
    const total = branch.feedbacks.length;
    const ratedFeedbacks = branch.feedbacks.filter((f: { overallRating: string | null }) => f.overallRating);
    const rated = ratedFeedbacks as Array<{ overallRating: string | null }>;
    const avgRating = rated.length
      ? rated.reduce((sum: number, f: { overallRating: string | null }) => sum + ratingToNumber(f.overallRating), 0) / rated.length
      : 0;
    const positiveCount = branch.feedbacks.filter((f: { sentimentLabel: string | null }) => f.sentimentLabel === "positive").length;
    const negativeCount = branch.feedbacks.filter((f: { sentimentLabel: string | null }) => f.sentimentLabel === "negative").length;

    const thisMonth = branch.feedbacks.filter((f: { createdAt: Date }) => {
      const d = new Date(f.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const avgThisMonth = thisMonth.filter((f: { overallRating: string | null }) => f.overallRating).length
      ? thisMonth.filter((f: { overallRating: string | null }) => f.overallRating).reduce((sum: number, f: { overallRating: string | null }) => sum + ratingToNumber(f.overallRating), 0) /
        thisMonth.filter((f: { overallRating: string | null }) => f.overallRating).length
      : 0;

    const healthScore = Math.round((avgRating / 5) * 40 + (positiveCount / (total || 1)) * 30 + (total > 0 ? 30 : 0));

    return {
      code: branch.code,
      name: branch.name,
      totalFeedback: total,
      averageRating: Math.round(avgRating * 10) / 10,
      positivePercentage: total ? Math.round((positiveCount / total) * 100) : 0,
      negativePercentage: total ? Math.round((negativeCount / total) * 100) : 0,
      monthlyTrend: Math.round(avgThisMonth * 10) / 10,
      healthScore,
    };
  });
}

export async function getAnalyticsData() {
  await requireAuth();

  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentFeedbacks = await prisma.feedback.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: {
      createdAt: true,
      overallRating: true,
      foodRating: true,
      serviceRating: true,
      environmentRating: true,
      eventRating: true,
      branchCode: true,
      sentimentLabel: true,
      comments: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const monthlyTrend: Record<string, { count: number; total: number; avg: number }> = {};
  const ratingDistribution: Record<string, number> = {
    EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0, VERY_POOR: 0,
  };
  const categoryTotals: Record<string, { sum: number; count: number }> = {
    food: { sum: 0, count: 0 },
    service: { sum: 0, count: 0 },
    environment: { sum: 0, count: 0 },
    event: { sum: 0, count: 0 },
  };
  const branchRatings: Record<string, { sum: number; count: number }> = {};
  const sentimentCount = { positive: 0, neutral: 0, negative: 0 };
  const dailyCount: Record<string, number> = {};

  for (const fb of recentFeedbacks) {
    const month = fb.createdAt.toISOString().slice(0, 7);
    const day = fb.createdAt.toISOString().slice(0, 10);
    const r = ratingToNumber(fb.overallRating);

    if (!monthlyTrend[month]) monthlyTrend[month] = { count: 0, total: 0, avg: 0 };
    monthlyTrend[month].count++;
    if (fb.overallRating) {
      monthlyTrend[month].total += r;
      monthlyTrend[month].avg = monthlyTrend[month].total / monthlyTrend[month].count;
    }

    if (fb.overallRating) ratingDistribution[fb.overallRating] = (ratingDistribution[fb.overallRating] || 0) + 1;

    if (fb.foodRating) { categoryTotals.food.sum += ratingToNumber(fb.foodRating); categoryTotals.food.count++; }
    if (fb.serviceRating) { categoryTotals.service.sum += ratingToNumber(fb.serviceRating); categoryTotals.service.count++; }
    if (fb.environmentRating) { categoryTotals.environment.sum += ratingToNumber(fb.environmentRating); categoryTotals.environment.count++; }
    if (fb.eventRating) { categoryTotals.event.sum += ratingToNumber(fb.eventRating); categoryTotals.event.count++; }

    if (!branchRatings[fb.branchCode]) branchRatings[fb.branchCode] = { sum: 0, count: 0 };
    if (fb.overallRating) { branchRatings[fb.branchCode].sum += r; branchRatings[fb.branchCode].count++; }

    if (fb.sentimentLabel === "positive") sentimentCount.positive++;
    else if (fb.sentimentLabel === "negative") sentimentCount.negative++;
    else sentimentCount.neutral++;

    dailyCount[day] = (dailyCount[day] || 0) + 1;
  }

  const trend = Object.entries(monthlyTrend).map(([month, data]) => ({
    month,
    avgRating: Math.round(data.avg * 10) / 10,
    count: data.count,
  }));

  const categories = Object.entries(categoryTotals).map(([key, val]) => ({
    name: key,
    average: val.count ? Math.round((val.sum / val.count) * 10) / 10 : 0,
  }));

  const companyAvg =
    trend.length > 0 ? trend.reduce((s, t) => s + t.avgRating, 0) / trend.length : 0;

  const branchAvg = Object.entries(branchRatings).map(([code, val]) => ({
    code,
    average: val.count ? Math.round((val.sum / val.count) * 10) / 10 : 0,
  }));

  const daily = Object.entries(dailyCount).map(([date, count]) => ({ date, count }));

  return {
    trend,
    ratingDistribution,
    categories,
    branchComparison: { companyAvg: Math.round(companyAvg * 10) / 10, branches: branchAvg },
    sentiment: { ...sentimentCount, total: sentimentCount.positive + sentimentCount.neutral + sentimentCount.negative },
    daily,
  };
}

export async function getInsights() {
  await requireAuth();

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonthFeedback, lastMonthFeedback] = await Promise.all([
    prisma.feedback.findMany({
      where: { createdAt: { gte: thisMonth } },
      select: { overallRating: true, serviceRating: true, branchCode: true, comments: true, sentimentLabel: true },
    }),
    prisma.feedback.findMany({
      where: { createdAt: { gte: lastMonth, lt: thisMonth } },
      select: { overallRating: true, serviceRating: true, branchCode: true },
    }),
  ]);

  const calcAvg = (arr: Array<Record<string, string | null | undefined>>, key: string) => {
    const ratings = arr.map((f: Record<string, string | null | undefined>) => ratingToNumber(f[key] as string | null)).filter((r: number) => r > 0);
    return ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
  };

  const thisAvg = calcAvg(thisMonthFeedback, "overallRating");
  const lastAvg = calcAvg(lastMonthFeedback, "overallRating");
  const thisServiceAvg = calcAvg(thisMonthFeedback, "serviceRating");
  const lastServiceAvg = calcAvg(lastMonthFeedback, "serviceRating");

  const insights: { type: "positive" | "negative" | "neutral"; message: string }[] = [];

  const serviceChange = ((thisServiceAvg - lastServiceAvg) / (lastServiceAvg || 1)) * 100;
  if (serviceChange < -5) {
    insights.push({ type: "negative", message: `Service quality dropped ${Math.abs(Math.round(serviceChange))}% this month.` });
  }

  type ThisMonthItem = { overallRating: string | null; serviceRating: string | null; branchCode: string | null; comments: string | null; sentimentLabel: string | null };
  type LastMonthItem = { overallRating: string | null; serviceRating: string | null; branchCode: string | null };

  const posThis = (thisMonthFeedback as ThisMonthItem[]).filter((f: ThisMonthItem) => f.sentimentLabel === "positive").length;
  const negThis = (thisMonthFeedback as ThisMonthItem[]).filter((f: ThisMonthItem) => f.sentimentLabel === "negative").length;
  if (negThis > posThis && thisMonthFeedback.length > 10) {
    insights.push({ type: "negative", message: "Negative reviews outnumbered positive ones this month." });
  }

  const branchMap: Record<string, { this: number[]; last: number[] }> = {};
  for (const fb of thisMonthFeedback as ThisMonthItem[]) {
    if (!branchMap[fb.branchCode!]) branchMap[fb.branchCode!] = { this: [], last: [] };
    const r = ratingToNumber(fb.overallRating);
    if (r > 0) branchMap[fb.branchCode!].this.push(r);
  }
  for (const fb of lastMonthFeedback as LastMonthItem[]) {
    if (!branchMap[fb.branchCode!]) branchMap[fb.branchCode!] = { this: [], last: [] };
    const r = ratingToNumber(fb.overallRating);
    if (r > 0) branchMap[fb.branchCode!].last.push(r);
  }

  for (const [code, data] of Object.entries(branchMap)) {
    const thisAvgB = data.this.length ? data.this.reduce((a, b) => a + b, 0) / data.this.length : 0;
    const lastAvgB = data.last.length ? data.last.reduce((a, b) => a + b, 0) / data.last.length : 0;
    const change = lastAvgB ? ((thisAvgB - lastAvgB) / lastAvgB) * 100 : 0;
    if (change > 10 && data.this.length >= 3) {
      insights.push({ type: "positive", message: `Branch ${code} improved ${Math.round(change)}% this month.` });
    }
    if (change < -10 && data.this.length >= 3) {
      insights.push({ type: "negative", message: `Branch ${code} declined ${Math.abs(Math.round(change))}% this month.` });
    }
  }

  const foodKeywords = ["slow", "cold", "taste", "quality", "portion"];
  const serviceKeywords = ["rude", "slow service", "unfriendly", "wait", "attitude"];
  const complaintCounts: Record<string, number> = {};
  for (const fb of thisMonthFeedback as ThisMonthItem[]) {
    if (fb.comments) {
      const lower = fb.comments.toLowerCase();
      for (const kw of foodKeywords) { if (lower.includes(kw)) complaintCounts[kw] = (complaintCounts[kw] || 0) + 1; }
      for (const kw of serviceKeywords) { if (lower.includes(kw)) complaintCounts[kw] = (complaintCounts[kw] || 0) + 1; }
    }
  }
  const topComplaint = Object.entries(complaintCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0];
  if (topComplaint && topComplaint[1] >= 3) {
    insights.push({ type: "neutral", message: `"${topComplaint[0]}" mentioned ${topComplaint[1]} times this month.` });
  }

  if (thisAvg > 4) {
    insights.push({ type: "positive", message: `Overall satisfaction is high (${Math.round(thisAvg * 10) / 10}/5).` });
  }

  const weekendNegatives = (thisMonthFeedback as ThisMonthItem[]).filter((f: ThisMonthItem) => {
    const d = new Date();
    const day = d.getDay();
    return (day === 0 || day === 6) && f.sentimentLabel === "negative";
  }).length;

  if (weekendNegatives > 3) {
    insights.push({ type: "negative", message: `Negative reviews increased on weekends (${weekendNegatives} this month).` });
  }

  return insights;
}

export async function getAlertsData() {
  await requireAuth();

  const alerts: { severity: "critical" | "warning" | "info"; title: string; message: string }[] = [];

  const allBranchRatings = await prisma.feedback.findMany({
    select: { branchCode: true, overallRating: true },
    where: { overallRating: { not: null } },
  });

  const branchScores: Record<string, number[]> = {};
  for (const fb of allBranchRatings) {
    if (!branchScores[fb.branchCode]) branchScores[fb.branchCode] = [];
    const r = ratingToNumber(fb.overallRating);
    if (r > 0) branchScores[fb.branchCode].push(r);
  }

  for (const [code, scores] of Object.entries(branchScores)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg <= 2 && scores.length >= 3) {
      alerts.push({
        severity: "critical",
        title: "Branch Rating Below Threshold",
        message: `Branch ${code} average rating is ${avg.toFixed(1)}/5. Immediate attention required.`,
      });
    }
  }

  const recentNegatives = await prisma.feedback.count({
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      sentimentLabel: "negative",
    },
  });

  if (recentNegatives > 20) {
    alerts.push({
      severity: "warning",
      title: "Spike in Negative Reviews",
      message: `${recentNegatives} negative reviews in the past week. Investigate potential issues.`,
    });
  }

  const thisWeekCount = await prisma.feedback.count({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  });

  if (thisWeekCount < 50) {
    alerts.push({
      severity: "info",
      title: "Low Feedback Volume",
      message: `Only ${thisWeekCount} submissions this week. Consider promoting the feedback form.`,
    });
  }

  const recentServiceNegatives = await prisma.feedback.count({
    where: {
      createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      serviceRating: { in: ["POOR", "VERY_POOR"] },
    },
  });

  if (recentServiceNegatives > 10) {
    alerts.push({
      severity: "warning",
      title: "Service Rating Decline",
      message: `${recentServiceNegatives} poor service ratings in 2 weeks. Staff training may be needed.`,
    });
  }

  return alerts;
}

export async function getBranchList() {
  await requireAuth();
  return prisma.branch.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
  });
}

export async function updateFeedbackStatus(id: string, status: string) {
  const session = await requireAuth();

  const feedback = await prisma.feedback.findUnique({ where: { id }, include: { review: true } });
  if (!feedback) throw new Error("Feedback not found");

  if (feedback.review) {
    await prisma.review.update({
      where: { id: feedback.review.id },
      data: { status, reviewedBy: session.userId, reviewedAt: new Date() },
    });
  } else {
    await prisma.review.create({
      data: {
        feedbackId: feedback.id,
        status,
        reviewedBy: session.userId,
      },
    });
  }
  return { success: true };
}

export async function getReportData(dateFrom?: string, dateTo?: string) {
  await requireAuth();

  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
  }

  const feedbacks = await prisma.feedback.findMany({
    where: where as any,
    select: {
      branchCode: true,
      branchName: true,
      overallRating: true,
      sentimentLabel: true,
      comments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const branchData: Record<string, { branchName: string; ratingSum: number; ratingCount: number; positiveComments: string[]; negativeComments: string[] }> = {};

  for (const fb of feedbacks) {
    if (!branchData[fb.branchCode]) {
      branchData[fb.branchCode] = {
        branchName: fb.branchName,
        ratingSum: 0,
        ratingCount: 0,
        positiveComments: [],
        negativeComments: [],
      };
    }

    if (fb.overallRating) {
      branchData[fb.branchCode].ratingSum += ratingToNumber(fb.overallRating);
      branchData[fb.branchCode].ratingCount++;
    }

    if (fb.comments) {
      if (fb.sentimentLabel === "positive") branchData[fb.branchCode].positiveComments.push(fb.comments);
      else if (fb.sentimentLabel === "negative") branchData[fb.branchCode].negativeComments.push(fb.comments);
      // for neutral we can ignore or add somewhere, screenshot only has positive/negative.
    }
  }

  return Object.values(branchData).map(b => ({
    branchName: b.branchName,
    averageRating: b.ratingCount > 0 ? (b.ratingSum / b.ratingCount).toFixed(1) : "—",
    positiveComments: b.positiveComments.slice(0, 5), // Limit to top 5 for report to avoid huge rows
    negativeComments: b.negativeComments.slice(0, 5),
  }));
}

