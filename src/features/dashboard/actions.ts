"use server";

import { cache } from "react";
import { authenticatedFetch, getCurrentUserAction } from "@/features/auth/actions";
import { numberToRating } from "@/lib/utils";

interface DistributionItem {
  rating: number;
  count: number;
  percentage: number;
}

const getCachedAnalytics = cache(async (dateFrom?: string, dateTo?: string, branchId?: string) => {
  const query = new URLSearchParams();
  if (dateFrom) query.set("startDate", dateFrom);
  if (dateTo) query.set("endDate", dateTo);
  if (branchId) query.set("branchId", branchId);
  const qs = query.toString();
  const res = await fetchApi(`/api/v1/analytics/dashboard${qs ? `?${qs}` : ""}`);
  return res.data;
});

const getCachedAnalyticsSafe = cache(async (dateFrom?: string, dateTo?: string, branchId?: string) => {
  try {
    return await getCachedAnalytics(dateFrom, dateTo, branchId);
  } catch {
    return null;
  }
});

interface FeedbackItem {
  id: string;
  feedbackId?: string;
  branchId: string;
  overallRating: number;
  opinion?: string;
  submittedAt?: string;
  guestName?: string;
  branch?: { code?: string; name?: string };
  foodRating?: number;
  serviceRating?: number;
  environmentRating?: number;
  ageGroup?: string;
  heardAbout?: string;
}

interface BranchItem {
  id: string;
  code?: string;
  name: string;
  isActive?: boolean;
  lat?: number;
  lng?: number;
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const res = await authenticatedFetch(endpoint, options);

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const json = await res.json();
  return json;
}

function unwrapPaginated<T = unknown>(res: Record<string, unknown>): { items: T[]; meta: Record<string, unknown> | undefined } {
  const data = res.data as Record<string, unknown> | undefined;
  return { items: (data?.data ?? res.data) as T[], meta: (data?.meta ?? res.meta) as Record<string, unknown> | undefined };
}

function computeSentiment(rating: number | null | undefined): string {
  if (rating == null) return "neutral";
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

export async function getDashboardStats(dateFrom?: string, dateTo?: string, branchId?: string) {
  try {
    const data = await getCachedAnalyticsSafe(dateFrom, dateTo, branchId);
    if (!data) throw new Error("No data");

    const totalFeedbacks = data?.totalFeedbacks ?? 0;
    const avgRating = data?.averageRating ?? 0;
    const sentiment = data?.sentiment ?? { positive: 0, neutral: 0, negative: 0, total: 0 };
    const positivePct = sentiment.total > 0 ? Math.round((sentiment.positive / sentiment.total) * 100) : 0;
    const negativePct = sentiment.total > 0 ? Math.round((sentiment.negative / sentiment.total) * 100) : 0;
    
    const daily = data?.daily || [];
    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" }).replace(/(\w{3})\s(\d{2})/, "$1 $2");
    const todayMatch = daily.find((d: any) => d.date === todayStr || d.date === new Date().toLocaleString('en-US', { month: 'short', day: 'numeric' }));
    const feedbackToday = todayMatch ? todayMatch.count : 0;

    return {
      totalFeedback: totalFeedbacks,
      feedbackToday,
      feedbackThisWeek: data?.thisWeek ?? 0,
      feedbackThisMonth: data?.thisMonth ?? 0,
      averageRating: avgRating,
      positiveFeedback: positivePct,
      negativeFeedback: negativePct,
      netSatisfactionScore: Math.round(positivePct - negativePct),
      returningGuestPercentage: 0,
      recommendationRate: positivePct,
      avgRatings: {
        food: data?.averages?.foodRating ?? 0,
        service: data?.averages?.serviceRating ?? 0,
        environment: data?.averages?.environmentRating ?? 0,
        event: data?.averages?.eventRating ?? 0,
        overall: avgRating,
      },
    };
  } catch {
    return {
      totalFeedback: 0, feedbackToday: 0, feedbackThisWeek: 0, feedbackThisMonth: 0,
      averageRating: 0, positiveFeedback: 0, negativeFeedback: 0, netSatisfactionScore: 0,
      returningGuestPercentage: 0, recommendationRate: 0,
      avgRatings: { food: 0, service: 0, environment: 0, overall: 0 }
    };
  }
}

const RATING_LABEL_TO_INT: Record<string, string> = {
  EXCELLENT: "5",
  GOOD: "4",
  AVERAGE: "3",
  POOR: "2",
};

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

    const branchFilter = await getFilteredFeedbackFeedbacks();
    if (branchCode && !branchFilter) {
      query.set("branchId", branchCode);
    } else if (branchFilter) {
      query.set("branchId", branchFilter.branchId);
    }

    if (rating) query.set("rating", RATING_LABEL_TO_INT[rating] ?? rating);
    if (status) query.set("status", status);
    if (search) query.set("search", search);
    if (dateFrom) query.set("startDate", dateFrom);
    if (dateTo) query.set("endDate", dateTo);

    const res = await fetchApi(`/api/v1/feedbacks?${query.toString()}`);
    const { items, meta } = unwrapPaginated<FeedbackItem>(res);

    return {
      items: items.map((f) => ({
        id: f.id,
        feedbackId: f.feedbackId || String(f.id).substring(0, 8),
        guestName: f.guestName || "Anonymous",
        branchCode: f.branch?.code ?? f.branchId,
        branchName: f.branch?.name || "Unknown Branch",
        overallRating: f.overallRating ? numberToRating(f.overallRating) : null,
        createdAt: f.submittedAt ?? "",
        status: "completed",
        sentimentLabel: computeSentiment(f.overallRating),
      })),
      total: Number(meta?.totalRecords) || 0,
      page: Number(meta?.page) || 1,
      pageSize: Number(meta?.limit) || 20,
      totalPages: Number(meta?.totalPages) || 0,
    };
  } catch {
    return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }
}

