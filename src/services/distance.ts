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
 * Represents the distance between two points.
 */
export interface Distance {
  /**
   * The distance in kilometers.
   */
  distanceKm: number;
  /**
   * The estimated travel time in hours.
   */
  travelTimeHours: number;
}

/**
 * Asynchronously calculates the distance and travel time between two geographical coordinates.
 *
 * @param origin The starting coordinates.
 * @param destination The destination coordinates.
 * @returns A promise that resolves to a Distance object containing distance and travel time.
 */
export async function getDistance(origin: Coordinates, destination: Coordinates): Promise<Distance> {
  // TODO: Implement this by calling an external API.

  return {
    distanceKm: 150,
    travelTimeHours: 2.5,
  };
}
