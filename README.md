# FuelFlex Transport Platform

This is a Next.js application for a smart goods transport and fuel credit platform, built with Firebase and Genkit.

To get started, take a look at `src/app/page.tsx`.

## Core Features

*   **AI-Powered Pricing:** Dynamically estimates transport costs using Genkit and Google's Generative AI models, considering factors like distance, load weight, and real-time fuel prices.
*   **Booking System:** Allows clients to book transport services by providing pickup/destination details, goods description, and preferred pickup time.
*   **Owner Dashboard:** Enables transport owners to view a summary of their vehicle fleet, including mock location, fuel levels, and FASTag balances.
*   **User Authentication Pages:** Basic login and sign-up page structures.

## Advanced Features (In Development / Planned)

*   **Smart Route & Distance Calculation:** Utilizes the **Google Distance Matrix API** for accurate road distances and estimated travel times, improving the reliability of price estimations. (Requires `GOOGLE_MAPS_API_KEY`)
*   **Live Vehicle Tracking (Placeholder):** The Owner Dashboard includes a placeholder for future integration of live vehicle tracking using Google Maps and real-time driver location updates.
*   **Admin Dashboard (Placeholder):** A dedicated dashboard for administrators (`/admin/dashboard`) to monitor trips, repayments, and overall platform activity (currently a placeholder).
*   **Payment Gateway Integration (Placeholder):** The booking form includes a placeholder to proceed to payment, with future plans to integrate UPI and/or Stripe for booking fees and fuel credit repayments.
*   **Automated Reminders (Planned):** Future integration of Firebase Cloud Functions for automated due-date reminders for fuel credit.
*   **PDF Invoices (Planned):** Future capability to generate and download PDF invoices, potentially stored in **Firebase Storage**.
*   **Push Notifications (Planned):** Firebase Cloud Messaging (FCM) will be used to send real-time updates to users about bookings, repayments, and trip status.
*   **Role-Based Access Control (Planned):** Implementation of RBAC to ensure clients, drivers, and admins can only access features relevant to their roles. This will involve enhancing Firestore security rules.
*   **Multilingual Support (Planned):** The platform aims to support multiple languages using Next.js internationalization libraries (e.g., `next-intl`) or similar solutions.

## Technology Stack

*   **Frontend:** Next.js (React Framework), TypeScript, Tailwind CSS, ShadCN UI Components
*   **Backend/AI:** Genkit, Google Generative AI (Gemini models)
*   **Services:** Google Distance Matrix API
*   **Database/Auth/Storage (Planned & Partially Integrated):** Firebase (Firestore, Authentication, **Cloud Storage**, Cloud Functions, FCM)
*   **Deployment (Typical):** Vercel, Firebase Hosting

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   A Firebase project (with Firestore, Authentication, and Cloud Storage enabled)

### Environment Variables

Create a `.env` file in the project root and add the following variables. **Replace `YOUR_..._HERE` with your actual keys and project details.**

**VERY IMPORTANT: API Key Errors (e.g., `auth/api-key-not-valid`)**

If you encounter errors like `auth/api-key-not-valid`, `GOOGLE_GENAI_API_KEY` issues, or `Google Maps API key` problems, it's almost certainly an issue with your `.env` file or the API key configuration in your Google/Firebase project.

**Troubleshooting Steps for API Key Errors:**

