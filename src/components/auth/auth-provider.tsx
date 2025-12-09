

'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/firebase/firebase-config';
import { getUserProfile, type UserProfile } from '@/services/user-service'; 
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/models/user'; 

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTransportOwner: boolean;
  isBuyerSeller: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- DEVELOPMENT BYPASS CONTROL ---
// SET TO true TO BYPASS AUTH AND MOCK A USER.
// SET TO false FOR NORMAL AUTHENTICATION.
// WARNING: THIS IS FOR DEVELOPMENT ONLY. ENSURE IT'S false FOR PRODUCTION.
const DEVELOPMENT_BYPASS_AUTH = true; 
const MOCK_USER_ROLE_FOR_BYPASS: UserRole = UserRole.ADMIN; // Change to test other roles (UserRole.BUYER_SELLER, UserRole.TRANSPORT_OWNER)
// --- END DEVELOPMENT BYPASS CONTROL ---


export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEVELOPMENT_BYPASS_AUTH) {
      console.warn(
        `%cAUTH BYPASS ACTIVE: Mocking user with role: ${MOCK_USER_ROLE_FOR_BYPASS}`,
        "color: orange; font-weight: bold; font-size: 14px;"
      );
      console.warn(
        `%cEnsure Firebase API keys in .env are correct for actual Firebase functionality. This bypass is for UI navigation only.`,
        "color: orange; font-size: 12px;"
      );
      
      const mockFirebaseUser: FirebaseUser = {
        uid: 'mock-admin-uid-12345',
        email: 'njvishnun@gmail.com',
        displayName: 'Admin User (Vishnu)',
        emailVerified: true,
        isAnonymous: false,
        metadata: {} as any, 
        providerData: [],
        providerId: 'password', 
        photoURL: null,
        phoneNumber: null,
        tenantId: null,
        delete: async () => { console.log("Mock delete called"); },
        getIdToken: async () => "mock-id-token",
        getIdTokenResult: async () => ({ token: "mock-id-token", claims: {}, authTime: "", expirationTime: "", issuedAtTime: "", signInProvider: null, signInSecondFactor: null } as any),
        reload: async () => { console.log("Mock reload called"); },
        toJSON: () => ({ uid: 'mock-admin-uid-12345', email: 'njvishnun@gmail.com' }),
      } as FirebaseUser; 

      const mockUserProfileData: UserProfile = {
        uid: 'mock-admin-uid-12345',
        email: 'njvishnun@gmail.com',
        displayName: 'Admin User (Vishnu)',
        role: MOCK_USER_ROLE_FOR_BYPASS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setCurrentUser(mockFirebaseUser);
      setUserProfile(mockUserProfileData);
      setLoading(false);
      return () => {}; // No-op for unsubscribe in bypass mode
    }

    // Regular Firebase auth state listener
    if (!auth) {
      console.error("AuthProvider: Firebase 'auth' instance is not available. Authentication will not work. Check .env configuration.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Special override for the admin user
        if (user.email === 'njvishnun@gmail.com') {
            try {
                // Ensure profile exists and has admin role
                let profile = await getUserProfile(user.uid);
                if (!profile || profile.role !== UserRole.ADMIN) {
                    await createUserProfile(user.uid, user.email, UserRole.ADMIN, { displayName: 'Admin' });
                    profile = await getUserProfile(user.uid); // re-fetch
                }
                setUserProfile(profile);
            } catch (error) {
                console.error("Error setting up admin user profile:", error);
                setUserProfile(null);
            }
        } else {
            try {
              const profile = await getUserProfile(user.uid);
              setUserProfile(profile);
            } catch (error) {
              console.error("Error fetching user profile:", error);
              setUserProfile(null); 
            }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); 

  const isAdmin = userProfile?.role === UserRole.ADMIN;
  const isTransportOwner = userProfile?.role === UserRole.TRANSPORT_OWNER;
  const isBuyerSeller = userProfile?.role === UserRole.BUYER_SELLER;

  if (loading && !DEVELOPMENT_BYPASS_AUTH) { 
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading application...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, isAdmin, isTransportOwner, isBuyerSeller }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