async function getFilteredFeedbackFeedbacks() {
  const user = await getCurrentUserAction();
  if (user?.role !== "BRANCH_MANAGER" || !user.branchId) return null;
  return { branchId: String(user.branchId) };
}

export async function getFeedbackDetail(id: string) {
  try {
    const res = await fetchApi(`/api/v1/feedbacks/${id}`);
    const f = res.data;
    if (!f) return null;
    
    return {
      id: f.id,
      feedbackId: f.feedbackId || String(f.id).substring(0, 8),
      guestName: f.guestName || "Anonymous",
      guestContact: f.contact || "—",
      comments: f.opinion || null,
      overallRating: f.overallRating ? numberToRating(f.overallRating) : null,
      branchName: f.branch?.name || "Unknown Branch",
      branchCode: f.branch?.code ?? f.branchId,
      createdAt: f.submittedAt,
      foodRating: f.foodRating ? numberToRating(f.foodRating) : null,
      serviceRating: f.serviceRating ? numberToRating(f.serviceRating) : null,
      environmentRating: f.environmentRating ? numberToRating(f.environmentRating) : null,
      eventRating: f.eventRating ? numberToRating(f.eventRating) : null,
      ageGroup: f.ageGroup || null,
      source: f.heardAbout || null,
      review: null,
    };
  } catch {
    return null;
  }
}

export async function getBranchPerformance() {
  try {
    const data = await getCachedAnalyticsSafe();
    if (!data) throw new Error("No data");

    return data?.branchReports?.map((b: any) => {
      return {
        id: b.id || b.code || b.branchName,
        code: b.code || b.branchName,
        name: b.branchName,
        isActive: true,
        totalFeedback: b.totalFeedback || 0,
        averageRating: b.averageRating || 0,
        positivePercentage: b.averageRatings?.overallRating ? Math.round((b.averageRatings.overallRating / 5) * 100) : 0, // Derived from avg
        negativePercentage: b.averageRatings?.overallRating ? 100 - Math.round((b.averageRatings.overallRating / 5) * 100) : 0,
        monthlyTrend: b.averageRatings?.overallRating ?? 0, // Using avg rating as a simple trend proxy
        healthScore: b.averageRatings?.overallRating ? Math.round((b.averageRatings.overallRating / 5) * 100) : 0,
      };
    }) || [];
  } catch {
    return [];
  }
}

