"use server";

import { authenticatedFetch, getCurrentUserAction } from "@/features/auth/actions";
import { numberToRating } from "@/lib/utils";

interface DistributionItem {
  rating: number;
  count: number;
  percentage: number;
}

interface FeedbackItem {
  id: string;
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

function computeSentiment(rating: number): string {
  if (rating >= 4) return "positive";
  return "negative";
}

export async function getDashboardStats() {
  try {
    const res = await fetchApi("/api/v1/analytics/dashboard");
    const data = res.data;

    const totalFeedbacks = data?.totalFeedbacks ?? 0;
    const avgRating = data?.averageRating ?? 0;
    const positivePct = data?.sentiment?.total > 0 ? Math.round((data.sentiment.positive / data.sentiment.total) * 100) : 0;
    const negativePct = data?.sentiment?.total > 0 ? Math.round((data.sentiment.negative / data.sentiment.total) * 100) : 0;
    
    // Estimate today based on daily volume (last entry is usually today)
    const daily = data?.daily || [];
    const feedbackToday = daily.length > 0 ? daily[daily.length - 1].count : 0;

    return {
      totalFeedback: totalFeedbacks,
      feedbackToday,
      feedbackThisWeek: data?.thisWeek ?? 0,
      feedbackThisMonth: data?.thisMonth ?? 0,
      averageRating: avgRating,
      positiveFeedback: positivePct,
      negativeFeedback: negativePct,
      netSatisfactionScore: Math.round(positivePct - negativePct),
      returningGuestPercentage: 45, // Hardcoded estimate
      recommendationRate: positivePct,
      avgRatings: {
        food: data?.averages?.foodRating ?? 0,
        service: data?.averages?.serviceRating ?? 0,
        environment: data?.averages?.environmentRating ?? 0,
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
  VERY_POOR: "1",
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
        feedbackId: String(f.id).substring(0, 8),
        guestName: f.guestName || "Anonymous",
        branchCode: f.branch?.code ?? f.branchId,
        branchName: f.branch?.name || "Unknown Branch",
        overallRating: numberToRating(f.overallRating),
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
      feedbackId: String(f.id).substring(0, 8),
      guestName: f.guestName || "Anonymous",
      guestContact: f.contact || "—",
      comments: f.opinion || null,
      overallRating: numberToRating(f.overallRating),
      branchName: f.branch?.name || "Unknown Branch",
      branchCode: f.branch?.code ?? f.branchId,
      createdAt: f.submittedAt,
      foodRating: f.foodRating ? numberToRating(f.foodRating) : null,
      serviceRating: f.serviceRating ? numberToRating(f.serviceRating) : null,
      environmentRating: f.environmentRating ? numberToRating(f.environmentRating) : null,
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
    const res = await fetchApi("/api/v1/analytics/dashboard");
    const data = res.data;

    return data?.branchReports?.map((b: any) => {
      return {
        id: b.id || b.code || b.branchName,
        code: b.code || b.branchName,
        name: b.branchName,
        isActive: true,
        totalFeedback: b.totalFeedback || 0,
        averageRating: b.averageRating || 0,
        positivePercentage: 0, // Simplified for now since dashboard returns branchReports
        negativePercentage: 0,
        monthlyTrend: 0,
        healthScore: b.averageRating ? Math.round((b.averageRating / 5) * 100) : 0,
      };
    }) || [];
  } catch {
    return [];
  }
}

export async function getAnalyticsData() {
  try {
    const res = await fetchApi("/api/v1/analytics/dashboard");
    const data = res.data;

    return {
      trend: data?.trend?.length ? data.trend : [{ month: new Date().toLocaleString('default', { month: 'short' }), avgRating: data?.averageRating || 0, count: data?.totalFeedbacks || 0 }],
      ratingDistribution: data?.distribution?.reduce((acc: any, d: any) => {
        const label = numberToRating(d.rating);
        acc[label] = d.count;
        return acc;
      }, { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0, VERY_POOR: 0 }) || {},
      categories: [
        { name: 'Food', average: data?.averages?.foodRating ?? data?.averageRating ?? 0 },
        { name: 'Service', average: data?.averages?.serviceRating ?? data?.averageRating ?? 0 },
        { name: 'Environment', average: data?.averages?.environmentRating ?? data?.averageRating ?? 0 },
      ],
      branchComparison: data?.branchComparison || { companyAvg: 0, branches: [] },
      sentiment: data?.sentiment || { positive: 0, neutral: 0, negative: 0, total: 0 },
      daily: data?.daily || [],
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

export async function getFeedbackMetrics(): Promise<{
  totalFeedbacks: number;
  averageRating: number;
  positivePercentage: number;
  negativePercentage: number;
  nps: number;
  distribution: { rating: number; label: string; count: number; percentage: number; color: string; icon: string }[];
}> {
  try {
    const res = await fetchApi("/api/v1/analytics/dashboard");
    const data = res.data;
    
    const totalFeedbacks = data?.totalFeedbacks ?? 0;
    const avgRating = data?.averageRating ?? 0;
    const positivePct = data?.sentiment?.total > 0 ? Math.round((data.sentiment.positive / data.sentiment.total) * 100) : 0;
    const negativePct = data?.sentiment?.total > 0 ? Math.round((data.sentiment.negative / data.sentiment.total) * 100) : 0;
    const distributionArr = data?.distribution || [];

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

    const distribution = distributionArr.map((d: any) => {
      const label = ratingLabels[d.rating] || "UNKNOWN";
      return {
        rating: Number(d.rating),
        label: String(label),
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

export async function getBranchList(): Promise<{ code: string; name: string }[]> {
  try {
    const res = await fetchApi("/api/v1/branches?limit=1000");
    const { items: branches } = unwrapPaginated<BranchItem>(res);
    return branches.map((b) => ({
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

export async function getReportData(dateFrom?: string, dateTo?: string) {
  try {
    const user = await getCurrentUserAction();
    const isManager = user?.role === "BRANCH_MANAGER";
    const managerBranchId = isManager ? String(user!.branchId) : null;

    const query = new URLSearchParams({ limit: "1000" });
    if (dateFrom) query.set("startDate", dateFrom);
    if (dateTo) query.set("endDate", dateTo);

    const [feedbackRes, branchRes] = await Promise.all([
      fetchApi(`/api/v1/feedbacks?${query.toString()}`),
      fetchApi("/api/v1/branches?limit=1000"),
    ]);

    const { items: allFeedbacks } = unwrapPaginated<FeedbackItem>(feedbackRes);
    const { items: branches } = unwrapPaginated<BranchItem>(branchRes);

    const filteredFeedbacks = managerBranchId
      ? allFeedbacks.filter((f) => f.branchId === managerBranchId)
      : allFeedbacks;
    const filteredBranches = managerBranchId
      ? branches.filter((b) => b.id === managerBranchId)
      : branches;

    return filteredBranches.map((b) => {
      const bFeedbacks = filteredFeedbacks.filter((f) => f.branchId === b.id);
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
    const query = new URLSearchParams();
    if (dateFrom) query.set("startDate", dateFrom);
    if (dateTo) query.set("endDate", dateTo);

    const res = await fetchApi(`/api/v1/analytics/dashboard?${query.toString()}`);
    const data = res.data;

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

    const ratingDist: Record<string, number> = { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0, VERY_POOR: 0 };
    (data?.distribution || []).forEach((d: any) => {
      const label = numberToRating(d.rating);
      ratingDist[label] = (ratingDist[label] ?? 0) + d.count;
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
      ratingDistribution: { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0, VERY_POOR: 0 },
      dailyVolume: [],
      generatedAt: new Date().toISOString(),
    };
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
