// This is a server-side code.
'use server';
/**
 * @fileOverview An AI-powered pricing model that dynamically adjusts transport costs for India.
 * Provides a fallback calculation if the AI model fails or is unavailable.
 *
 * - calculatePrice - A function that calculates the price based on distance, load, and fuel rates. Uses AI first, then fallback.
 * - CalculatePriceInput - The input type for the calculatePrice function.
 * - CalculatePriceOutput - The return type for the calculatePrice function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getFuelPrice, FuelPrice} from '@/services/fuel-price';
import {getDistance, Distance} from '@/services/distance';

const CalculatePriceInputSchema = z.object({
  pickupLatitude: z.number().describe('The latitude of the pickup location.'),
  pickupLongitude: z.number().describe('The longitude of the pickup location.'),
  destinationLatitude: z.number().describe('The latitude of the destination location.'),
  destinationLongitude: z.number().describe('The longitude of the destination location.'),
  loadWeightKg: z.number().describe('The weight of the load in kilograms.'),
});
export type CalculatePriceInput = z.infer<typeof CalculatePriceInputSchema>;

const CalculatePriceOutputSchema = z.object({
  estimatedPrice: z
    .number()
    .describe('The estimated price for the transport, in INR (Indian Rupees).'),
  breakdown: z.string().describe('A detailed breakdown of the price calculation in INR, or an error/fallback message.'),
  currency: z.string().describe('The currency code (e.g., INR).').default('INR'),
});
export type CalculatePriceOutput = z.infer<typeof CalculatePriceOutputSchema>;

// Define the fallback rate per kilometer
const FALLBACK_RATE_PER_KM = 150; // INR

export async function calculatePrice(input: CalculatePriceInput): Promise<CalculatePriceOutput> {
  // Input validation (basic)
  if (
    !input ||
    typeof input.pickupLatitude !== 'number' ||
    typeof input.pickupLongitude !== 'number' ||
    typeof input.destinationLatitude !== 'number' ||
    typeof input.destinationLongitude !== 'number' ||
    typeof input.loadWeightKg !== 'number' ||
    input.loadWeightKg <= 0
  ) {
    console.error('[CalculatePriceFlow] Invalid input received:', input);
    return {
      estimatedPrice: 0,
      breakdown: "Error: Invalid input provided. Please check pickup/destination coordinates and load weight.",
      currency: "INR",
    };
  }
  console.log('[CalculatePriceFlow] Received valid input:', input);
  return calculatePriceFlow(input);
}

const pricingPrompt = ai.definePrompt({
  name: 'pricingPrompt',
  input: {
    schema: z.object({
      distanceKm: z.number().describe('The distance in kilometers between the pickup and destination.'),
      travelTimeHours: z.number().describe('Estimated travel time in hours.'),
      loadWeightKg: z.number().describe('The weight of the load in kilograms.'),
      fuelInfo: z.object({
        price: z.number(),
        currency: z.string(),
      }).describe('Current fuel price per liter and currency (INR).'),
    }),
  },
  output: {
    schema: z.object({
      estimatedPrice: z
        .number()
        .describe('The estimated price for the transport, in INR.'),
      breakdown: z.string().describe('A detailed breakdown of the price calculation in INR. Explain each component like fuel cost, driver wages, maintenance, tolls (if applicable), and profit margin.'),
       currency: z.string().describe('The currency code (should be INR).').default('INR'),
    }),
  },
  prompt: `You are an expert in logistics and transport pricing specifically for India.

  Your task is to calculate an estimated transport price in Indian Rupees (INR) based on the provided details. Provide a clear breakdown of the cost components.

  Input Details:
  - Distance: {{distanceKm}} km
  - Estimated Travel Time: {{travelTimeHours}} hours
  - Load Weight: {{loadWeightKg}} kg
  - Current Fuel Price: {{fuelInfo.price}} {{fuelInfo.currency}} per liter

  Cost Factors to Consider (Use reasonable assumptions for the Indian market):
  1.  **Fuel Cost:** Assume an average truck fuel efficiency (e.g., 4-6 km per liter, potentially affected by load weight). Calculate total fuel needed and its cost.
  2.  **Driver Wages:** Estimate driver cost based on travel time (e.g., INR per hour). Consider potential overtime or night charges if applicable based on travel time.
  3.  **Vehicle Maintenance:** Include a per-kilometer charge for wear and tear (e.g., INR per km).
  4.  **Tolls & Taxes:** Briefly mention that tolls and state taxes might apply, although you don't need to calculate them precisely unless specifically instructed. Assume a small buffer if needed.
  5.  **Profit Margin:** Add a reasonable profit margin (e.g., 15-25%) to the total operational cost.
  6.  **Load Weight Impact:** Heavier loads might slightly decrease fuel efficiency and increase wear. Factor this in qualitatively or with a small multiplier if possible.

  Output Requirements:
  - Return the final estimated price rounded to the nearest whole Rupee.
  - Ensure the currency is explicitly stated as INR in the breakdown.
  - Provide a clear, itemized breakdown explaining how you arrived at the final price, referencing the input details and your assumed rates for the factors above.
  `,
});

// Helper function to calculate and format fallback price
const calculateFallbackPrice = (distanceKm: number): CalculatePriceOutput => {
    const fallbackPrice = distanceKm * FALLBACK_RATE_PER_KM;
    const roundedFallbackPrice = Math.round(fallbackPrice);
    console.log(`[CalculatePriceFlow] Using fallback rate: ${distanceKm.toFixed(2)} km * ${FALLBACK_RATE_PER_KM} INR/km = ${roundedFallbackPrice} INR`);
    return {
      estimatedPrice: roundedFallbackPrice,
      breakdown: `AI estimation failed or is unavailable (check API key/configuration). Using fallback rate of ${FALLBACK_RATE_PER_KM} INR/km. Total distance: ${distanceKm.toFixed(2)} km.`,
      currency: 'INR',
    };
}

const calculatePriceFlow = ai.defineFlow<
  typeof CalculatePriceInputSchema,
  typeof CalculatePriceOutputSchema
>({
  name: 'calculatePriceFlow',
  inputSchema: CalculatePriceInputSchema,
  outputSchema: CalculatePriceOutputSchema,
}, async (input): Promise<CalculatePriceOutput> => {
  const {pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude, loadWeightKg} = input;
  console.log('[CalculatePriceFlow] Starting flow execution.');

  // Fetch dynamic (but potentially still mock) data from services
  let fuelInfo: FuelPrice;
  let distanceInfo: Distance;
  try {
     console.log('[CalculatePriceFlow] Fetching fuel price and distance...');
     [fuelInfo, distanceInfo] = await Promise.all([
        getFuelPrice(),
        getDistance(
            {latitude: pickupLatitude, longitude: pickupLongitude},
            {latitude: destinationLatitude, longitude: destinationLongitude}
        )
     ]);
     console.log('[CalculatePriceFlow] Fetched data:', { fuelInfo, distanceInfo });

     // Basic check for valid distance
     if (!distanceInfo || typeof distanceInfo.distanceKm !== 'number' || distanceInfo.distanceKm < 0) {
       throw new Error("Invalid distance data received from service.");
     }

  } catch (error: any) {
      console.error("[CalculatePriceFlow] Error fetching service data:", error);
      const serviceError = error instanceof Error ? error.message : "Unknown service error";
      // Cannot calculate fallback without distance, so return an error.
      return {
         estimatedPrice: 0,
         breakdown: `Error calculating price: Failed to fetch necessary data (${serviceError}). Unable to calculate fallback. Please try again later.`,
         currency: "INR",
       };
  }


   // Ensure currency from fuel service is INR, otherwise, there's a mismatch
   if (fuelInfo.currency !== 'INR') {
     console.warn(`[CalculatePriceFlow] Fuel price currency mismatch. Expected INR, got ${fuelInfo.currency}. Proceeding, but AI might be confused.`);
     // Consider adding currency conversion or returning an error if strict INR is required
   }

  // Prepare input for the AI prompt
  const promptInput = {
    distanceKm: distanceInfo.distanceKm,
    travelTimeHours: distanceInfo.travelTimeHours,
    loadWeightKg: loadWeightKg,
    fuelInfo: {
      price: fuelInfo.price,
      currency: fuelInfo.currency,
    }
  };
  console.log('[CalculatePriceFlow] Prepared input for AI prompt:', promptInput);

  try {
      console.log('[CalculatePriceFlow] Calling AI pricing prompt...');
      const {output} = await pricingPrompt(promptInput);
      console.log('[CalculatePriceFlow] Received AI prompt output:', output);

      // More robust check for valid output format from AI
      if (!output || typeof output.estimatedPrice !== 'number' || output.estimatedPrice <= 0 || typeof output.breakdown !== 'string' || !output.breakdown.trim()) {
          console.warn("[CalculatePriceFlow] AI response format invalid, missing required fields, or price <= 0:", output);
          // Use fallback if AI response is invalid or yields non-positive price
          return calculateFallbackPrice(distanceInfo.distanceKm);
      }

       // Round the estimated price from AI to the nearest whole number
       const roundedPrice = Math.round(output.estimatedPrice);
       console.log(`[CalculatePriceFlow] AI Original price: ${output.estimatedPrice}, Rounded price: ${roundedPrice}`);

      return {
          estimatedPrice: roundedPrice,
          breakdown: output.breakdown, // Use the breakdown directly from AI
          currency: 'INR', // Ensure currency is always INR in the final output
      };
  } catch (aiError: any) {
       console.error("[CalculatePriceFlow] Error getting response from AI prompt:", aiError);
       const aiErrorMessage = aiError instanceof Error ? aiError.message : "Unknown AI error";

       // Check if the error is related to API key validity
       const isApiKeyError = aiErrorMessage.includes('API_KEY_INVALID') ||
                             aiErrorMessage.includes('API key not valid') ||
                             aiErrorMessage.includes('Please pass in the API key') ||
                             aiErrorMessage.includes('FAILED_PRECONDITION'); // Include FAILED_PRECONDITION check

       if (isApiKeyError) {
         console.warn("[CalculatePriceFlow] API Key error detected. Using fallback calculation.");
         return calculateFallbackPrice(distanceInfo.distanceKm);
       } else {
         // For other AI errors, still use fallback as estimation failed
         console.warn("[CalculatePriceFlow] Non-API key AI error occurred. Using fallback calculation.");
         // Optionally, could provide a slightly different breakdown message here
         const fallbackResult = calculateFallbackPrice(distanceInfo.distanceKm);
         fallbackResult.breakdown = `AI estimation failed (${aiErrorMessage}). Using fallback rate of ${FALLBACK_RATE_PER_KM} INR/km. Total distance: ${distanceInfo.distanceKm.toFixed(2)} km.`;
         return fallbackResult;
        // Or, if preferred, return a generic error without fallback for non-key errors:
        // return {
        //   estimatedPrice: 0,
        //   breakdown: `Error calculating price: AI model failed (${aiErrorMessage}). Fallback not applicable for this error. Please try again later.`,
        //   currency: "INR",
        // };
       }
  }
});