1.  **`.env` File Location:** Ensure the file is named exactly `.env` (not `.env.local` for these specific keys unless you intend for that behavior) and is located in the **root directory** of your project (the same level as `package.json`).
2.  **Variable Names:** Double-check that the variable names in your `.env` file exactly match the ones listed below (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`, `GOOGLE_GENAI_API_KEY`, `GOOGLE_MAPS_API_KEY`). Typos are common.
3.  **API Key Values:**
    *   **Copy-Paste Carefully:** Ensure you have copied the entire API key correctly from your Firebase project settings or Google Cloud Console.
    *   **No Extra Characters:** There should be no extra spaces, quotes (unless the key itself contains them, which is rare), or other characters around the key. For example:
        *   Correct: `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...`
        *   Incorrect: `NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyC..."` (unless the key itself has quotes)
        *   Incorrect: `NEXT_PUBLIC_FIREBASE_API_KEY= AIzaSyC...` (extra space)
4.  **Correct Firebase Project:**
    *   Verify that the Firebase project details (API Key, Auth Domain, Project ID, etc.) are from the **correct Firebase project** you intend to use.
    *   In your Firebase project settings (Project settings > General > Your apps > Web app > SDK setup and configuration), ensure your web app is registered and the configuration details match what you have in `.env`.
5.  **Enabled APIs/Services:**
    *   **Firebase:** Ensure Firebase Authentication, Firestore (in Native mode or Datastore mode as per your setup), and Cloud Storage are enabled in your Firebase project.
    *   **Google AI (Genkit):** Make sure the Generative Language API (or Vertex AI API if using that backend) is enabled in your Google Cloud project associated with the `GOOGLE_GENAI_API_KEY`.
    *   **Google Maps:** Ensure "Distance Matrix API" and "Maps JavaScript API" (if you plan to use map displays) are enabled for the `GOOGLE_MAPS_API_KEY` in the Google Cloud Console.
6.  **API Key Restrictions (Google Cloud):** If you've set up API key restrictions in Google Cloud Console, ensure they allow your development environment (e.g., `http://localhost:*` for HTTP referrers if testing locally) and the necessary APIs (Distance Matrix, Generative Language, etc.). For development, you might temporarily remove restrictions to isolate the problem.
7.  **Apply Changes by Restarting Servers:**
    *   Correcting an invalid API key involves manually editing your `.env` file. There isn't a single CLI command to *automatically fix* the key itself.
    *   After you have manually corrected the API key (or made any other changes) in your `.env` file, you **MUST** restart your development servers. This is crucial for the new environment variables to be loaded and for the changes to take effect.
    *   For this Next.js application, you need to:
        *   Restart your Next.js development server: `npm run dev` (or `yarn dev`)
        *   Restart your Genkit development server: `npm run genkit:watch` (or `yarn genkit:watch`)
    *   This process is similar to how other frameworks, like Flutter (which might use a command like `flutter clean && flutter pub get && flutter run`), require a rebuild or restart to apply configuration changes.

```env
# Get your Google GenAI API key from Google AI Studio: https://aistudio.google.com/app/apikey
# Or from Google Cloud: https://console.cloud.google.com/apis/credentials
# Ensure the Generative Language API (or Vertex AI, depending on model) is enabled.
GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_GENAI_API_KEY_HERE

# Get your Google Maps API Key from Google Cloud Console: https://console.cloud.google.com/google/maps-apis/credentials
# Ensure "Distance Matrix API" and "Maps JavaScript API" (for live tracking) are enabled for this key.
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE

# Firebase configuration
# Get these from your Firebase project settings:
# Project settings > General > Your apps > Web app > SDK setup and configuration
# CRITICAL: Ensure NEXT_PUBLIC_FIREBASE_API_KEY is correct and valid for your project.
# This is the most common cause of 'auth/api-key-not-valid' errors.
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
# NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID # Optional, for Analytics
```

**Replace `YOUR_..._HERE` with your actual API keys and Firebase project details.** If you're still facing issues after checking all the above, double-check the Firebase console for any project-level alerts or misconfigurations.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

1.  **Ensure your `.env` file is correctly set up with valid API keys.**
2.  **Start the Genkit development server (for AI flows):**
    Open a terminal and run:
    ```bash
    npm run genkit:watch
    # or
    yarn genkit:watch
    ```
    This will typically start on `http://localhost:3400`. Check its console output for any Genkit-specific API key errors.

3.  **Start the Next.js development server:**
    Open another terminal and run:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This will typically start the Next.js app on `http://localhost:9002` (as per `package.json`). Check its console output for Firebase or other API key errors.

Navigate to `http://localhost:9002` in your browser.

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
  "loadWeightKg": number,       // e.g., 1500
  "vehicleType": string         // e.g., "Mini Truck (Tata Ace, Mahindra Jeeto, etc.)"
}
```

**Success Response (Status 200 OK):**

Returns a JSON object with the estimated price and breakdown:

```json
{
  "estimatedPrice": number, // The calculated price (e.g., 11250) or fallback price
  "breakdown": string,    // Explanation from the AI or fallback message
  "currency": "INR",
  "distanceKm": number,   // Calculated distance in kilometers
  "travelTimeHours": number // Calculated travel time in hours
}
```
*Note: If the AI or Distance Matrix API fails, the endpoint may return a price calculated using a fallback rate (e.g., `150 INR/km` adjusted for vehicle type) and the `breakdown` will indicate this.*

**Error Responses:**

*   **Status 400 Bad Request:** If the request body is missing required fields or has invalid data types.
    ```json
    {
      "error": "Invalid request body",
      "details": [ ... validation errors ... ]
    }
    ```
*   **Status 500 Internal Server Error:** If there's an issue on the server side (e.g., AI model error, failure to fetch necessary data, invalid API key).
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
  required String vehicleType, // Add vehicleType
}) async {
  // Replace with your actual deployed Next.js app URL or http://localhost:9002 for local dev
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
        'vehicleType': vehicleType, // Include vehicleType
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
//   vehicleType: "Mini Truck (Tata Ace, Mahindra Jeeto, etc.)", // Provide a valid vehicle type
// );
//
// if (result != null) {
//   print('Estimated Price: ${result['estimatedPrice']} ${result['currency']}');
//   print('Breakdown: ${result['breakdown']}');
//   print('Distance: ${result['distanceKm']} km');
//   print('Travel Time: ${result['travelTimeHours']} hours');
// } else {
//   print('Failed to get price estimate.');
// }

```

**Remember to replace `YOUR_NEXTJS_APP_URL` with the actual URL where your Next.js application is deployed (or `http://localhost:9002` if testing locally against your dev server).**
Also, ensure the `vehicleType` string passed matches one of the expected types defined in `src/models/booking.ts`.

```

