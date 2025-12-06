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
