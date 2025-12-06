import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    RatingCategory,
    RatingValue,
    FeedbackSubmissionRequest,
    ApiError,
    AgeGroup,
    Source
} from "../types";
import { submitFeedbackWithRetry } from "../lib/api";
import { BRANCH_MAP } from "../lib/constants";
import { APP_CONFIG } from "../lib/config";

// --- Validation Schema ---
const feedbackSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contact: z.string().trim().min(1, "Contact is required").refine((val) => {
        // Loose email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Loose phone validation (at least 7 digits/symbols)
        const phoneRegex = /^[\d\s+\-()]{7,}$/;
        return emailRegex.test(val) || phoneRegex.test(val);
    }, {
        message: "Please enter a valid email or phone number",
    }),
    ageGroup: z.nativeEnum(AgeGroup).optional(),
    source: z.nativeEnum(Source).optional(),
    opinion: z.string().optional(),
    ratings: z.object({
        [RatingCategory.FOOD]: z.nativeEnum(RatingValue).nullable(),
        [RatingCategory.SERVICE]: z.nativeEnum(RatingValue).nullable(),
        [RatingCategory.ENVIRONMENT]: z.nativeEnum(RatingValue).nullable(),
        [RatingCategory.EVENT]: z.nativeEnum(RatingValue).nullable(),
        [RatingCategory.OVERALL]: z.nativeEnum(RatingValue).nullable(),
    }),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

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
            ageGroup: undefined,
            source: undefined,
            opinion: "",
            ratings: {
                [RatingCategory.FOOD]: null,
                [RatingCategory.SERVICE]: null,
                [RatingCategory.ENVIRONMENT]: null,
                [RatingCategory.EVENT]: null,
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

    // Watch values for UI updates (custom select/chips)
    const ratings = watch("ratings");
    const sourceValue = watch("source");
    const ageGroupValue = watch("ageGroup");

    const handleRatingChange = useCallback(
        (category: RatingCategory, value: RatingValue) => {
            // We use 'as any' for the path here because string template inference with deep nested objects
            // and Enums can be brittle in RHF's types.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue(`ratings.${category}` as any, value, { shouldValidate: true });
        },
        [setValue]
    );

    // Generic handler for custom inputs
    const setFieldValue = useCallback(<K extends keyof FeedbackFormValues>(field: K, value: FeedbackFormValues[K]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(field, value as any, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }, [setValue]);

    const onSubmit: SubmitHandler<FeedbackFormValues> = async (data) => {
        setView("submitting");
        setApiError("");
        setShowValidation(false);

        const submittedData: FeedbackSubmissionRequest = {
            feedbackId,
            branchCode,
            branchName,
            submittedAt: new Date().toISOString(),
            guest: {
                name: data.name.trim(),
                contact: data.contact.trim(),
                ageGroup: data.ageGroup,
                source: data.source,
            },
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

    return {
        view,
        error: apiError,
        feedbackId,
        branchCode,
        branchName,
        ratings,
        sourceValue, // Exported for UI
        ageGroupValue, // Exported for UI
        setFieldValue, // Exported for custom inputs
        handleRatingChange,
        resetForm,
        register,
        onSubmitWrapper,
        errors,
        isValid,
        contactStatus,
    };
}
