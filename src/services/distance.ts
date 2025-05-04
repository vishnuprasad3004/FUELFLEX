
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
   * The straight-line distance in kilometers.
   */
  distanceKm: number;
  /**
   * A very rough mock travel time in hours based on straight-line distance.
   */
  travelTimeHours: number;
}

/**
 * Calculates the great-circle distance between two points
 * on the Earth (specified in decimal degrees) using the Haversine formula.
 * This calculates the straight-line distance ("as the crow flies").
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @returns The straight-line distance in kilometers.
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
 * Asynchronously calculates the straight-line distance between any two geographical coordinates
 * using the Haversine formula and provides a highly simplified mock travel time.
 *
 * This function works for any valid latitude/longitude pairs, including all locations within India.
 *
 * !! IMPORTANT !!
 * This implementation provides a **straight-line distance**, not the actual road distance.
 * For accurate **road distances** and realistic **travel times** within India (or anywhere),
 * you MUST integrate a real mapping/routing API like:
 * - Google Maps Distance Matrix API
 * - MapmyIndia APIs (specific to India)
 * - Mapbox Directions API
 * - OpenStreetMap routing engines (e.g., OSRM)
 *
 * The mock travel time is based on a simple average speed and does not account for traffic,
 * road types, or other real-world factors.
 *
 * @param origin The starting coordinates.
 * @param destination The destination coordinates.
 * @returns A promise that resolves to a Distance object containing the straight-line distance and a mock travel time.
 */
export async function getDistance(origin: Coordinates, destination: Coordinates): Promise<Distance> {
  // Input validation (optional but good practice)
  if (
      origin.latitude < -90 || origin.latitude > 90 ||
      origin.longitude < -180 || origin.longitude > 180 ||
      destination.latitude < -90 || destination.latitude > 90 ||
      destination.longitude < -180 || destination.longitude > 180
     ) {
      console.error("[Distance Service] Invalid coordinates provided:", origin, destination);
      throw new Error("Invalid geographical coordinates provided.");
     }


  const distanceKm = haversineDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );

  // Very basic mock travel time: Assumes an arbitrary average speed.
  // !! REPLACE this with data from a real routing API for accuracy !!
  const averageSpeedKmph = 50; // Highly unrealistic constant speed
  const travelTimeHours = distanceKm / averageSpeedKmph;

  console.log(`[Mock Distance Service] Origin: ${JSON.stringify(origin)}, Dest: ${JSON.stringify(destination)}`);
  console.log(`  - Calculated Straight-Line Distance: ${distanceKm.toFixed(2)} km`);
  console.log(`  - Highly Mock Travel Time (@${averageSpeedKmph}km/h): ${travelTimeHours.toFixed(1)} hours`);
  console.warn(`  - WARNING: Using straight-line distance and mock time. Integrate a real routing API for accuracy.`);


  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100)); // Simulate 100-200ms delay


  return {
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    travelTimeHours: parseFloat(travelTimeHours.toFixed(1)),
  };
}
