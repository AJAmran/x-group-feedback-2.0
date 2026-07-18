export enum RatingCategory {
  FOOD = "FOOD",
  SERVICE = "SERVICE",
  ENVIRONMENT = "ENVIRONMENT",
  EVENT = "EVENT",
  OVERALL = "OVERALL",
}

export enum RatingValue {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  AVERAGE = "AVERAGE",
  POOR = "POOR",
}

export enum AgeGroup {
  BELOW_18 = "Below 18",
  AGE_18_30 = "18-30",
  AGE_31_50 = "31-50",
  AGE_51_PLUS = "51+",
}

export enum Source {
  SOCIAL_MEDIA = "Social Media",
  FRIENDS_FAMILY = "Friends & Family",
  VISITED_BEFORE = "Visited Before",
}

// API Types
export interface FeedbackSubmissionRequest {
  feedbackId: string;
  branchCode: string;
  branchName: string;
  branchId?: number;
  submittedAt: string;
  guest: {
    name: string;
    contact: string;
    ageGroup?: AgeGroup;
    source?: Source;
  };
  ratings: {
    [RatingCategory.FOOD]: RatingValue | null;
    [RatingCategory.SERVICE]: RatingValue | null;
    [RatingCategory.ENVIRONMENT]: RatingValue | null;
    [RatingCategory.EVENT]: RatingValue | null;
    [RatingCategory.OVERALL]: RatingValue | null;
  };
  comments: string | null;
}

export interface FeedbackSubmissionResponse {
  success: boolean;
  feedbackId: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

// ────────────────────────────
// Backend API response envelope
// ────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Auth ───────────────────

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "BRANCH_MANAGER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  branchId: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// ─── User management ────────

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branchId?: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  branchId?: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

// ─── Reports ────────────────

export interface ReportQueryParams {
  startDate?: string;
  endDate?: string;
  branchId?: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BackendFeedback extends Record<string, unknown> {}

export interface DailyReport {
  period: "daily";
  date: string;
  summary: {
    total: number;
    averageRating: number | null;
    negativeCount: number;
  };
  feedbacks: BackendFeedback[];
}

export interface WeeklyReport {
  period: "weekly";
  start: string;
  end: string;
  summary: {
    total: number;
    averageRating: number | null;
    negativeCount: number;
  };
  feedbacks: BackendFeedback[];
}

export interface MonthlyReport {
  period: "monthly";
  month: string;
  summary: {
    total: number;
    averageRating: number | null;
    negativeCount: number;
  };
  feedbacks: BackendFeedback[];
}

export interface BranchReport {
  branch: { id: number; name: string; code: string };
  summary: { total: number; averageRating: number | null; negativeCount: number };
  recentFeedbacks: BackendFeedback[];
}

// ─── Branch ──────────────────

export interface ActiveBranch {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
}

// ─── Settings ────────────────

export interface SystemSettings {
  [key: string]: unknown;
}


