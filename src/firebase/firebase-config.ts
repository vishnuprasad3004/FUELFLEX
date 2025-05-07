// src/firebase/firebase-config.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// Explicitly check if any of the core Firebase config values are missing.
if (
  !firebaseApiKey ||
  !firebaseAuthDomain ||
  !firebaseProjectId ||
  !firebaseStorageBucket ||
  !firebaseMessagingSenderId ||
  !firebaseAppId
) {
  let missingKeysMessage = "The following Firebase environment variables are missing or undefined in your .env file:\n";
  if (!firebaseApiKey) missingKeysMessage += " - NEXT_PUBLIC_FIREBASE_API_KEY\n";
  if (!firebaseAuthDomain) missingKeysMessage += " - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\n";
  if (!firebaseProjectId) missingKeysMessage += " - NEXT_PUBLIC_FIREBASE_PROJECT_ID\n";
  if (!firebaseStorageBucket) missingKeysMessage += " - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET\n";
  if (!firebaseMessagingSenderId) missingKeysMessage += " - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID\n";
  if (!firebaseAppId) missingKeysMessage += " - NEXT_PUBLIC_FIREBASE_APP_ID\n";

  console.error(`
    ****************************************************************************************
    * ERROR: Firebase Configuration Incomplete!                                            *
    *                                                                                      *
    ${missingKeysMessage}
    * Firebase services (Authentication, Firestore, Storage) will likely fail or           *
    * throw 'auth/api-key-not-valid' errors until all required variables are correctly set.*
    *                                                                                      *
    * Please create or update your .env file in the project root with ALL the Firebase     *
    * configuration variables obtained from your Firebase project settings:                *
    * Project settings > General > Your apps > Web app > SDK setup and configuration (Config). *
    *                                                                                      *
    * Ensure the .env file is in the project root and that you RESTART your development    *
    * server after adding/updating the .env file.                                          *
    * See README.md for detailed setup instructions.                                       *
    ****************************************************************************************
  `);
} else {
    console.log("All Firebase environment variables appear to be present. Attempting initialization...");
}


const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  try {
    // Only attempt to initialize if the critical API key and Project ID seem to be present.
    // Firebase SDK will perform its own more detailed validation.
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      firestore = getFirestore(app);
      storage = getStorage(app);
      console.log("Firebase initialized successfully.");
    } else {
      // This case should ideally be caught by the more detailed check above.
      console.error("Firebase initialization skipped due to missing critical configuration (API Key or Project ID found to be undefined during config object creation). This should have been caught by the earlier check.");
      // @ts-ignore
      app = undefined;
      // @ts-ignore
      auth = undefined;
      // @ts-ignore
      firestore = undefined;
      // @ts-ignore
      storage = undefined;
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Fallback to undefined if initialization fails, so the app doesn't crash,
    // but features relying on Firebase will not work.
    // @ts-ignore
    app = undefined;
    // @ts-ignore
    auth = undefined;
    // @ts-ignore
    firestore = undefined;
    // @ts-ignore
    storage = undefined;
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  console.log("Firebase app already initialized.");
}

export { app, auth, firestore, storage };

