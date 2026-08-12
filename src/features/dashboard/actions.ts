"use server";

import { cache } from "react";
import { authenticatedFetch, getCurrentUserAction } from "@/features/auth/actions";
import { numberToRating } from "@/lib/utils";

/**
 * Resolve the effective branch scope for an analytics query.
 * - An explicit branchId (from an admin filter) always wins.
 * - Branch managers are ALWAYS scoped to their own branch, even when no
 *   branch filter is selected — this prevents cross-branch data leakage.
 */
async function resolveBranchScope(branchId?: string | number | null): Promise<string | undefined> {
  if (branchId != null && String(branchId) !== "") return String(branchId);
  const user = await getCurrentUserAction();
  if (user?.role === "BRANCH_MANAGER" && user.branchId != null) return String(user.branchId);
  return undefined;
}

const getCachedAnalytics = cache(async (dateFrom?: string, dateTo?: string, branchId?: string) => {
  const scopedBranchId = await resolveBranchScope(branchId);
  const query = new URLSearchParams();
  if (dateFrom) query.set("startDate", dateFrom);
  if (dateTo) query.set("endDate", dateTo);
  if (scopedBranchId) query.set("branchId", scopedBranchId);
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

interface BranchDetail {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

/** Row shape returned by the paginated branch list endpoint. */
export interface BranchListItem extends BranchDetail {
  createdAt?: string;
}

interface AnalyticsBranchReport {
  id?: string | number;
  code?: string;
  branchName?: string;
  isActive?: boolean;
  totalFeedback?: number;
  averageRating?: number;
  positivePercentage?: number;
  negativePercentage?: number;
  averageRatings?: { overallRating?: number };
}

interface AnalyticsDistributionItem {
  rating: number;
  count: number;
  percentage?: number;
}

interface DashboardAlert {
  severity: "critical" | "info";
  title: string;
  message: string;
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
    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10); // "YYYY-MM-DD" — stable & locale-independent
    const todayMatch = (daily as { date: string; count: number }[]).find(
      (d) => d.date === todayISO || d.date?.startsWith(todayISO),
    );
    const feedbackToday = todayMatch ? todayMatch.count : 0;

    // NPS = %promoters (5/4 stars) − %detractors (1/2 stars)
    const distribution = data?.distribution || [];
    let promoters = 0;
    let detractors = 0;
    for (const d of distribution) {
      if (d.rating == null) continue;
      if (d.rating >= 4) promoters += d.count;
      else if (d.rating <= 2) detractors += d.count;
    }
    const nps = totalFeedbacks > 0 ? Math.round(((promoters - detractors) / totalFeedbacks) * 100) : 0;

    return {
      totalFeedback: totalFeedbacks,
      feedbackToday,
      feedbackThisWeek: data?.thisWeek ?? 0,
      feedbackThisMonth: data?.thisMonth ?? 0,
      averageRating: avgRating,
      positiveFeedback: positivePct,
      negativeFeedback: negativePct,
      netSatisfactionScore: nps,
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

    // Resolve branch code (e.g. X-01) to the numeric branchId the API expects.
    let branchId: string | null = null;
    const branchFilter = await getFilteredFeedbackFeedbacks();
    if (branchFilter) {
      branchId = branchFilter.branchId;
    } else if (branchCode) {
      const branches = await getBranchList();
      const matched = branches.find((b) => b.code === branchCode || b.id === branchCode);
      if (matched) branchId = matched.id;
    }
    if (branchId) query.set("branchId", branchId);

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
    };
  } catch {
    return null;
  }
}

export async function getBranchPerformance() {
  try {
    const data = await getCachedAnalyticsSafe();
    if (!data) throw new Error("No data");

    return data?.branchReports?.map((b: AnalyticsBranchReport) => {
      return {
        id: b.id ?? b.code ?? b.branchName,
        code: b.code || b.branchName,
        name: b.branchName,
        isActive: b.isActive ?? true,
        totalFeedback: b.totalFeedback || 0,
        averageRating: b.averageRating || 0,
        positivePercentage: b.positivePercentage ?? 0,
        negativePercentage: b.negativePercentage ?? 0,
        monthlyTrend: b.averageRatings?.overallRating ?? 0,
        healthScore: b.averageRating ? Math.round((b.averageRating / 5) * 100) : 0,
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
      ratingDistribution: data?.distribution?.reduce((acc: Record<string, number>, d: AnalyticsDistributionItem) => {
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
    
    const alerts: DashboardAlert[] = [];

    branches.forEach((b: AnalyticsBranchReport) => {
      const rating = b.averageRating ?? 0;
      if (rating > 0 && rating < 3.0) {
        alerts.push({
          severity: "critical" as const,
          title: "Critical Feedback",
          message: `${b.branchName} has an average rating of ${rating}. Immediate action required.`
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
    const distributionArr: AnalyticsDistributionItem[] = data?.distribution || [];

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
      .filter((d: AnalyticsDistributionItem) => d.rating != null && ratingLabels[d.rating])
      .map((d: AnalyticsDistributionItem) => {
        const label = ratingLabels[d.rating]!;
        return {
          rating: Number(d.rating),
          label,
          count: Number(d.count),
          percentage: Number(d.percentage || (totalFeedbacks ? Math.round((d.count / totalFeedbacks) * 100) : 0)),
          color: String(ratingColors[label]),
          icon: String(ratingIcons[label]),
        };
      }).sort((a, b) => b.rating - a.rating);

    let promoters = 0;
    let detractors = 0;
    for (const d of distributionArr) {
      if (d.rating == null) continue;
      if (d.rating >= 4) promoters += d.count;
      else if (d.rating <= 2) detractors += d.count;
    }
    const nps = totalFeedbacks > 0 ? Math.round(((promoters - detractors) / totalFeedbacks) * 100) : 0;

    return {
      totalFeedbacks,
      averageRating: avgRating,
      positivePercentage: positivePct,
      negativePercentage: negativePct,
      nps,
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
    const { items, meta } = unwrapPaginated<BranchListItem>(res);
    return {
      branches: items,
      total: Number(meta?.totalRecords) || 0,
      page: Number(meta?.page) || 1,
      totalPages: Number(meta?.totalPages) || 1,
    };
  } catch {
    return { branches: [], total: 0, page: 1, totalPages: 1 };
  }
}

/** Fetch the full branch list, looping until all active branches are retrieved. */
export async function getAllBranches(): Promise<BranchItem[]> {
  const all: BranchItem[] = [];
  const pageSize = 100;
  let page = 1;

  try {
    for (let guard = 0; guard < 20; guard++) {
      const res = await fetchApi(`/api/v1/branches?page=${page}&limit=${pageSize}`);
      const { items, meta } = unwrapPaginated<BranchItem>(res);
      all.push(...items);
      const total = Number(meta?.totalRecords) || 0;
      const fetched = all.length;
      if (fetched >= total || items.length === 0) break;
      page += 1;
    }
  } catch {
    // Return whatever was loaded so far
  }

  return all;
}

const getCachedBranchList = cache(async (): Promise<{ id: string; code: string; name: string }[]> => {
  const branches = await getAllBranches();
  // Branch managers should only ever see their own branch in filters.
  const user = await getCurrentUserAction();
  if (user?.role === "BRANCH_MANAGER" && user.branchId != null) {
    return branches.filter((b) => String(b.id) === String(user.branchId)).map((b) => ({
      id: String(b.id),
      code: b.code ?? b.id,
      name: b.name,
    }));
  }
  return branches.map((b) => ({
    id: String(b.id),
    code: b.code ?? b.id,
    name: b.name,
  }));
});

export async function getBranchList(): Promise<{ id: string; code: string; name: string }[]> {
  return getCachedBranchList();
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
    const managerBranchNum = isManager ? Number(user!.branchId) : null;

    const query = new URLSearchParams({ limit: "1000" });
    if (params.dateFrom) query.set("startDate", params.dateFrom);
    if (params.dateTo) query.set("endDate", params.dateTo);

    // Resolve branch code (e.g. X-01) to the numeric branchId the API expects.
    let branchId: string | null = null;
    if (!managerBranchNum && params.branch) {
      const branches = await getBranchList();
      const matched = branches.find((b) => b.code === params.branch || b.id === params.branch);
      if (matched) branchId = matched.id;
    }
    if (branchId || managerBranchNum) query.set("branchId", String(branchId ?? managerBranchNum));
    if (params.rating) query.set("rating", RATING_LABEL_TO_INT[params.rating] ?? params.rating);
    if (params.search) query.set("search", params.search);

    const [feedbackRes, branches] = await Promise.all([
      fetchApi(`/api/v1/feedbacks?${query.toString()}`),
      getAllBranches(),
    ]);

    const { items: allFeedbacks } = unwrapPaginated<FeedbackItem>(feedbackRes);

    const feedbacks = isManager
      ? allFeedbacks.filter((f) => String(f.branchId) === String(managerBranchNum))
      : allFeedbacks;
    const filteredBranches = isManager
      ? branches.filter((b) => String(b.id) === String(managerBranchNum))
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
    
    const branchReports = data?.branchReports?.map((b: AnalyticsBranchReport) => ({
      branchName: b.branchName,
      totalFeedback: b.totalFeedback,
      averageRating: b.averageRating,
      positivePercentage: b.positivePercentage ?? 0,
      negativePercentage: b.negativePercentage ?? 0,
      positiveComments: [],
      negativeComments: [],
    })) || [];

    const ratingDist: Record<string, number> = { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, POOR: 0 };
    (data?.distribution || []).forEach((d: AnalyticsDistributionItem) => {
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
  data?: BranchDetail;
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
): Promise<{ success: boolean; data?: BranchDetail; error?: string }> {
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

export interface OperationalWidgets {
  pendingApprovals: { total: number; discounts: number; entertainments: number };
  managerReportsSubmittedToday: number;
  inventoryThisMonth: { submitted: number; draft: number; branchesWithStatement: number };
}

export async function getOperationalWidgets(): Promise<OperationalWidgets> {
  try {
    const res = await fetchApi("/api/v1/dashboard/operational-widgets");
    const data = res.data as OperationalWidgets | undefined;
    if (!data) throw new Error("No data");
    return data;
  } catch {
    return {
      pendingApprovals: { total: 0, discounts: 0, entertainments: 0 },
      managerReportsSubmittedToday: 0,
      inventoryThisMonth: { submitted: 0, draft: 0, branchesWithStatement: 0 },
    };
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
