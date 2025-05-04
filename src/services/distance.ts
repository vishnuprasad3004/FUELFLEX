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
   * The estimated travel time in hours. This is a placeholder and needs a real routing service for accuracy.
   */
  travelTimeHours: number;
}

/**
 * Calculates the great-circle distance between two points
 * on the Earth (specified in decimal degrees) using the Haversine formula.
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @returns The distance in kilometers.
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Asynchronously calculates the distance between two geographical coordinates using the Haversine formula.
 * Provides a mock travel time.
 *
 * !! IMPORTANT !!
 * This implementation uses the Haversine formula for a straight-line distance.
 * For accurate road distances and travel times, integrate a real mapping/routing API
 * (like Google Maps Distance Matrix API, Mapbox Directions API, etc.).
 *
 * @param origin The starting coordinates.
 * @param destination The destination coordinates.
 * @returns A promise that resolves to a Distance object containing distance and mock travel time.
 */
export async function getDistance(origin: Coordinates, destination: Coordinates): Promise<Distance> {
  const distanceKm = haversineDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );

  // Mock travel time: Assume an average speed of 50 km/h for simplicity.
  // Replace this with data from a real routing API.
  const averageSpeedKmph = 50;
  const travelTimeHours = distanceKm / averageSpeedKmph;

  // Add a small random factor to simulate variability - REMOVE for production API
  const randomFactor = 1 + (Math.random() - 0.5) * 0.2; // +/- 10% variation
  const slightlyRandomDistance = Math.max(10, distanceKm * randomFactor); // Ensure min distance
  const slightlyRandomTime = Math.max(0.2, travelTimeHours * randomFactor); // Ensure min time

  console.log(`[Mock Distance Service] Origin: ${JSON.stringify(origin)}, Dest: ${JSON.stringify(destination)}, Calculated Distance: ${slightlyRandomDistance.toFixed(2)} km, Mock Time: ${slightlyRandomTime.toFixed(1)} hours`);


  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 150));


  return {
    // Using the slightly randomized value for demonstration. Use `distanceKm` if randomness isn't desired.
    distanceKm: parseFloat(slightlyRandomDistance.toFixed(2)),
    // Using the slightly randomized value. Use `travelTimeHours` if randomness isn't desired.
    travelTimeHours: parseFloat(slightlyRandomTime.toFixed(1)),
  };
}
