import { useState, useCallback } from "react";
import { useForm, SubmitHandler, useWatch, Path } from "react-hook-form";
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
import { APP_CONFIG } from "../lib/config";

// --- Validation Schema ---
const feedbackSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contact: z.string().trim().min(1, "Contact is required").refine((val) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

const createFeedbackId = (branchCode: string) => {
    const branchPrefix = branchCode.replace("X-", "").toUpperCase() || "01";
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(100 + Math.random() * 900);

    return `${branchPrefix}${month}${day}${random}`;
};

interface UseFeedbackFormOptions {
    branchCode: string;
    branchName: string;
}

export function useFeedbackForm({ branchCode, branchName }: UseFeedbackFormOptions) {
    const [view, setView] = useState<"form" | "submitting" | "success" | "error">("form");
    const [apiError, setApiError] = useState<string>("");
    const [showValidation, setShowValidation] = useState(false);

    const [feedbackId, setFeedbackId] = useState<string>("");

    const {
        register,
        handleSubmit,
        setValue,
        control,
        trigger,
        formState: { errors, isValid },
        reset: resetHookForm,
    } = useForm<FeedbackFormValues>({

        resolver: zodResolver(feedbackSchema),
        mode: "onChange",
        reValidateMode: "onChange",
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

    const contactValue = useWatch({ control, name: "contact" });
    const contactError = errors.contact;
    const contactHasInput = Boolean(contactValue?.trim());

    const contactStatus: "valid" | "invalid" | "neutral" =
        contactHasInput && contactError
            ? "invalid"
            : contactHasInput && !contactError
              ? "valid"
              : "neutral";

    const contactShowError = Boolean(contactError) && (contactHasInput || showValidation);

    const ratings = useWatch({ control, name: "ratings" });
    const sourceValue = useWatch({ control, name: "source" });
    const ageGroupValue = useWatch({ control, name: "ageGroup" });

    const handleRatingChange = useCallback(
        (category: RatingCategory, value: RatingValue) => {
            setValue(`ratings.${category}` as Path<FeedbackFormValues>, value, { 
                shouldValidate: true, shouldDirty: true, shouldTouch: true 
            });
        },
        [setValue]
    );

    const setFieldValue = useCallback(<K extends keyof FeedbackFormValues>(field: K, value: FeedbackFormValues[K]) => {
        setValue(field as Path<FeedbackFormValues>, value, { 
            shouldValidate: true, shouldDirty: true, shouldTouch: true 
        });
    }, [setValue]);

    const onSubmit: SubmitHandler<FeedbackFormValues> = async (data) => {
        const submissionFeedbackId = feedbackId || createFeedbackId(branchCode);

        if (!feedbackId) {
            setFeedbackId(submissionFeedbackId);
        }

        setView("submitting");
        setApiError("");
        setShowValidation(false);

        const submittedData: FeedbackSubmissionRequest = {
            feedbackId: submissionFeedbackId,
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
                if (typeof window !== "undefined" && "scrollTo" in window) {
                  window.scrollTo({ top: 0, behavior: APP_CONFIG.ANIMATION.SCROLL_BEHAVIOR });
                }
            }
        } catch (err) {
            console.error("Submission error:", err);
            const apiErrorObj = err as ApiError;
            setApiError(apiErrorObj.message || APP_CONFIG.FEEDBACK.ERROR_DEFAULT);
            setView("error");
        }
    };

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
        setFeedbackId("");
        resetHookForm();
    }, [resetHookForm]);

    return {
        view,
        error: apiError,
        feedbackId,
        branchCode,
        branchName,
        ratings,
        sourceValue,
        ageGroupValue,
        setFieldValue,
        handleRatingChange,
        resetForm,
        register,
        onSubmitWrapper,
        errors,
        isValid,
        contactStatus,
        contactShowError,
    };
}
