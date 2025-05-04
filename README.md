# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## AI-Powered Pricing API

This application includes an AI-powered pricing feature exposed via a REST API endpoint. You can call this endpoint from client applications like Flutter to get transport price estimates.

**Endpoint:** `/api/calculate-price`

**Method:** `POST`

**Request Body:**

The request body must be a JSON object matching the following structure:

```json
{
  "pickupLatitude": number,     // e.g., 28.6139 (Delhi)
  "pickupLongitude": number,    // e.g., 77.2090 (Delhi)
  "destinationLatitude": number, // e.g., 19.0760 (Mumbai)
  "destinationLongitude": number,// e.g., 72.8777 (Mumbai)
  "loadWeightKg": number        // e.g., 1500
}
```

**Success Response (Status 200 OK):**

Returns a JSON object with the estimated price and breakdown:

```json
{
  "estimatedPrice": number, // The calculated price (e.g., 11250) or fallback price
  "breakdown": string,    // Explanation from the AI or fallback message
  "currency": "INR"
}
```
*Note: If the AI fails, the endpoint will return a price calculated using a fallback rate (`150 INR/km`) and the `breakdown` will indicate this.*

**Error Responses:**

*   **Status 400 Bad Request:** If the request body is missing required fields or has invalid data types. The response body will contain details about the validation errors.
    ```json
    {
      "error": "Invalid request body",
      "details": [ ... validation errors ... ]
    }
    ```
*   **Status 500 Internal Server Error:** If there's an issue on the server side (e.g., AI model error, failure to fetch necessary data, invalid API key). The response body might contain more details.
    ```json
    {
      "error": "Price estimation failed", // Or "Internal Server Error"
      "details": "...", // Specific error message from the server/flow
      "currency": "INR",
      "estimatedPrice": 0
    }
    ```

**Example Flutter Usage (using `http` package):**

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>?> getPriceEstimate({
  required double pickupLat,
  required double pickupLng,
  required double destLat,
  required double destLng,
  required double weightKg,
}) async {
  // Replace with your actual deployed Next.js app URL
  final url = Uri.parse('YOUR_NEXTJS_APP_URL/api/calculate-price');

  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'pickupLatitude': pickupLat,
        'pickupLongitude': pickupLng,
        'destinationLatitude': destLat,
        'destinationLongitude': destLng,
        'loadWeightKg': weightKg,
      }),
    );

    print('API Response Status: ${response.statusCode}');
    print('API Response Body: ${response.body}');

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else {
      // Handle errors (4xx, 5xx)
      print('Error getting price estimate: ${response.statusCode}');
      try {
         // Try to parse error details if available
         final errorBody = jsonDecode(response.body) as Map<String, dynamic>;
         print('Error details: ${errorBody['details'] ?? errorBody['error'] ?? 'Unknown error'}');
      } catch (e) {
         print('Could not parse error response body.');
      }
      return null; // Indicate failure
    }
  } catch (e) {
    print('Network or other error calling API: $e');
    return null; // Indicate failure
  }
}

// --- How to call it ---
// final result = await getPriceEstimate(
//   pickupLat: 28.6139,
//   pickupLng: 77.2090,
//   destLat: 19.0760,
//   destLng: 72.8777,
//   weightKg: 1500,
// );
//
// if (result != null) {
//   print('Estimated Price: ${result['estimatedPrice']} ${result['currency']}');
//   print('Breakdown: ${result['breakdown']}');
// } else {
//   print('Failed to get price estimate.');
// }

```

**Remember to replace `YOUR_NEXTJS_APP_URL` with the actual URL where your Next.js application is deployed.**
