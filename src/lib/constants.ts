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

import { RatingValue } from "../types";
import { Smile, Meh, Star } from "lucide-react";

export const RATING_OPTIONS = [
    {
        val: RatingValue.EXCELLENT,
        label: "Excellent",
        icon: Star,
        activeClasses:
            "bg-gradient-to-br from-[hsl(var(--brand-dark))] to-[hsl(var(--brand-primary))] border-transparent text-white shadow-lg shadow-[hsl(var(--brand-primary))/0.3]",
        iconClass: "text-white fill-white/20",
    },
    {
        val: RatingValue.GOOD,
        label: "Good",
        icon: Smile,
        activeClasses:
            "bg-gradient-to-br from-emerald-600 to-teal-500 border-transparent text-white shadow-lg shadow-teal-500/20",
        iconClass: "text-white fill-white/10",
    },
    {
        val: RatingValue.AVERAGE,
        label: "Average",
        icon: Meh,
        activeClasses:
            "bg-gradient-to-br from-amber-500 to-orange-500 border-transparent text-white shadow-lg shadow-orange-500/20",
        iconClass: "text-white fill-white/10",
    },
];
