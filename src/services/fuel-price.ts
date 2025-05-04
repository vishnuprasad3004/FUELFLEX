
/**
 * Represents the fuel price information.
 */
export interface FuelPrice {
  /**
   * The price of fuel per unit (e.g., per liter).
   */
  price: number;
  /**
   * The currency of the fuel price (ISO 4217 code).
   */
  currency: string;
}

/**
 * Asynchronously retrieves a *mock* fuel price suitable for demonstrations involving India (INR).
 *
 * !! IMPORTANT !!
 * This implementation returns **mock data** with a fixed currency (INR) and a randomized price.
 * It is intended for development and demonstration purposes only.
 *
 * For real-time, accurate fuel prices in India, you **MUST** integrate a reliable external API.
 * Potential sources include:
 * - APIs from Indian government oil companies (if available).
 * - Third-party data providers specializing in fuel prices (e.g., specific financial data services).
 * - Web scraping (use with caution and respect terms of service).
 *
 * @returns A promise that resolves to a FuelPrice object containing a mock price in INR.
 */
export async function getFuelPrice(): Promise<FuelPrice> {
  // TODO: Replace this mock implementation with a call to a real fuel price API for India.

  // Mock price for demonstration (approximate price per liter in INR with variation)
  const basePriceINR = 95.00; // A plausible base price
  const variation = (Math.random() - 0.5) * 8; // +/- 4 INR variation
  const mockPriceINR = basePriceINR + variation;

  console.log(`[Mock Fuel Price Service] Returning mock price: ${mockPriceINR.toFixed(2)} INR`);
  console.warn(`  - WARNING: Using mock fuel price data. Integrate a real API for accuracy.`);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 70)); // Simulate 80-150ms delay

  return {
    price: parseFloat(mockPriceINR.toFixed(2)),
    currency: 'INR', // Indian Rupee - Set explicitly for the Indian context
  };
}
