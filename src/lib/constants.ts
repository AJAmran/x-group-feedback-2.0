export const BRANCH_MAP: Record<string, string> = {
  "X-01": "Xian Restaurant",
  "X-02": "Xenial Restaurant",
  "X-03": "Xiamen Restaurant",
  "X-04": "Golden Chimney Restaurant",
  "X-05": "Xindian Restaurant",
  "X-06": "Xinxian Restaurant, Dhanmondi",
  "X-07": "Four Seasons Restaurant, Dhanmondi",
  "X-08": "Xinxian Restaurant, Mirpur-10",
  "X-09": "Chung Wah Restaurant",
  "X-11": "Xinxian Restaurant, Uttara",
  "X-12": "Shimanto Convention Center",
  "X-16": "Xinxian Restaurant, Mirpur-01",
  "X-17": "Zam Zam Convention Center, Mirpur-01",
  "X-18": "Zam Zam Convention Center, Mirpur-11",
  "X-19": "Four Seasons Restaurant, Mirpur-11",
};

export const BRANCHES: {
  code: string;
  name: string;
  lat: number;
  lng: number;
}[] = [
  {
    code: "X-01",
    name: "Xian Restaurant",
    lat: 23.740042879559585,
    lng: 90.38950769940561,
  },
  {
    code: "X-02",
    name: "Xenial Restaurant",
    lat: 23.7561511045432,
    lng: 90.37447932021232,
  },
  {
    code: "X-03",
    name: "Xiamen Restaurant",
    lat: 23.740210145379404,
    lng: 90.37477915317342,
  },
  {
    code: "X-04",
    name: "Golden Chimney Restaurant",
    lat: 23.746062889306078,
    lng: 90.39286521010396,
  },
  {
    code: "X-05",
    name: "Xindian Restaurant",
    lat: 23.751946854874433,
    lng: 90.36845087231482,
  },
  {
    code: "X-06",
    name: "Xinxian Restaurant, Dhanmondi",
    lat: 23.74562924055612,
    lng: 90.38434549981451,
  },
  {
    code: "X-07",
    name: "Four Seasons Restaurant, Dhanmondi",
    lat: 23.751511578924287,
    lng: 90.36809039735647,
  },
  {
    code: "X-08",
    name: "Xinxian Restaurant, Mirpur-10",
    lat: 23.81265844550352,
    lng: 90.3668630722603,
  },
  {
    code: "X-09",
    name: "Chung Wah Restaurant",
    lat: 23.73312528078283,
    lng: 90.40995913192918,
  },
  {
    code: "X-11",
    name: "Xinxian Restaurant, Uttara",
    lat: 23.858085605330054,
    lng: 90.40174794894915,
  },
  {
    code: "X-12",
    name: "Shimanto Convention Center",
    lat: 23.73809337714598,
    lng: 90.37761096789161,
  },
  {
    code: "X-16",
    name: "Xinxian Restaurant, Mirpur-01",
    lat: 23.799770728946406,
    lng: 90.35435683584136,
  },
  {
    code: "X-17",
    name: "Zam Zam Convention Center, Mirpur-01",
    lat: 23.79954398535525,
    lng: 90.35437327940905,
  },
  {
    code: "X-18",
    name: "Zam Zam Convention Center, Mirpur-11",
    lat: 23.81589567663798,
    lng: 90.36567282924354,
  },
  {
    code: "X-19",
    name: "Four Seasons Restaurant, Mirpur-11",
    lat: 23.81592431514009,
    lng: 90.36567284723233,
  },
];

export const AGE_GROUPS = [
  { value: "Below 18", label: "Below 18" },
  { value: "18-30", label: "18-30" },
  { value: "31-50", label: "31-50" },
  { value: "51+", label: "51+" },
];

export const SOURCES = [
  { value: "Social Media", label: "Social Media" },
  { value: "Friends & Family", label: "Friends & Family" },
  { value: "Visited Before", label: "I’ve visited before" },
];

import { RatingCategory, RatingValue } from "../types";
import { Smile, Meh, Star, Frown } from "lucide-react";

export const RATING_OPTIONS = [
  {
    val: RatingValue.EXCELLENT,
    label: "Excellent",
    icon: Star,
  },
  {
    val: RatingValue.GOOD,
    label: "Good",
    icon: Smile,
  },
  {
    val: RatingValue.AVERAGE,
    label: "Average",
    icon: Meh,
  },
  {
    val: RatingValue.POOR,
    label: "Poor",
    icon: Frown,
  },
];

export const CATEGORY_LABELS: Record<RatingCategory, string> = {
  [RatingCategory.FOOD]: "Food",
  [RatingCategory.SERVICE]: "Service",
  [RatingCategory.ENVIRONMENT]: "Environment",
  [RatingCategory.EVENT]: "Event",
  [RatingCategory.OVERALL]: "Overall",
};
