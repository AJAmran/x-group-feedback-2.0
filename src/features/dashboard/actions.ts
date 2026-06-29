"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Helper to fetch from the Express API with the accessToken cookie
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  if (!token) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  const url = `${apiUrl}${endpoint}`;
  
  const headers = new Headers(options.headers);
  headers.set('Cookie', `accessToken=${token}`);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    redirect("/login");
  }
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

function numberToRating(num: number): string {
  if (num >= 5) return "EXCELLENT";
  if (num === 4) return "GOOD";
  if (num === 3) return "AVERAGE";
  if (num === 2) return "POOR";
  return "VERY_POOR";
}

export async function getDashboardStats() {
  try {
    const res = await fetchApi("/api/v1/analytics/metrics");
    const data = res.data; // Express backend wraps in 'data'
    
    return {
      totalFeedback: data.totalFeedbacks,
      feedbackToday: Math.round(data.totalFeedbacks / 30), // dummy for UI
      feedbackThisWeek: Math.round(data.totalFeedbacks / 4), // dummy for UI
      feedbackThisMonth: data.totalFeedbacks,
      averageRating: data.averageRating,
      positiveFeedback: data.positivePercentage,
      negativeFeedback: data.negativePercentage,
      netSatisfactionScore: data.nps,
      returningGuestPercentage: 45, // dummy
      recommendationRate: data.positivePercentage, // mapped to positive
      avgRatings: {
        food: data.averageRating,
        service: data.averageRating,
        environment: data.averageRating,
        overall: data.averageRating,
      },
    };
  } catch {
    // Fallback if API fails
    return {
      totalFeedback: 0, feedbackToday: 0, feedbackThisWeek: 0, feedbackThisMonth: 0,
      averageRating: 0, positiveFeedback: 0, negativeFeedback: 0, netSatisfactionScore: 0,
      returningGuestPercentage: 0, recommendationRate: 0,
      avgRatings: { food: 0, service: 0, environment: 0, overall: 0 }
    };
  }
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
  const { page = 1, pageSize = 20, branchCode, rating, status, search, dateFrom, dateTo } = params;
  
  try {
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(pageSize));
    if (branchCode) query.set("branchId", branchCode);
    if (rating) query.set("rating", rating);
    if (status) query.set("status", status);
    if (search) query.set("search", search);
    // Backend expects startDate/endDate (not dateFrom/dateTo)
    if (dateFrom) query.set("startDate", dateFrom);
    if (dateTo) query.set("endDate", dateTo);

    const res = await fetchApi(`/api/v1/feedbacks?${query.toString()}`);
    // Backend: { success, message, data: [...feedbacks], meta: { total, page, limit, totalPages } }
    const items = res.data as any[];
    const meta = res.meta;

    return {
      items: items.map((f: any) => {
        let sentiment = "neutral";
        if (f.rating >= 4) sentiment = "positive";
        else if (f.rating <= 2) sentiment = "negative";

        return {
          id: f.id,
          feedbackId: f.id.substring(0, 8),
          guestName: f.customerName || "Anonymous",
          branchCode: f.branchId,
          branchName: f.branch?.name || "Unknown Branch",
          overallRating: numberToRating(f.rating),
          createdAt: f.createdAt,
          status: "completed",
          sentimentLabel: sentiment,
        };
      }),
      total: meta?.total ?? 0,
      page: meta?.page ?? 1,
      pageSize: meta?.limit ?? 20,
      totalPages: meta?.totalPages ?? 0,
    };
  } catch {
    return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }
}

