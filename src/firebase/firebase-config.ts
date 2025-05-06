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

if (!firebaseApiKey) {
  console.error(`
    ****************************************************************************************
    * ERROR: NEXT_PUBLIC_FIREBASE_API_KEY environment variable not set!                   *
    *                                                                                      *
    * Firebase services (Authentication, Firestore, Storage) will likely fail or           *
    * throw 'auth/api-key-not-valid' errors.                                               *
    *                                                                                      *
    * Please create or update your .env file in the project root with the following line:  *
    * NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE                              *
    *                                                                                      *
    * You also need to set other Firebase configuration variables:                         *
    * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN                                    *
    * NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID                                      *
    * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET                              *
    * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID                    *
    * NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID                                              *
    *                                                                                      *
    * Get these details from your Firebase project settings:                               *
    * Project settings > General > Your apps > Web app > SDK setup and configuration      *
    *                                                                                      *
    * Restart your development server after adding/updating the .env file.                 *
    * If the key is present but still getting 'auth/api-key-not-valid', ensure the key     *
    * itself is correct and for the right Firebase project.                                *
    ****************************************************************************************
  `);
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
    // Only attempt to initialize if the critical API key seems to be present.
    // Firebase SDK will perform its own more detailed validation.
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      firestore = getFirestore(app);
      storage = getStorage(app);
      console.log("Firebase initialized successfully.");
    } else {
      console.error("Firebase initialization skipped due to missing critical configuration (API Key or Project ID).");
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