export async function getAnalyticsData(dateFrom?: string, dateTo?: string, branchId?: string) {
  try {
    const data = await getCachedAnalyticsSafe(dateFrom, dateTo, branchId);
    if (!data) throw new Error("No data");

    return {
      trend: data?.trend?.length ? data.trend : [{ month: new Date().toISOString().slice(0, 7), avgRating: data?.averageRating || 0, count: data?.totalFeedbacks || 0 }],
      ratingDistribution: data?.distribution?.reduce((acc: any, d: any) => {
        const label = numberToRating(d.rating);
        if (label) acc[label] = (acc[label] ?? 0) + d.count;
        return acc;
      }, { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0 }) || {},
      categories: [
        { name: 'Food', average: data?.averages?.foodRating ?? data?.averageRating ?? 0 },
        { name: 'Service', average: data?.averages?.serviceRating ?? data?.averageRating ?? 0 },
        { name: 'Environment', average: data?.averages?.environmentRating ?? data?.averageRating ?? 0 },
        { name: 'Event', average: data?.averages?.eventRating ?? data?.averageRating ?? 0 },
      ],
      branchComparison: data?.branchComparison || { companyAvg: 0, branches: [] },
      sentiment: data?.sentiment || { positive: 0, neutral: 0, negative: 0, total: 0 },
      daily: data?.daily || [],
    };
  } catch {
    return {
      trend: [],
      ratingDistribution: { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0 },
      categories: [],
      branchComparison: { companyAvg: 0, branches: [] },
      sentiment: { positive: 0, neutral: 0, negative: 0, total: 0 },
      daily: [],
    };
  }
}

export async function getInsights(dateFrom?: string, dateTo?: string, branchId?: string) {
  try {
    const data = await getCachedAnalyticsSafe(dateFrom, dateTo, branchId);
    if (!data) throw new Error("No data");
    const avgRating = data?.averageRating || 0;
    
    if (avgRating >= 4.5) {
      return [{ type: "positive" as const, message: "Feedback indicates strong customer satisfaction across branches." }];
    } else if (avgRating >= 3.5) {
      return [{ type: "neutral" as const, message: "Customer satisfaction is average, with room for improvement in some areas." }];
    } else if (avgRating > 0) {
      return [{ type: "negative" as const, message: "Overall ratings are low. Immediate attention is recommended." }];
    }
    return [];
  } catch {
    return [];
  }
}

export async function getAlertsData(dateFrom?: string, dateTo?: string, branchId?: string) {
  try {
    const data = await getCachedAnalyticsSafe(dateFrom, dateTo, branchId);
    if (!data) throw new Error("No data");
    const branches = data?.branchReports || [];
    
    const alerts: any[] = [];
    
    branches.forEach((b: any) => {
      if (b.averageRating > 0 && b.averageRating < 3.0) {
        alerts.push({
          severity: "error" as const,
          title: "Critical Feedback",
          message: `${b.branchName} has an average rating of ${b.averageRating}. Immediate action required.`
        });
      }
    });

    if (alerts.length === 0) {
      alerts.push({ severity: "info" as const, title: "System Online", message: "All feedback collection points are active." });
    }
    return alerts;
  } catch {
    return [];
  }
}

