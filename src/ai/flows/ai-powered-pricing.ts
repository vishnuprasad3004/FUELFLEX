// This is a server-side code.
'use server';
/**
 * @fileOverview An AI-powered pricing model that dynamically adjusts transport costs for India.
 *
 * - calculatePrice - A function that calculates the price based on distance, load, and fuel rates.
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
  breakdown: z.string().describe('A detailed breakdown of the price calculation in INR.'),
  currency: z.string().describe('The currency code (e.g., INR).').default('INR'),
});
export type CalculatePriceOutput = z.infer<typeof CalculatePriceOutputSchema>;

export async function calculatePrice(input: CalculatePriceInput): Promise<CalculatePriceOutput> {
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

const calculatePriceFlow = ai.defineFlow<
  typeof CalculatePriceInputSchema,
  typeof CalculatePriceOutputSchema
>({
  name: 'calculatePriceFlow',
  inputSchema: CalculatePriceInputSchema,
  outputSchema: CalculatePriceOutputSchema,
}, async (input): Promise<CalculatePriceOutput> => {
  const {pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude, loadWeightKg} = input;

  // Fetch dynamic (but potentially still mock) data from services
  let fuelInfo: FuelPrice;
  let distanceInfo: Distance;
  try {
     [fuelInfo, distanceInfo] = await Promise.all([
        getFuelPrice(),
        getDistance(
            {latitude: pickupLatitude, longitude: pickupLongitude},
            {latitude: destinationLatitude, longitude: destinationLongitude}
        )
     ]);
  } catch (error) {
      console.error("Error fetching service data:", error);
      // Provide a default error response or re-throw
      // Returning a structured error might be better
       return {
         estimatedPrice: 0,
         breakdown: "Error calculating price: Failed to fetch necessary data (distance or fuel price). Please try again later.",
         currency: "INR",
       };
  }


   // Ensure currency from fuel service is INR, otherwise, there's a mismatch
   if (fuelInfo.currency !== 'INR') {
     console.warn(`Fuel price currency mismatch. Expected INR, got ${fuelInfo.currency}. Proceeding, but AI might be confused.`);
     // Potentially handle currency conversion here if necessary, or return an error
   }

  try {
      const {output} = await pricingPrompt({
        distanceKm: distanceInfo.distanceKm,
        travelTimeHours: distanceInfo.travelTimeHours,
        loadWeightKg: loadWeightKg,
        fuelInfo: { // Pass the whole fuelInfo object
          price: fuelInfo.price,
          currency: fuelInfo.currency,
        }
      });

      // Ensure the output is not null and has the required fields
      if (!output || typeof output.estimatedPrice !== 'number' || typeof output.breakdown !== 'string') {
          throw new Error("AI response format invalid or missing required fields.");
      }

       // Round the estimated price
       const roundedPrice = Math.round(output.estimatedPrice);

      return {
          ...output,
          estimatedPrice: roundedPrice, // Return the rounded price
          currency: 'INR', // Explicitly set currency in the final output
      };
  } catch (aiError) {
       console.error("Error getting response from AI prompt:", aiError);
       return {
         estimatedPrice: 0,
         breakdown: "Error calculating price: AI model failed to generate a valid estimate. Please try again later.",
         currency: "INR",
       };
  }
});
