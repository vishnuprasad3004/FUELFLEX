// This is a server-side code.
'use server';
/**
 * @fileOverview An AI-powered pricing model that dynamically adjusts transport costs.
 *
 * - calculatePrice - A function that calculates the price based on distance, load, and fuel rates.
 * - CalculatePriceInput - The input type for the calculatePrice function.
 * - CalculatePriceOutput - The return type for the calculatePrice function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getFuelPrice} from '@/services/fuel-price';
import {getDistance} from '@/services/distance';

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
    .describe('The estimated price for the transport, in USD.'),
  breakdown: z.string().describe('A breakdown of the price calculation.'),
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
      loadWeightKg: z.number().describe('The weight of the load in kilograms.'),
      fuelPrice: z.number().describe('The current price of fuel in USD.'),
    }),
  },
  output: {
    schema: z.object({
      estimatedPrice: z
        .number()
        .describe('The estimated price for the transport, in USD.'),
      breakdown: z.string().describe('A breakdown of the price calculation.'),
    }),
  },
  prompt: `You are an expert in logistics and pricing.

  Based on the following information, calculate the estimated price for the transport and provide a breakdown of the price calculation.

  Distance: {{distanceKm}} km
  Load Weight: {{loadWeightKg}} kg
  Fuel Price: {{fuelPrice}} USD

  Consider the fuel cost, driver salary, vehicle maintenance, and a reasonable profit margin.
  Return the estimated price in USD and a detailed breakdown of how you arrived at that price.
  `,
});

const calculatePriceFlow = ai.defineFlow<
  typeof CalculatePriceInputSchema,
  typeof CalculatePriceOutputSchema
>({
  name: 'calculatePriceFlow',
  inputSchema: CalculatePriceInputSchema,
  outputSchema: CalculatePriceOutputSchema,
}, async input => {
  const {pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude, loadWeightKg} = input;

  const fuelPrice = await getFuelPrice();
  const distance = await getDistance(
    {latitude: pickupLatitude, longitude: pickupLongitude},
    {latitude: destinationLatitude, longitude: destinationLongitude}
  );

  const {output} = await pricingPrompt({
    distanceKm: distance.distanceKm,
    loadWeightKg: loadWeightKg,
    fuelPrice: fuelPrice.price,
  });
  return output!;
});