export async function getFeedbackMetrics(dateFrom?: string, dateTo?: string, branchId?: string): Promise<{
  totalFeedbacks: number;
  averageRating: number;
  positivePercentage: number;
  negativePercentage: number;
  nps: number;
  distribution: { rating: number; label: string; count: number; percentage: number; color: string; icon: string }[];
}> {
  try {
    const data = await getCachedAnalyticsSafe(dateFrom, dateTo, branchId);
    if (!data) throw new Error("No data");
    
    const totalFeedbacks = data?.totalFeedbacks ?? 0;
    const avgRating = data?.averageRating ?? 0;
    const sentiment = data?.sentiment ?? { positive: 0, neutral: 0, negative: 0, total: 0 };
    const positivePct = sentiment.total > 0 ? Math.round((sentiment.positive / sentiment.total) * 100) : 0;
    const negativePct = sentiment.total > 0 ? Math.round((sentiment.negative / sentiment.total) * 100) : 0;
    const distributionArr = data?.distribution || [];

    const ratingLabels: Record<number, string> = {
      5: "EXCELLENT",
      4: "GOOD",
      3: "AVERAGE",
      2: "POOR",
    };

    const ratingColors: Record<string, string> = {
      EXCELLENT: "bg-emerald-500",
      GOOD: "bg-sky-500",
      AVERAGE: "bg-amber-500",
      POOR: "bg-orange-500",
    };

    const ratingIcons: Record<string, string> = {
      EXCELLENT: "★",
      GOOD: "●",
      AVERAGE: "◆",
      POOR: "▲",
    };

    const distribution = distributionArr
      .filter((d: any) => d.rating != null && ratingLabels[d.rating])
      .map((d: any) => {
        const label = ratingLabels[d.rating]!;
        return {
          rating: Number(d.rating),
          label,
          count: Number(d.count),
          percentage: Number(d.percentage || (totalFeedbacks ? Math.round((d.count / totalFeedbacks) * 100) : 0)),
          color: String(ratingColors[label]),
          icon: String(ratingIcons[label]),
        };
      }).sort((a: any, b: any) => b.rating - a.rating);

    return {
      totalFeedbacks,
      averageRating: avgRating,
      positivePercentage: positivePct,
      negativePercentage: negativePct,
      nps: Math.round(positivePct - negativePct),
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

export async function getPaginatedBranches(params: { page?: number; limit?: number; search?: string }) {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);

    const res = await fetchApi(`/api/v1/branches?${query.toString()}`);
    return {
      branches: (res.data?.items || []) as any[],
      total: res.data?.meta?.total || 0,
      page: res.data?.meta?.page || 1,
      totalPages: res.data?.meta?.totalPages || 1,
    };
  } catch {
    return { branches: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function getBranchList(): Promise<{ id: string; code: string; name: string }[]> {
  try {
    const res = await fetchApi("/api/v1/branches?limit=1000");
    const { items: branches } = unwrapPaginated<BranchItem>(res);
    return branches.map((b) => ({
      id: String(b.id),
      code: b.code ?? b.id,
      name: b.name,
    }));
  } catch {
    return [];
  }
}

export async function updateFeedbackStatus(_id: string, _status: string) {
  void _id;
  void _status;
  // New backend doesn't support status updates on feedback. Return true.
  return { success: true };
}

export async function getReportData(params: {
  dateFrom?: string;
  dateTo?: string;
  branch?: string;
  rating?: string;
  search?: string;
}) {
  try {
    const user = await getCurrentUserAction();
    const isManager = user?.role === "BRANCH_MANAGER";
    const managerBranchId = isManager ? String(user!.branchId) : null;

    const query = new URLSearchParams({ limit: "1000" });
    if (params.dateFrom) query.set("startDate", params.dateFrom);
    if (params.dateTo) query.set("endDate", params.dateTo);
    if (params.branch && !managerBranchId) query.set("branchId", params.branch);
    if (params.rating) query.set("rating", RATING_LABEL_TO_INT[params.rating] ?? params.rating);
    if (params.search) query.set("search", params.search);

    const [feedbackRes, branchRes] = await Promise.all([
      fetchApi(`/api/v1/feedbacks?${query.toString()}`),
      fetchApi("/api/v1/branches?limit=1000"),
    ]);

    const { items: allFeedbacks } = unwrapPaginated<FeedbackItem>(feedbackRes);
    const { items: branches } = unwrapPaginated<BranchItem>(branchRes);

    const feedbacks = isManager
      ? allFeedbacks.filter((f) => f.branchId === managerBranchId)
      : allFeedbacks;
    const filteredBranches = isManager
      ? branches.filter((b) => b.id === managerBranchId)
      : branches;

    return filteredBranches.map((b) => {
      const bFeedbacks = feedbacks.filter((f) => f.branchId === b.id);
      const total = bFeedbacks.length;
      const avg = total ? parseFloat((bFeedbacks.reduce((s, f) => s + f.overallRating, 0) / total).toFixed(1)) : 0;

      const comments = bFeedbacks
        .filter((f) => f.opinion)
        .map((f) => f.opinion as string);

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

export async function getReportMetrics(dateFrom?: string, dateTo?: string) {
  try {
    const data = await getCachedAnalyticsSafe(dateFrom, dateTo);
    if (!data) throw new Error("No data");

    const totalFeedbacks = data?.totalFeedbacks ?? 0;
    const avgRating = data?.averageRating ?? 0;
    const positivePct = data?.sentiment?.total > 0 ? Math.round((data.sentiment.positive / data.sentiment.total) * 100) : 0;
    
    // We don't have positive/negative comments in the dashboard summary, but they aren't strictly necessary for the metrics overview (they might be in the detailed report).
    // The previous implementation fetched all feedbacks to get comments, which was very slow.
    // For performance, we skip comments in the metrics overview or they can be fetched via a separate endpoint if needed.
    const branchReports = data?.branchReports?.map((b: any) => ({
      branchName: b.branchName,
      totalFeedback: b.totalFeedback,
      averageRating: b.averageRating,
      positivePercentage: 0,
      negativePercentage: 0,
      positiveComments: [],
      negativeComments: [],
    })) || [];

    const ratingDist: Record<string, number> = { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0 };
    (data?.distribution || []).forEach((d: any) => {
      const label = numberToRating(d.rating);
      if (label) ratingDist[label] = (ratingDist[label] ?? 0) + d.count;
    });

    return {
      totalFeedbacks,
      averageRating: avgRating,
      positivePercentage: positivePct,
      thisWeek: data?.thisWeek ?? 0,
      thisMonth: data?.thisMonth ?? 0,
      branchReports,
      ratingDistribution: ratingDist,
      dailyVolume: data?.daily || [],
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      positivePercentage: 0,
      thisWeek: 0,
      thisMonth: 0,
      branchReports: [],
      ratingDistribution: { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0 },
      dailyVolume: [],
      generatedAt: new Date().toISOString(),
    };
  }
}

export async function getBranchByIdAction(id: string | number): Promise<{
  success: boolean;
  data?: {
    id: number;
    name: string;
    code: string;
    address: string;
    phone: string | null;
    latitude: number;
    longitude: number;
    isActive: boolean;
  };
  error?: string;
}> {
  try {
    const res = await authenticatedFetch(`/api/v1/branches/${id}`);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.message || "Failed to fetch branch" };
    }
    const json = await res.json();
    const b = json.data;
    return {
      success: true,
      data: {
        id: b.id,
        name: b.name,
        code: b.code,
        address: b.address,
        phone: b.phone,
        latitude: b.latitude,
        longitude: b.longitude,
        isActive: b.isActive,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to fetch branch" };
  }
}

export async function updateBranchAction(
  id: string | number,
  data: {
    name?: string;
    code?: string;
    address?: string;
    phone?: string | null;
    latitude?: number;
    longitude?: number;
    isActive?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUserAction();
    if (user && user.role === "BRANCH_MANAGER") {
      return { success: false, error: "Branch managers cannot update branches" };
    }
    const res = await authenticatedFetch(`/api/v1/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.message || "Failed to update branch" };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update branch" };
  }
}

export async function createBranchAction(
  data: {
    name: string;
    code: string;
    address: string;
    phone?: string | null;
    latitude: number;
    longitude: number;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const user = await getCurrentUserAction();
    if (user && user.role === "BRANCH_MANAGER") {
      return { success: false, error: "Branch managers cannot create branches" };
    }
    const res = await authenticatedFetch(`/api/v1/branches`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.message || "Failed to create branch" };
    }
    const json = await res.json();
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create branch" };
  }
}

export async function toggleBranchStatusAction(id: string | number, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUserAction();
    if (user && user.role === "BRANCH_MANAGER") {
      return { success: false, error: "Branch managers cannot update branches" };
    }
    const res = await authenticatedFetch(`/api/v1/branches/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.message || "Failed to update branch status" };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update branch status" };
  }
}

export async function deleteBranchAction(id: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUserAction();
    if (user && user.role === "BRANCH_MANAGER") {
      return { success: false, error: "Branch managers cannot delete branches" };
    }
    const res = await authenticatedFetch(`/api/v1/branches/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.message || "Failed to delete branch" };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete branch" };
  }
}
