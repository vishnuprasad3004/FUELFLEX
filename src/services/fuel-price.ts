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
 * Asynchronously retrieves the current fuel price (mock data for India).
 *
 * !! IMPORTANT !!
 * This implementation returns mock data. For real-time, accurate fuel prices,
 * integrate a reliable external API specific to the target region (India).
 *
 * @returns A promise that resolves to a FuelPrice object containing the mock price and currency (INR).
 */
export async function getFuelPrice(): Promise<FuelPrice> {
  // TODO: Implement this by calling an external API for real-time Indian fuel prices.
  // Example sources could include government oil company APIs or third-party data providers.

  // Mock price for demonstration purposes (approximate price per liter in INR)
  const mockPriceINR = 95.50 + (Math.random() * 5 - 2.5); // Add some slight random variation

  console.log(`[Mock Fuel Price Service] Returning mock price: ${mockPriceINR.toFixed(2)} INR`);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    price: parseFloat(mockPriceINR.toFixed(2)),
    currency: 'INR', // Indian Rupee
  };
}
