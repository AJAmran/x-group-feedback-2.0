export enum RatingCategory {
  FOOD = "FOOD",
  SERVICE = "SERVICE",
  ENVIRONMENT = "ENVIRONMENT",
  OVERALL = "OVERALL",
}

export enum RatingValue {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  AVERAGE = "AVERAGE",
}

// API Types
export interface FeedbackSubmissionRequest {
  feedbackId: string;
  branchCode: string;
  branchName: string;
  submittedAt: string;
  guest: {
    name: string;
    contact: string;
  };
  ratings: {
    [RatingCategory.FOOD]: RatingValue | null;
    [RatingCategory.SERVICE]: RatingValue | null;
    [RatingCategory.ENVIRONMENT]: RatingValue | null;
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