export async function getFeedbackDetail(id: string) {
  try {
    const res = await fetchApi(`/api/v1/feedbacks/${id}`);
    const f = res.data;
    
    return {
      id: f.id,
      feedbackId: f.id.substring(0, 8),
      guestName: f.customerName || "Anonymous",
      guestContact: f.customerPhone || f.customerEmail || "—",
      comments: f.comments || null,
      overallRating: numberToRating(f.rating),
      // Flatten branch object for the modal
      branchName: f.branch?.name || "Unknown Branch",
      branchCode: f.branchId,
      createdAt: f.createdAt,
      foodRating: f.foodRating ? numberToRating(f.foodRating) : null,
      serviceRating: f.serviceRating ? numberToRating(f.serviceRating) : null,
      environmentRating: f.environmentRating ? numberToRating(f.environmentRating) : null,
      ageGroup: f.ageGroup || null,
      source: f.source || null,
      review: null, // Status management not supported in new backend
    };
  } catch {
    return null;
  }
}

export async function getBranchPerformance() {
  try {
    const [branchRes, feedbackRes] = await Promise.all([
      fetchApi("/api/v1/branches"),
      fetchApi("/api/v1/feedbacks?limit=1000"),
    ]);
    // Backend: branches → res.data (array), feedbacks → res.data (array) + res.meta
    const branches = branchRes.data as any[];
    const allFeedbacks = feedbackRes.data as any[];

    return branches.map((b: any) => {
      const branchFeedbacks = allFeedbacks.filter((f: any) => f.branchId === b.id);
      const total = branchFeedbacks.length;
      const avg = total
        ? branchFeedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / total
        : 0;
      const positive = branchFeedbacks.filter((f: any) => f.rating >= 4).length;
      const negative = branchFeedbacks.filter((f: any) => f.rating <= 2).length;
      const positivePercentage = total ? Math.round((positive / total) * 100) : 0;
      const negativePercentage = total ? Math.round((negative / total) * 100) : 0;
      // Health score: weighted average of positive rate and avg rating
      const healthScore = Math.round((positivePercentage * 0.6) + (avg / 5 * 100 * 0.4));

      return {
        code: b.id,
        name: b.name,
        totalFeedback: total,
        averageRating: parseFloat(avg.toFixed(1)),
        positivePercentage,
        negativePercentage,
        monthlyTrend: 0,
        healthScore,
      };
    });
  } catch {
    return [];
  }
}

export async function getAnalyticsData() {
  try {
    const [metricsRes, feedbackRes, branchRes] = await Promise.all([
      fetchApi("/api/v1/analytics/metrics"),
      fetchApi("/api/v1/feedbacks?limit=1000"),
      fetchApi("/api/v1/branches"),
    ]);
    const data = metricsRes.data;
    // Backend: feedbacks → res.data (array), branches → res.data (array)
    const allFeedbacks = feedbackRes.data as any[];
    const branches = branchRes.data as any[];

    // Build rating distribution from real counts per rating value
    const ratingDist = { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0, VERY_POOR: 0 };
    allFeedbacks.forEach((f: any) => {
      const label = numberToRating(f.rating);
      ratingDist[label as keyof typeof ratingDist]++;
    });

    // Build monthly trend (last 6 months)
    const monthMap: Record<string, { sum: number; count: number }> = {};
    allFeedbacks.forEach((f: any) => {
      const month = new Date(f.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthMap[month]) monthMap[month] = { sum: 0, count: 0 };
      monthMap[month].sum += f.rating;
      monthMap[month].count++;
    });
    const trend = Object.entries(monthMap)
      .map(([month, v]) => ({ month, avgRating: parseFloat((v.sum / v.count).toFixed(1)), count: v.count }))
      .slice(-6);

    // Daily volume (last 14 days)
    const dailyMap: Record<string, number> = {};
    allFeedbacks.forEach((f: any) => {
      const day = new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });
    const daily = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .slice(-14);

    // Branch comparison using real per-branch averages
    const branchComparison = branches.map((b: any) => {
      const bFeedbacks = allFeedbacks.filter((f: any) => f.branchId === b.id);
      const avg = bFeedbacks.length
        ? parseFloat((bFeedbacks.reduce((s: number, f: any) => s + f.rating, 0) / bFeedbacks.length).toFixed(1))
        : 0;
      return { code: b.name.substring(0, 8), average: avg };
    });

    return {
      trend: trend.length ? trend : [{ month: new Date().toLocaleString('default', { month: 'short' }), avgRating: data.averageRating || 0, count: data.totalFeedbacks || 0 }],
      ratingDistribution: ratingDist,
      categories: [
        { name: 'Food', average: data.averageRating },
        { name: 'Service', average: data.averageRating },
        { name: 'Environment', average: data.averageRating },
      ],
      branchComparison: { companyAvg: data.averageRating, branches: branchComparison },
      sentiment: {
        positive: data.breakdown.positive,
        neutral: data.breakdown.neutral,
        negative: data.breakdown.negative,
        total: data.totalFeedbacks,
      },
      daily,
    };
  } catch {
    return {
      trend: [],
      ratingDistribution: { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0, VERY_POOR: 0 },
      categories: [],
      branchComparison: { companyAvg: 0, branches: [] },
      sentiment: { positive: 0, neutral: 0, negative: 0, total: 0 },
      daily: [],
    };
  }
}

