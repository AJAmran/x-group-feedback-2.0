import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RatingCategory, RatingValue, FeedbackSubmissionRequest, ApiError } from "../types";
import { submitFeedbackWithRetry } from "../lib/api";
import { BRANCH_MAP } from "../lib/constants";
import { APP_CONFIG } from "../lib/config";

// --- Validation Schema ---
const feedbackSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contact: z.string().superRefine((val, ctx) => {
        if (!val) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Contact is required" });
            return;
        }
        // Check for Email OR Mobile
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isMobile = /^[0-9+\-\s()]{7,}$/.test(val); // Basic mobile validation (7+ digits/chars)

        if (!isEmail && !isMobile) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid email or mobile number" });
        }
    }),
    opinion: z.string().optional(),
    ratings: z.object({
        [RatingCategory.FOOD]: z.nativeEnum(RatingValue).nullable(),
        [RatingCategory.SERVICE]: z.nativeEnum(RatingValue).nullable(),
        [RatingCategory.ENVIRONMENT]: z.nativeEnum(RatingValue).nullable(),
        [RatingCategory.OVERALL]: z.nativeEnum(RatingValue).nullable(),
    }),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

/**
 * Custom hook to manage Feedback Form state and logic.
 * Uses react-hook-form + zod for validation.
 */
export function useFeedbackForm() {
    const [view, setView] = useState<"form" | "submitting" | "success" | "error">("form");
    const [apiError, setApiError] = useState<string>("");

    // Tracks if validation errors should be explicitly shown (e.g. after failed submit attempt)
    const [showValidation, setShowValidation] = useState(false);

    const searchParams = useSearchParams();
    const branchParam = searchParams.get("branch");
    const branchCode = branchParam ? branchParam.toUpperCase() : APP_CONFIG.DEFAULT_BRANCH_CODE;
    const branchName = BRANCH_MAP[branchCode] || APP_CONFIG.DEFAULT_BRANCH_NAME;

    const [feedbackId, setFeedbackId] = useState("");

    useEffect(() => {
        const branchPrefix = branchCode.replace("X-", "").toUpperCase() || "01";
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const random = Math.floor(100 + Math.random() * 900);
        setFeedbackId(`${branchPrefix}${month}${day}${random}`);
    }, [branchCode]);

    // Initialize React Hook Form
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors, isValid, touchedFields },
        reset: resetHookForm,
    } = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackSchema),
        mode: "onBlur", // Validation on blur as requested
        defaultValues: {
            name: "",
            contact: "",
            opinion: "",
            ratings: {
                [RatingCategory.FOOD]: null,
                [RatingCategory.SERVICE]: null,
                [RatingCategory.ENVIRONMENT]: null,
                [RatingCategory.OVERALL]: null,
            },
        },
    });

    const contactValue = watch("contact");
    const contactError = errors.contact;
    const contactTouched = touchedFields.contact;

    // "valid" only if: value exists AND no error AND touched
    // "invalid" if: error exists AND (touched OR showValidation)
    // "neutral" otherwise
    const getValidationStatus = (fieldError: unknown, isTouched: boolean | undefined, value: string): "valid" | "invalid" | "neutral" => {
        if ((isTouched || showValidation) && fieldError) return "invalid";
        if (isTouched && !fieldError && value) return "valid";
        return "neutral";
    };

    const contactStatus = getValidationStatus(contactError, contactTouched, contactValue);
    // nameStatus removed as per user request to only show for Contact

    // Watch ratings for local usage
    const ratings = watch("ratings");

    const handleRatingChange = useCallback(
        (category: RatingCategory, value: RatingValue) => {
            // Force path type to avoid deep nesting inference issues with enums
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue(`ratings.${category}` as any, value, { shouldValidate: true });
        },
        [setValue]
    );

    const onSubmit: SubmitHandler<FeedbackFormValues> = async (data) => {
        setView("submitting");
        setApiError("");
        setShowValidation(false);

        const submittedData: FeedbackSubmissionRequest = {
            feedbackId,
            branchCode,
            branchName,
            submittedAt: new Date().toISOString(),
            guest: { name: data.name.trim(), contact: data.contact.trim() },
            ratings: data.ratings,
            comments: data.opinion?.trim() || null,
        };

        try {
            const response = await submitFeedbackWithRetry(submittedData, 3);
            if (response.success) {
                setView("success");
                window.scrollTo({ top: 0, behavior: APP_CONFIG.ANIMATION.SCROLL_BEHAVIOR });
            }
        } catch (err) {
            console.error("Submission error:", err);
            const apiErrorObj = err as ApiError;
            setApiError(apiErrorObj.message || APP_CONFIG.FEEDBACK.ERROR_DEFAULT);
            setView("error");
        }
    };

    // Wrapper for form submit to handle validation visibility on error
    const onSubmitWrapper = async () => {
        const isFormValid = await trigger();
        if (!isFormValid) {
            setShowValidation(true);
            return;
        }
        handleSubmit(onSubmit)();
    }

    const resetForm = useCallback(() => {
        setView("form");
        setApiError("");
        setShowValidation(false);
        resetHookForm();
    }, [resetHookForm]);

    // Handle Manual blurs if needed (RHF handles onBlur via register)

    // Additional logic for "showValidation" - purely for the "Submit" button click scenario 
    // where we want to show all errors at once if the user tries to submit empty form.

    return {
        view,
        error: apiError,
        feedbackId,
        branchCode,
        branchName,
        ratings,
        handleRatingChange,
        resetForm,
        // RHF props
        register,
        onSubmitWrapper,
        errors,
        isValid, // Form-level validity
        contactStatus,
    };
}
