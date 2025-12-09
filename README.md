# FuelFlex Transport Platform - Flutter Edition

This project is a smart goods transport and fuel credit platform. The frontend is built with Flutter, and the backend services, including AI-powered features, are provided by a Next.js application using Genkit and Firebase.

## Core Backend Features (Next.js & Genkit)

*   **AI-Powered Pricing API:** A REST API endpoint (`/api/calculate-price`) that dynamically estimates transport costs using Genkit and Google's Generative AI models. It considers factors like distance (via Google Distance Matrix API), load weight, vehicle type, and mock real-time fuel prices.
*   **Firebase Integration:**
    *   **Authentication:** Manages user signup and login.
    *   **Firestore:** Stores user profiles, goods listings, and booking information.
    *   **Cloud Storage:** Used for storing files like PDF invoices (planned) or user-uploaded images.
*   **Service Layer:** Includes modules for fetching mock fuel prices and calculating distances using the Google Distance Matrix API.

## Flutter Frontend Features (Conceptual)

The Flutter application will provide the user interface for:

*   **User Authentication:** Login and sign-up screens interacting with Firebase Authentication.
*   **Goods Marketplace:**
    *   Browsing goods listed by sellers.
    *   Allowing sellers to list their goods for sale.
*   **Transport Booking:**
    *   A form for users to input pickup/destination details, goods description, preferred pickup time, etc.
    *   Interaction with the `/api/calculate-price` backend endpoint to get price estimates.
    *   Submitting booking requests to be stored in Firestore.
*   **Owner Dashboard:** (For transport owners) Viewing a summary of their vehicle fleet, including mock location, fuel levels, and FASTag balances.
*   **Admin Dashboard:** (For platform administrators) Monitoring trips, repayments, user management, and overall platform activity.
*   **Payment Gateway Integration (Placeholder):** UI elements for future integration with UPI and/or Stripe for booking fees and fuel credit repayments.
*   **Live Vehicle Tracking (Placeholder):** UI elements for future integration of live vehicle tracking.
*   **PDF Invoices (Planned):** Functionality to request/view PDF invoices.
*   **Push Notifications (Planned):** Handling real-time updates.
*   **Multilingual Support (Planned).**

## Technology Stack

*   **Frontend:** Flutter
*   **Backend/AI:** Next.js (as an API layer), Genkit, Google Generative AI (Gemini models)
*   **Services (used by Backend):** Google Distance Matrix API
*   **Database/Auth/Storage:** Firebase (Firestore, Authentication, Cloud Storage, Cloud Functions, FCM)
*   **Deployment:**
    *   Flutter App: App Store, Google Play Store
    *   Next.js Backend: Vercel, Firebase Hosting, or other Node.js hosting.

## Getting Started (Backend - Next.js/Genkit)

Follow the instructions below to set up and run the Next.js backend. For Flutter development, refer to standard Flutter setup and project creation guides.

### Prerequisites (Backend)

*   Node.js (v18 or later recommended)
*   npm or yarn
*   A Firebase project (with Firestore, Authentication, and Cloud Storage enabled)

### Environment Variables (Backend)

Create a `.env` file in the Next.js project root (i.e., the root of this repository) and add the following variables. **Replace `YOUR_..._HERE` with your actual keys and project details.**

**VERY IMPORTANT: API Key Errors (e.g., `auth/api-key-not-valid`)**

If you encounter errors like `auth/api-key-not-valid`, `GOOGLE_GENAI_API_KEY` issues, or `Google Maps API key` problems, it's almost certainly an issue with your `.env` file or the API key configuration in your Google/Firebase project.

**Troubleshooting Steps for API Key Errors:**

1.  **`.env` File Location:** Ensure the file is named exactly `.env` (not `.env.local` or `.env.development` unless you specifically intend that for Next.js environment stages) and is located in the **root directory** of your Next.js project.
2.  **Variable Names:** Double-check that the variable names in your `.env` file exactly match the ones listed below (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).
3.  **API Key Values:**
    *   Copy-paste carefully. Ensure there are no extra spaces or characters.
    *   The API key itself is a long string of characters.
    *   Verify you are using the **Web API Key** for Firebase.