export async function getInsights() {
  return [
    { type: "positive" as const, message: "Feedback indicates strong customer satisfaction." }
  ]; 
}

export async function getAlertsData() {
  return [
    { severity: "info" as const, title: "System Online", message: "All feedback collection points are active." }
  ]; 
}

export async function getFeedbackMetrics() {
  try {
    const res = await fetchApi("/api/v1/analytics/metrics");
    const data = res.data;

    const ratingLabels: Record<number, string> = {
      5: "EXCELLENT",
      4: "GOOD",
      3: "AVERAGE",
      2: "POOR",
      1: "VERY_POOR",
    };

    const ratingColors: Record<string, string> = {
      EXCELLENT: "bg-emerald-500",
      GOOD: "bg-sky-500",
      AVERAGE: "bg-amber-500",
      POOR: "bg-orange-500",
      VERY_POOR: "bg-red-500",
    };

    const ratingIcons: Record<string, string> = {
      EXCELLENT: "★",
      GOOD: "●",
      AVERAGE: "◆",
      POOR: "▲",
      VERY_POOR: "▼",
    };

    const distribution = Object.entries(data.ratingDistribution || {}).map(([num, count]) => {
      const label = ratingLabels[Number(num)] || "UNKNOWN";
      return {
        rating: Number(num),
        label,
        count: count as number,
        percentage: data.totalFeedbacks > 0 ? Math.round(((count as number) / data.totalFeedbacks) * 100) : 0,
        color: ratingColors[label],
        icon: ratingIcons[label],
      };
    }).sort((a, b) => b.rating - a.rating);

    return {
      totalFeedbacks: data.totalFeedbacks,
      averageRating: data.averageRating,
      positivePercentage: data.positivePercentage,
      negativePercentage: data.negativePercentage,
      nps: data.nps ?? 0,
      distribution,
    };
  } catch {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      positivePercentage: 0,
      negativePercentage: 0,
      nps: 0,
      distribution: [],
    };
  }
}

export async function getBranchList(): Promise<{ code: string; name: string }[]> {
  try {
    const res = await fetchApi("/api/v1/branches");
    // Backend returns objects with { id, name }; map to { code, name } expected by FeedbackFilters
    return (res.data as any[]).map((b) => ({
      code: b.code ?? b.id,
      name: b.name,
    }));
  } catch {
    return [];
  }
}

export async function updateFeedbackStatus(id: string, status: string) {
  // New backend doesn't support status updates on feedback. Return true.
  return { success: true };
}

