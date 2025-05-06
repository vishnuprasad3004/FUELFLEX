
import type { Timestamp } from 'firebase/firestore';

export enum UserRole {
  BUYER_SELLER = "buyer_seller",
  TRANSPORT_OWNER = "transport_owner",
  ADMIN = "admin",
}

export interface UserProfile {
  uid: string; // Firebase Auth User ID
  email: string | null;
  phone?: string | null;
  role: UserRole;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  // Additional fields as needed, e.g., address, companyName for transport_owner
}
