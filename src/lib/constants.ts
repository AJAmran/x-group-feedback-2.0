export const BRANCH_MAP: Record<string, string> = {
    "X-01": "Xian Restaurant",
    "X-02": "Xenial Restaurant",
    "X-03": "Xiamen Restaurant",
    "X-04": "Golden Chimney Restaurant",
    "X-05": "Xindian Restaurant",
    "X-06": "Xinxian Restaurant, Dhanmondi",
    "X-07": "Four Seasons Restaurant, Dhanmondi",
    "X-08": "Xian Restaurant, Mirpur-10",
    "X-09": "Chung Wah Restaurant",
    "X-11": "Xinxian Restaurant, Uttara",
    "X-12": "Shimanto Convention Center",
    "X-16": "Xinxian Restaurant, Mirpur-01",
    "X-17": "Zam Zam Convention Center, Mirpur-01",
    "X-18": "Zam Zam Convention Center, Mirpur-11",
    "X-19": "Four Seasons Restaurant, Mirpur-11",
};

export const BRANCHES: { code: string; name: string; lat: number; lng: number }[] = [
    { code: "X-01", name: "Xian Restaurant", lat: 23.7418, lng: 90.3927 },
    { code: "X-02", name: "Xenial Restaurant", lat: 23.7465, lng: 90.3753 },
    { code: "X-03", name: "Xiamen Restaurant", lat: 23.7467, lng: 90.3746 },
    { code: "X-04", name: "Golden Chimney Restaurant", lat: 23.7388, lng: 90.3956 },
    { code: "X-05", name: "Xindian Restaurant", lat: 23.7468, lng: 90.3750 },
    { code: "X-06", name: "Xinxian Restaurant, Dhanmondi", lat: 23.7452, lng: 90.3765 },
    { code: "X-07", name: "Four Seasons Restaurant, Dhanmondi", lat: 23.7469, lng: 90.3749 },
    { code: "X-08", name: "Xian Restaurant, Mirpur-10", lat: 23.8244, lng: 90.3665 },
    { code: "X-09", name: "Chung Wah Restaurant", lat: 23.7334, lng: 90.4123 },
    { code: "X-11", name: "Xinxian Restaurant, Uttara", lat: 23.8742, lng: 90.3987 },
    { code: "X-12", name: "Shimanto Convention Center", lat: 23.7441, lng: 90.3669 },
    { code: "X-16", name: "Xinxian Restaurant, Mirpur-01", lat: 23.8048, lng: 90.3548 },
    { code: "X-17", name: "Zam Zam Convention Center, Mirpur-01", lat: 23.8048, lng: 90.3548 },
    { code: "X-18", name: "Zam Zam Convention Center, Mirpur-11", lat: 23.8271, lng: 90.3658 },
    { code: "X-19", name: "Four Seasons Restaurant, Mirpur-11", lat: 23.8271, lng: 90.3658 },
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