4.  **Correct Firebase Project:**
    *   Go to your [Firebase Console](https://console.firebase.google.com/).
    *   Select your project.
    *   Go to **Project settings** (click the gear icon).
    *   Under the **General** tab, scroll down to **Your apps**.
    *   If you have a Web app, click on it. If not, add one (Platform: Web).
    *   Under **SDK setup and configuration**, select **Config**. You will find `apiKey`, `authDomain`, `projectId`, etc. These are the values you need for your `.env` file.
    *   Ensure these values in your `.env` file match **exactly** what is shown in the Firebase console for your intended project. The `apiKey` from this section is what you should use for `NEXT_PUBLIC_FIREBASE_API_KEY`.
5.  **Enabled APIs/Services:**
    *   **Firebase:** Ensure Firebase Authentication (with Email/Password sign-in method enabled), Firestore, and Cloud Storage are enabled in your Firebase project.
    *   **Google AI (Genkit):** Ensure the Generative Language API (or Vertex AI, depending on your chosen model) is enabled in Google Cloud Console for the project linked to your `GOOGLE_GENAI_API_KEY`.
    *   **Google Maps:** Ensure "Distance Matrix API" is enabled in Google Cloud Console for the project linked to your `GOOGLE_MAPS_API_KEY`.
6.  **API Key Restrictions (Google Cloud):**
    *   If you have set API key restrictions in Google Cloud Console (e.g., HTTP referrers, API restrictions), ensure they are configured correctly for your development environment (e.g., allowing `localhost`). For initial testing, you might temporarily remove restrictions to isolate the problem.
7.  **Billing Account:** Some Google Cloud services require a billing account to be linked to the project, even if they fall within a free tier.
8.  **Apply Changes by Restarting Servers:**
    *   After creating or correcting your `.env` file and its API keys, you **MUST** restart your development servers:
        *   Next.js development server: `npm run dev` (or `yarn dev`)
        *   Genkit development server (if running separately): `npm run genkit:watch` (or `yarn genkit:watch`)

```env
# Get your Google GenAI API key from Google AI Studio: https://aistudio.google.com/app/apikey
# Or from Google Cloud: https://console.cloud.google.com/apis/credentials
# Ensure the Generative Language API (or Vertex AI, depending on model) is enabled for the associated project.
GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_GENAI_API_KEY_HERE

# Get your Google Maps API Key from Google Cloud Console: https://console.cloud.google.com/google/maps-apis/credentials
# Ensure "Distance Matrix API" is enabled for this key for the associated project.
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE

# Firebase configuration
# Get these from your Firebase project settings:
# Project settings (gear icon) > General tab > Scroll to "Your apps" > Select your Web app
# Then, under "SDK setup and configuration", choose the 'Config' option.
# CRITICAL: Ensure NEXT_PUBLIC_FIREBASE_API_KEY is the 'apiKey' value from this 'Config' section.
# This is the most common cause of 'auth/api-key-not-valid' errors.
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN_HERE
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID_HERE
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET_HERE
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID_HERE
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID_HERE
# NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID_HERE # Optional, for Analytics
```

### Installation (Backend)

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd <repository-name> # This is your Next.js project directory
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Backend Development Servers

1.  **Ensure your `.env` file is correctly set up with valid API keys.**
2.  **Start the Genkit development server (for AI flows):**
    Open a terminal in the Next.js project root and run:
    ```bash
    npm run genkit:watch
    # or
    yarn genkit:watch
    ```
    This will typically start on `http://localhost:3400`.

3.  **Start the Next.js development server (for API endpoints):**
    Open another terminal in the Next.js project root and run:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This will typically start the Next.js app on `http://localhost:9002`.

Your Flutter application will then make HTTP requests to `http://localhost:9002/api/...` endpoints.

## AI-Powered Pricing API (for Flutter Integration)

The Next.js backend exposes an AI-powered pricing feature via a REST API endpoint. Your Flutter app will call this endpoint to get transport price estimates.

**Endpoint:** `/api/calculate-price` (e.g., `http://localhost:9002/api/calculate-price`)

**Method:** `POST`

**Request Body (JSON):**

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

**Success Response (Status 200 OK - JSON):**

```json
{
  "estimatedPrice": number, // The calculated price (e.g., 11250) or fallback price
  "breakdown": string,    // Explanation from the AI or fallback message
  "currency": "INR",
  "distanceKm": number,   // Calculated distance in kilometers
  "travelTimeHours": number // Calculated travel time in hours
}
```
*Note: If the AI or Distance Matrix API fails, the endpoint may return a price calculated using a fallback rate and the `breakdown` will indicate this.*

**Error Responses:**

*   **Status 400 Bad Request:** If the request body is missing required fields or has invalid data types.
    ```json
    {
      "error": "Invalid request body",
      "details": { /* Zod validation error details */ }
    }
    ```
*   **Status 500 Internal Server Error:** If there's an issue on the server side, including failure from Genkit flow due to API key issues or other AI errors.
    ```json
    {
      "error": "Price estimation failed",
      "details": "...", // Specific error message from the flow
      "currency": "INR",
      "estimatedPrice": 0
    }
    ```

**Example Flutter `http` Package Usage:**

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>?> getPriceEstimateFromApi({
  required double pickupLat,
  required double pickupLng,
  required double destLat,
  required double destLng,
  required double weightKg,
  required String vehicleType,
}) async {
  // For local Next.js dev server: 'http://localhost:9002/api/calculate-price'
  // For Android emulator accessing local dev server: 'http://10.0.2.2:9002/api/calculate-price'
  // For iOS simulator accessing local dev server: 'http://localhost:9002/api/calculate-price' (usually works directly)
  // Replace with your deployed Next.js app URL in production.
  final url = Uri.parse('http://10.0.2.2:9002/api/calculate-price'); // Example for Android Emulator

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
        'vehicleType': vehicleType,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else {
      print('Error getting price estimate: ${response.statusCode}');
      print('Response body: ${response.body}');
      // You might want to parse the error response body for more details
      return null;
    }
  } catch (e) {
    print('Network or other error calling API: $e');
    return null;
  }
}