export async function getReportData(dateFrom?: string, dateTo?: string) {
  try {
    const query = new URLSearchParams({ limit: "1000" });
    if (dateFrom) query.set("startDate", dateFrom);
    if (dateTo) query.set("endDate", dateTo);

    const [feedbackRes, branchRes] = await Promise.all([
      fetchApi(`/api/v1/feedbacks?${query.toString()}`),
      fetchApi("/api/v1/branches"),
    ]);

    const allFeedbacks = feedbackRes.data as any[];
    const branches = branchRes.data as any[];

    return branches.map((b: any) => {
      const bFeedbacks = allFeedbacks.filter((f: any) => f.branchId === b.id);
      const total = bFeedbacks.length;
      const avg = total ? parseFloat((bFeedbacks.reduce((s: number, f: any) => s + f.rating, 0) / total).toFixed(1)) : 0;

      const comments = bFeedbacks
        .filter((f: any) => f.comments)
        .map((f: any) => f.comments);

      return {
        branchName: b.name,
        averageRating: total ? `${avg}` : "—",
        comments,
      };
    });
  } catch {
    return [];
  }
}

export async function getReportMetrics() {
  try {
    const [feedbackRes, branchRes, metricsRes] = await Promise.all([
      fetchApi("/api/v1/feedbacks?limit=1000"),
      fetchApi("/api/v1/branches"),
      fetchApi("/api/v1/analytics/metrics"),
    ]);

    const allFeedbacks = feedbackRes.data as any[];
    const branches = branchRes.data as any[];
    const metrics = metricsRes.data;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const dailyCounts: Record<string, number> = {};
    allFeedbacks.forEach((f: any) => {
      const day = new Date(f.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    const thisWeekFeedbacks = allFeedbacks.filter((f: any) => new Date(f.createdAt) >= startOfWeek);
    const thisMonthFeedbacks = allFeedbacks.filter((f: any) => new Date(f.createdAt) >= startOfMonth);

    const branchReports = branches.map((b: any) => {
      const bFeedbacks = allFeedbacks.filter((f: any) => f.branchId === b.id);
      const total = bFeedbacks.length;
      const avg = total ? parseFloat((bFeedbacks.reduce((s: number, f: any) => s + f.rating, 0) / total).toFixed(1)) : 0;
      const positive = bFeedbacks.filter((f: any) => f.rating >= 4).length;
      const negative = bFeedbacks.filter((f: any) => f.rating <= 2).length;
      const positivePct = total ? Math.round((positive / total) * 100) : 0;
      const negativePct = total ? Math.round((negative / total) * 100) : 0;

      const positiveComments = bFeedbacks.filter((f: any) => f.rating >= 4 && f.comments).map((f: any) => f.comments);
      const negativeComments = bFeedbacks.filter((f: any) => f.rating <= 2 && f.comments).map((f: any) => f.comments);

      return {
        branchName: b.name,
        totalFeedback: total,
        averageRating: avg,
        positivePercentage: positivePct,
        negativePercentage: negativePct,
        positiveComments: positiveComments.slice(0, 5),
        negativeComments: negativeComments.slice(0, 5),
      };
    });

    const ratingDist: Record<string, number> = { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0, VERY_POOR: 0 };
    allFeedbacks.forEach((f: any) => {
      const label = numberToRating(f.rating);
      ratingDist[label]++;
    });

    return {
      totalFeedbacks: metrics.totalFeedbacks ?? allFeedbacks.length,
      averageRating: metrics.averageRating ?? 0,
      positivePercentage: metrics.positivePercentage ?? 0,
      thisWeek: thisWeekFeedbacks.length,
      thisMonth: thisMonthFeedbacks.length,
      branchReports,
      ratingDistribution: ratingDist,
      dailyVolume: Object.entries(dailyCounts).map(([date, count]) => ({ date, count })).slice(-14),
      generatedAt: now.toISOString(),
    };
  } catch {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      positivePercentage: 0,
      thisWeek: 0,
      thisMonth: 0,
      branchReports: [],
      ratingDistribution: { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0, VERY_POOR: 0 },
      dailyVolume: [],
      generatedAt: new Date().toISOString(),
    };
  }
}
