import { NextRequest, NextResponse } from 'next/server';
import type { FeedbackSubmissionRequest, FeedbackSubmissionResponse } from '@/types';

/**
 * POST /api/feedback
 * Submit feedback to the database
 */
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body: FeedbackSubmissionRequest = await request.json();

        // Validate required fields
        if (!body.feedbackId || !body.branchCode || !body.guest?.name || !body.guest?.contact) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: 'Missing required fields: feedbackId, branchCode, guest name, and contact are required.',
                },
                { status: 400 }
            );
        }

        // Validate email or phone format (basic validation)
        const contactRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$|^\+?[\d\s\-\(\)]{10,}$/;
        if (!contactRegex.test(body.guest.contact)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: 'Invalid contact format. Please provide a valid email or phone number.',
                },
                { status: 400 }
            );
        }

        // TODO: Replace this with your actual database integration
        // Example database save logic:
        /*
        const db = await getDatabase();
        await db.feedback.create({
          data: {
            feedbackId: body.feedbackId,
            branchCode: body.branchCode,
            branchName: body.branchName,
            guestName: body.guest.name,
            guestContact: body.guest.contact,
            ratingFood: body.ratings.FOOD,
            ratingService: body.ratings.SERVICE,
            ratingEnvironment: body.ratings.ENVIRONMENT,
            ratingOverall: body.ratings.OVERALL,
            comments: body.comments,
            submittedAt: new Date(body.submittedAt),
          },
        });
        */

        // Simulate database save (remove this in production)
        console.log('📝 Feedback received:', {
            id: body.feedbackId,
            branch: body.branchName,
            guest: body.guest.name,
            ratings: body.ratings,
        });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Return success response
        return NextResponse.json<FeedbackSubmissionResponse>(
            {
                success: true,
                feedbackId: body.feedbackId,
                message: 'Feedback submitted successfully!',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ Error submitting feedback:', error);

        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'INVALID_JSON',
                    message: 'Invalid request format.',
                },
                { status: 400 }
            );
        }

        // Handle unexpected errors
        return NextResponse.json(
            {
                success: false,
                error: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred. Please try again later.',
            },
            { status: 500 }
        );
    }
}

/**
 * OPTIONS /api/feedback
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
    return NextResponse.json(
        {},
        {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        }
    );
}