// --- How to call it in Flutter ---
// void main() async {
//   final result = await getPriceEstimateFromApi(
//     pickupLat: 28.6139, // Delhi
//     pickupLng: 77.2090,
//     destLat: 19.0760,   // Mumbai
//     destLng: 72.8777,
//     weightKg: 1500,
//     vehicleType: "Mini Truck (Tata Ace, Mahindra Jeeto, etc.)",
//   );
//
//   if (result != null) {
//     print('Estimated Price: ${result['estimatedPrice']} ${result['currency']}');
//     print('Breakdown: ${result['breakdown']}');
//   } else {
//     print('Failed to get price estimate.');
//   }
// }
```
Remember to handle API URLs correctly depending on whether you're running on an emulator, a physical device, or in production.
Ensure the `vehicleType` string passed from Flutter matches one of the expected types defined in `src/models/booking.ts` in the Next.js backend.

## Project Outline & Key Pages

This Next.js application serves as the backend and admin interface for the FuelFlex platform.

**Key User-Facing Pages (Conceptual - To be built or enhanced):**

*   **`/` (Home Page):** Landing page with an overview of FuelFlex services, featured goods categories, and calls to action for booking transport or listing goods.
*   **`/marketplace`:** Main marketplace page where users (Buyer/Sellers) can browse listed goods. Includes filtering (by category, price range, location) and search functionality.
    *   **`/marketplace/goods/[id]`:** Detail page for a specific good, showing product information, seller details, pickup location, and an option to "Book Transport" for this item.
    *   **`/marketplace/list-good`:** A form for Buyer/Sellers to list their goods for sale on the marketplace. Involves inputting product details, price, quantity, location, and uploading images (via Firebase Storage).
    *   **`/marketplace/book-transport`:** A form for users to book transport. Can be accessed directly or pre-filled if booking from a specific good's detail page. Users input pickup/drop-off locations (with geocoding for addresses to lat/lng), goods description, weight, preferred vehicle type, and preferred pickup date. This page interacts with the `/api/calculate-price` endpoint to show an estimated cost before confirming the booking.
*   **`/login`:** User login page.
*   **`/create-account`:** User registration page, allowing users to select their role (Buyer/Seller, Transport Owner).
*   **`/transport-owner/dashboard`:** Dashboard for users with the 'transport_owner' role. Displays a (mock) overview of their vehicle fleet, including vehicle name, type, registration, current location (mock), fuel level (mock percentage with progress bar), and FASTag balance (mock INR).
*   **`/admin/dashboard`:** Dashboard for platform administrators. Provides tools to:
    *   Monitor trips: View bookings with details like trip ID, goods type, vehicle, estimated cost, status (pending, in_transit, completed), repayment status, and booking date. Includes filtering by trip ID, driver ID, booking status, and repayment status. Pagination and sorting are implemented.
    *   Manage users: View a list of users with their UID, email, display name, role, and join date. Includes filtering by email and role. Pagination and sorting are implemented.
    *   File Management (Mock Demo): Demonstrates basic file upload, URL retrieval, and listing of items, simulating interaction with a storage service (currently mocked, but would use Firebase Storage).
*   **`/contact`:** Contact Us page with a form and contact details.
*   **`/faq`:** Frequently Asked Questions page.
*   **`/privacy`:** Privacy Policy page.
*   **`/terms`:** Terms of Service page.

**Firebase Collections Outline:**

*   **`users`**:
    *   Document ID: `uid` (Firebase Auth user ID)
    *   Fields: `email`, `phone?`, `role` (`buyer_seller` | `transport_owner` | `admin`), `displayName?`, `photoURL?`, `createdAt`, `updatedAt`.
*   **`goods`**:
    *   Document ID: `productId` (auto-generated)
    *   Fields: `sellerId` (UID), `productName`, `category`, `price`, `quantity`, `description`, `location` (object: `address`, `latitude`, `longitude`), `contact`, `images?` (array of URLs), `weightKg?`, `postedAt`, `updatedAt`, `isActive`.
*   **`bookings`**:
    *   Document ID: `bookingId` (auto-generated)
    *   Fields: `buyerId` (UID), `goodsId?` (ref to `goods` doc), `sellerId?` (UID, denormalized from `goods`), `pickupLocation` (object: `address`, `latitude`, `longitude` - from `goods` or manual), `dropoffLocation` (object: `address`, `latitude`, `longitude`), `goodsType`, `weightKg`, `vehicleType`, `preferredPickupDate?`, `status`, `driverId?`, `estimatedTransportCost?`, `finalTransportCost?`, `fuelCreditRequested?`, `fuelCost?`, `repayAmount?`, `repayDueDate?`, `repayStatus`, `createdAt`, `updatedAt`, `actionLogs` (array of objects), `specialInstructions?`.

This outline should provide a good starting point for recreating the Firebase structure and understanding the application's flow. Remember to set up Firestore security rules to control access to these collections based on user roles.
