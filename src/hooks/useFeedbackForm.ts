import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RatingCategory, RatingValue, FeedbackSubmissionRequest, ApiError } from "../types";
import { submitFeedbackWithRetry } from "../lib/api";
import { BRANCH_MAP } from "../lib/constants";

export function useFeedbackForm() {
    const [view, setView] = useState<"form" | "submitting" | "success" | "error">("form");
    const [error, setError] = useState<string>("");
    const [showValidation, setShowValidation] = useState(false);

    const searchParams = useSearchParams();
    const branchParam = searchParams.get("branch");
    const branchCode = branchParam ? branchParam.toUpperCase() : "X-01";
    const branchName = BRANCH_MAP[branchCode] || "X-Group Hospitality";

    const [feedbackId, setFeedbackId] = useState("");
    useEffect(() => {
        const branchPrefix = branchCode.replace("X-", "").toUpperCase() || "01";
        const random = Math.floor(1000 + Math.random() * 9000);
        setFeedbackId(`${branchPrefix}${random}`);
    }, [branchCode]);

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [opinion, setOpinion] = useState("");
    const [ratings, setRatings] = useState<Record<RatingCategory, RatingValue | null>>({
        [RatingCategory.FOOD]: null,
        [RatingCategory.SERVICE]: null,
        [RatingCategory.ENVIRONMENT]: null,
        [RatingCategory.OVERALL]: null,
    });

    const handleRatingChange = useCallback(
        (category: RatingCategory, value: RatingValue) => {
            setRatings((prev) => ({ ...prev, [category]: value }));
        },
        []
    );

    const isFormValid = useMemo(
        () => name.trim().length > 0 && contact.trim().length > 0,
        [name, contact]
    );

    const handleSubmit = useCallback(async () => {
        if (!isFormValid) {
            setShowValidation(true);
            return;
        }

        const submittedData: FeedbackSubmissionRequest = {
            feedbackId,
            branchCode,
            branchName,
            submittedAt: new Date().toISOString(),
            guest: { name: name.trim(), contact: contact.trim() },
            ratings: {
                [RatingCategory.FOOD]: ratings[RatingCategory.FOOD] ?? null,
                [RatingCategory.SERVICE]: ratings[RatingCategory.SERVICE] ?? null,
                [RatingCategory.ENVIRONMENT]: ratings[RatingCategory.ENVIRONMENT] ?? null,
                [RatingCategory.OVERALL]: ratings[RatingCategory.OVERALL] ?? null,
            },
            comments: opinion.trim() || null,
        };

        setView("submitting");
        setError("");
        setShowValidation(false);

        try {
            const response = await submitFeedbackWithRetry(submittedData, 3);
            if (response.success) {
                setView("success");
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } catch (err) {
            console.error("Submission error:", err);
            const apiError = err as ApiError;
            setError(apiError.message || "Failed to submit feedback. Please try again.");
            setView("error");
        }
    }, [
        isFormValid,
        feedbackId,
        branchCode,
        branchName,
        name,
        contact,
        ratings,
        opinion,
    ]);

    const resetForm = useCallback(() => {
        setView("form");
        setError("");
    }, []);

    return {
        view,
        error,
        showValidation,
        feedbackId,
        branchCode,
        branchName,
        name,
        setName,
        contact,
        setContact,
        opinion,
        setOpinion,
        ratings,
        handleRatingChange,
        isFormValid,
        handleSubmit,
        resetForm,
        setShowValidation,
    };
}
