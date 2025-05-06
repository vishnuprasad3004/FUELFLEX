// src/app/api/calculate-price/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calculatePrice, CalculatePriceInputSchema, type CalculatePriceInput, type CalculatePriceOutput } from '@/ai/flows/ai-powered-pricing';
import { z } from 'zod';

/**
 * POST handler for the /api/calculate-price endpoint.
 * Expects a JSON body matching the CalculatePriceInput schema.
 * Calls the calculatePrice Genkit flow and returns the result as JSON.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API Route /api/calculate-price] Received request body:', body);

    // Validate the incoming request body against the Zod schema
    const validationResult = CalculatePriceInputSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('[API Route /api/calculate-price] Invalid request body:', validationResult.error.errors);
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validationResult.error.errors,
        },
        { status: 400 } // Bad Request
      );
    }

    const input: CalculatePriceInput = validationResult.data;

    // Call the Genkit flow function
    const result: CalculatePriceOutput = await calculatePrice(input);
    console.log('[API Route /api/calculate-price] Flow result:', result);


    // Check if the result indicates an error or failed estimation
    if (result.estimatedPrice <= 0 && result.breakdown.toLowerCase().includes('error')) {
        // Return a 500 status code if the flow itself reported a significant error
        return NextResponse.json(
          {
             error: 'Price estimation failed',
             details: result.breakdown, // Include the breakdown message from the flow
             currency: result.currency,
             estimatedPrice: 0, // Ensure price is 0 for errors
             distanceKm: result.distanceKm,
             travelTimeHours: result.travelTimeHours,
             distanceText: result.distanceText,
             durationText: result.durationText,
          },
          { status: 500 } // Internal Server Error (or appropriate status based on error type)
        );
    }

    // Return the successful result (including fallback results and distance/time info)
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('[API Route /api/calculate-price] Unexpected error:', error);

    // Handle potential JSON parsing errors or other unexpected issues
    let errorMessage = 'An unexpected error occurred on the server.';
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        errorMessage = 'Invalid JSON format in request body.';
        return NextResponse.json({ error: errorMessage }, { status: 400 }); // Bad Request
    } else if (error instanceof Error) {
       errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler (Optional): Returns information about how to use the endpoint.
 */
export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to this endpoint with JSON body matching CalculatePriceInput schema to get a price estimate.',
    schema: CalculatePriceInputSchema.shape, // Provide the expected input schema shape
  });
}
