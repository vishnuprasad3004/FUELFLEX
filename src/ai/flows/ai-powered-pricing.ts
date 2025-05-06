// This is a server-side code.
'use server';
/**
 * @fileOverview An AI-powered pricing model that dynamically adjusts transport costs for India.
 * Leverages Google Distance Matrix API for accurate distance and travel time.
 * Provides a fallback calculation if the AI model or distance service fails.
 *
 * - calculatePrice - A function that calculates the price based on distance, load, and fuel rates. Uses AI first, then fallback.
 * - CalculatePriceInput - The input type for the calculatePrice function.
 * - CalculatePriceOutput - The return type for the calculatePrice function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getFuelPrice, type FuelPrice} from '@/services/fuel-price';
import {getDistance, type Distance} from '@/services/distance';

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
  distanceKm: z.number().optional().describe('The calculated distance in kilometers.'),
  travelTimeHours: z.number().optional().describe('The calculated travel time in hours.'),
  distanceText: z.string().optional().describe('Human-readable distance (e.g., "150 km").'),
  durationText: z.string().optional().describe('Human-readable travel time (e.g., "2 hours 30 mins").'),
});
export type CalculatePriceOutput = z.infer<typeof CalculatePriceOutputSchema>;

// Define the fallback rate per kilometer
const FALLBACK_RATE_PER_KM = 150; // INR

export async function calculatePrice(input: CalculatePriceInput): Promise<CalculatePriceOutput> {
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
      distanceKm: z.number().describe('The road distance in kilometers between the pickup and destination.'),
      travelTimeHours: z.number().describe('Estimated road travel time in hours.'),
      loadWeightKg: z.number().describe('The weight of the load in kilograms.'),
      fuelInfo: z.object({
        price: z.number(),
        currency: z.string(),
      }).describe('Current fuel price per liter and currency (INR).'),
      distanceText: z.string().optional().describe('Human-readable distance (e.g., "150 km").'),
      durationText: z.string().optional().describe('Human-readable travel time (e.g., "2 hours 30 mins").'),
    }),
  },
  output: {
    schema: z.object({
      estimatedPrice: z
        .number()
        .describe('The estimated price for the transport, in INR.'),
      breakdown: z.string().describe('A detailed breakdown of the price calculation in INR. Explain each component like fuel cost, driver wages, maintenance, tolls (if applicable), and profit margin. Reference the provided distance and duration text if available.'),
       currency: z.string().describe('The currency code (should be INR).').default('INR'),
    }),
  },
  prompt: `You are an expert in logistics and transport pricing specifically for India, using real road distances and travel times.

  Your task is to calculate an estimated transport price in Indian Rupees (INR) based on the provided details. Provide a clear breakdown of the cost components.

  Input Details:
  - Road Distance: {{distanceKm}} km ({{distanceText}})
  - Estimated Road Travel Time: {{travelTimeHours}} hours ({{durationText}})
  - Load Weight: {{loadWeightKg}} kg
  - Current Fuel Price: {{fuelInfo.price}} {{fuelInfo.currency}} per liter

  Cost Factors to Consider (Use reasonable assumptions for the Indian market):
  1.  **Fuel Cost:** Assume an average truck fuel efficiency (e.g., 4-6 km per liter, potentially affected by load weight). Calculate total fuel needed and its cost based on the road distance.
  2.  **Driver Wages:** Estimate driver cost based on travel time (e.g., INR per hour). Consider potential overtime or night charges if applicable based on travel time.
  3.  **Vehicle Maintenance:** Include a per-kilometer charge for wear and tear (e.g., INR per km) based on road distance.
  4.  **Tolls & Taxes:** Briefly mention that tolls and state taxes will apply based on the route. You don't need to calculate them precisely, but acknowledge their impact.
  5.  **Profit Margin:** Add a reasonable profit margin (e.g., 15-25%) to the total operational cost.
  6.  **Load Weight Impact:** Heavier loads might slightly decrease fuel efficiency and increase wear. Factor this in qualitatively or with a small multiplier if possible.

  Output Requirements:
  - Return the final estimated price rounded to the nearest whole Rupee.
  - Ensure the currency is explicitly stated as INR in the breakdown.
  - Provide a clear, itemized breakdown explaining how you arrived at the final price, referencing the input details (especially road distance and travel time) and your assumed rates for the factors above.
  `,
});

const calculateFallbackPrice = (distanceInfo: Distance | { distanceKm: number }): CalculatePriceOutput => {
    const fallbackPrice = distanceInfo.distanceKm * FALLBACK_RATE_PER_KM;
    const roundedFallbackPrice = Math.round(fallbackPrice);
    const distanceText = 'distanceText' in distanceInfo && distanceInfo.distanceText ? `(${distanceInfo.distanceText})` : `(${distanceInfo.distanceKm.toFixed(2)} km)`;

    console.log(`[CalculatePriceFlow] Using fallback rate: ${distanceInfo.distanceKm.toFixed(2)} km * ${FALLBACK_RATE_PER_KM} INR/km = ${roundedFallbackPrice} INR`);
    return {
      estimatedPrice: roundedFallbackPrice,
      breakdown: `AI estimation failed or is unavailable (check Genkit API key/configuration). Using fallback rate of ${FALLBACK_RATE_PER_KM} INR/km. Total road distance: ${distanceInfo.distanceKm.toFixed(2)} km ${distanceText}.`,
      currency: 'INR',
      distanceKm: distanceInfo.distanceKm,
      travelTimeHours: 'travelTimeHours' in distanceInfo ? distanceInfo.travelTimeHours : undefined,
      distanceText: 'distanceText' in distanceInfo ? distanceInfo.distanceText : undefined,
      durationText: 'durationText' in distanceInfo ? distanceInfo.durationText : undefined,
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

  let fuelInfo: FuelPrice;
  let distanceInfo: Distance;
  try {
     console.log('[CalculatePriceFlow] Fetching fuel price and distance from services...');
     [fuelInfo, distanceInfo] = await Promise.all([
        getFuelPrice(),
        getDistance(
            {latitude: pickupLatitude, longitude: pickupLongitude},
            {latitude: destinationLatitude, longitude: destinationLongitude}
        )
     ]);
     console.log('[CalculatePriceFlow] Fetched data:', { fuelInfo, distanceInfo });

     if (!distanceInfo || typeof distanceInfo.distanceKm !== 'number' || distanceInfo.distanceKm < 0 || typeof distanceInfo.travelTimeHours !== 'number' || distanceInfo.travelTimeHours < 0) {
       throw new Error("Invalid distance or travel time data received from service.");
     }

  } catch (error: any) {
      console.error("[CalculatePriceFlow] Error fetching service data:", error);
      const serviceError = error instanceof Error ? error.message : "Unknown service error";
      
      let userFriendlyError = `Error calculating price: Failed to fetch necessary data (${serviceError}). Please try again later.`;
      if (serviceError.includes("Google Maps API key is missing")) {
        userFriendlyError = "Configuration Error: Google Maps API key is not set. Please contact support.";
      } else if (serviceError.includes("Google Maps API request failed: REQUEST_DENIED")) {
         userFriendlyError = "Configuration Error: Invalid Google Maps API key or API not enabled. Please contact support.";
      } else if (serviceError.includes("Could not compute route")) {
        userFriendlyError = "Error: Could not determine a route between the specified locations. Please check the addresses.";
      }

      return {
         estimatedPrice: 0,
         breakdown: userFriendlyError,
         currency: "INR",
       };
  }

   if (fuelInfo.currency !== 'INR') {
     console.warn(`[CalculatePriceFlow] Fuel price currency mismatch. Expected INR, got ${fuelInfo.currency}. Proceeding, but AI might be confused.`);
   }

  const promptInput = {
    distanceKm: distanceInfo.distanceKm,
    travelTimeHours: distanceInfo.travelTimeHours,
    loadWeightKg: loadWeightKg,
    fuelInfo: {
      price: fuelInfo.price,
      currency: fuelInfo.currency,
    },
    distanceText: distanceInfo.distanceText,
    durationText: distanceInfo.durationText,
  };
  console.log('[CalculatePriceFlow] Prepared input for AI prompt:', promptInput);

  try {
      console.log('[CalculatePriceFlow] Calling AI pricing prompt...');
      const {output} = await pricingPrompt(promptInput);
      console.log('[CalculatePriceFlow] Received AI prompt output:', output);

      if (!output || typeof output.estimatedPrice !== 'number' || output.estimatedPrice <= 0 || typeof output.breakdown !== 'string' || !output.breakdown.trim()) {
          console.warn("[CalculatePriceFlow] AI response format invalid, missing required fields, or price <= 0:", output);
          return calculateFallbackPrice(distanceInfo);
      }

       const roundedPrice = Math.round(output.estimatedPrice);
       console.log(`[CalculatePriceFlow] AI Original price: ${output.estimatedPrice}, Rounded price: ${roundedPrice}`);

      return {
          estimatedPrice: roundedPrice,
          breakdown: output.breakdown,
          currency: 'INR',
          distanceKm: distanceInfo.distanceKm,
          travelTimeHours: distanceInfo.travelTimeHours,
          distanceText: distanceInfo.distanceText,
          durationText: distanceInfo.durationText,
      };
  } catch (aiError: any) {
       console.error("[CalculatePriceFlow] Error getting response from AI prompt:", aiError);
       const aiErrorMessage = aiError instanceof Error ? aiError.message : "Unknown AI error";

       const isGenkitApiKeyError = aiErrorMessage.includes('API_KEY_INVALID') ||
                             aiErrorMessage.includes('API key not valid') || // For Genkit/Google AI
                             aiErrorMessage.includes('Please pass in the API key') || // For Genkit/Google AI
                             aiErrorMessage.includes('FAILED_PRECONDITION'); // For Genkit/Google AI

       if (isGenkitApiKeyError) {
         console.warn("[CalculatePriceFlow] Genkit/Google AI API Key error detected. Using fallback calculation.");
         const fallbackResult = calculateFallbackPrice(distanceInfo);
         fallbackResult.breakdown = `AI configuration error (Genkit API Key). Using fallback rate. Original AI error: ${aiErrorMessage}. Total road distance: ${distanceInfo.distanceKm.toFixed(2)} km.`;
         return fallbackResult;
       } else {
         console.warn("[CalculatePriceFlow] Non-API key AI error occurred. Using fallback calculation.");
         const fallbackResult = calculateFallbackPrice(distanceInfo);
         fallbackResult.breakdown = `AI estimation failed (${aiErrorMessage}). Using fallback rate of ${FALLBACK_RATE_PER_KM} INR/km. Total road distance: ${distanceInfo.distanceKm.toFixed(2)} km ${distanceInfo.distanceText ? `(${distanceInfo.distanceText})` : ''}.`;
         return fallbackResult;
       }
  }
});
