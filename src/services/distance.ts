
/**
 * Represents geographical coordinates with latitude and longitude.
 */
export interface Coordinates {
  /**
   * The latitude of the location.
   */
  latitude: number;
  /**
   * The longitude of the location.
   */
  longitude: number;
}

/**
 * Represents the distance and travel time between two points.
 */
export interface Distance {
  /**
   * The road distance in kilometers.
   */
  distanceKm: number;
  /**
   * The estimated travel time in hours.
   */
  travelTimeHours: number;
  /**
   * A human-readable representation of the distance (e.g., "150 km").
   */
  distanceText?: string;
  /**
   * A human-readable representation of the travel time (e.g., "2 hours 30 mins").
   */
  durationText?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Asynchronously calculates the road distance and travel time between two geographical coordinates
 * using the Google Maps Distance Matrix API.
 *
 * This function works for any valid latitude/longitude pairs, including all locations within India.
 *
 * !! IMPORTANT !!
 * This implementation requires a valid Google Maps API key with the "Distance Matrix API" enabled.
 * The API key must be set in the `GOOGLE_MAPS_API_KEY` environment variable.
 *
 * @param origin The starting coordinates.
 * @param destination The destination coordinates.
 * @returns A promise that resolves to a Distance object containing the road distance and travel time.
 * @throws Error if the API key is missing or if the API request fails.
 */
export async function getDistance(origin: Coordinates, destination: Coordinates): Promise<Distance> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("[Distance Service] ERROR: GOOGLE_MAPS_API_KEY environment variable is not set.");
    throw new Error("Google Maps API key is missing. Distance calculation cannot proceed.");
  }

  if (
      origin.latitude < -90 || origin.latitude > 90 ||
      origin.longitude < -180 || origin.longitude > 180 ||
      destination.latitude < -90 || destination.latitude > 90 ||
      destination.longitude < -180 || destination.longitude > 180
     ) {
      console.error("[Distance Service] Invalid coordinates provided:", origin, destination);
      throw new Error("Invalid geographical coordinates provided.");
     }

  const originStr = `${origin.latitude},${origin.longitude}`;
  const destinationStr = `${destination.latitude},${destination.longitude}`;
  const units = "metric"; // For kilometers and meters
  const region = "IN"; // Bias results towards India

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&units=${units}&region=${region}&key=${GOOGLE_MAPS_API_KEY}`;

  console.log(`[Distance Service] Requesting distance from Google Maps API for Origin: ${originStr}, Dest: ${destinationStr}`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status !== 'OK') {
      console.error("[Distance Service] Google Maps API Error:", data.status, data.error_message || '');
      throw new Error(`Google Maps API request failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    if (!data.rows || data.rows.length === 0 || !data.rows[0].elements || data.rows[0].elements.length === 0) {
      console.error("[Distance Service] Google Maps API returned no results:", data);
      throw new Error("Google Maps API returned no distance/duration elements.");
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      console.warn(`[Distance Service] Google Maps API could not compute route for one or more locations: ${element.status}. Using straight-line as fallback (if implemented) or failing.`);
      // Note: No straight-line fallback implemented here for now. If element.status is NOT_FOUND or ZERO_RESULTS, this will throw.
      throw new Error(`Could not compute route: ${element.status}.`);
    }

    const distanceMeters = element.distance.value; // Distance in meters
    const durationSeconds = element.duration.value; // Duration in seconds

    const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));
    const travelTimeHours = parseFloat((durationSeconds / 3600).toFixed(1)); // Convert seconds to hours

    console.log(`[Distance Service] Successfully fetched data:`);
    console.log(`  - Road Distance: ${distanceKm} km (${element.distance.text})`);
    console.log(`  - Travel Time: ${travelTimeHours} hours (${element.duration.text})`);

    return {
      distanceKm: distanceKm,
      travelTimeHours: travelTimeHours,
      distanceText: element.distance.text,
      durationText: element.duration.text,
    };

  } catch (error: any) {
    console.error("[Distance Service] Error calling Google Maps API:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during distance calculation.";
    // Propagate a more user-friendly error if possible or specific error for logging
    throw new Error(`Failed to get distance from Google API: ${errorMessage}`);
  }
}
