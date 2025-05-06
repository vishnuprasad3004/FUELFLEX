
// src/services/user-service.ts
'use server'; // Can be used in Server Actions or API routes if needed, also client-side

import { firestore } from '@/firebase/firebase-config';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { UserProfile, UserRole } from '@/models/user';

/**
 * Creates a user profile document in Firestore.
 * @param uid - The Firebase Authentication user ID.
 * @param email - The user's email.
 * @param role - The user's role.
 * @param additionalData - Optional additional data to store in the profile.
 * @returns A promise that resolves when the profile is created.
 */
export async function createUserProfile(
  uid: string,
  email: string,
  role: UserRole,
  additionalData: Partial<UserProfile> = {}
): Promise<void> {
  if (!uid || !email || !role) {
    throw new Error('User ID, email, and role are required to create a user profile.');
  }

  const userDocRef = doc(firestore, 'users', uid);

  const userData: UserProfile = {
    uid,
    email,
    role,
    createdAt: serverTimestamp() as Timestamp, // Use serverTimestamp for consistency
    updatedAt: serverTimestamp() as Timestamp,
    ...additionalData,
  };

  try {
    await setDoc(userDocRef, userData);
    console.log(`User profile created for UID: ${uid} with role: ${role}`);
  } catch (error) {
    console.error('Error creating user profile in Firestore:', error);
    throw new Error(`Failed to create user profile: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves a user profile document from Firestore.
 * @param uid - The Firebase Authentication user ID.
 * @returns A promise that resolves with the UserProfile object if found, otherwise null.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) {
    throw new Error('User ID is required to get a user profile.');
  }

  const userDocRef = doc(firestore, 'users', uid);

  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      // Convert Timestamps to Dates if necessary, or handle them as Timestamps
      const data = docSnap.data() as UserProfile;
      // Firestore Timestamps need to be handled. For client-side, often converted to Date objects.
      // For this example, we'll assume they might be used directly or converted by the component.
      return data;
    } else {
      console.log(`No user profile found for UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : String(error)}`);
  }
}
