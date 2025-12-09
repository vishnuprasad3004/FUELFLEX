

'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/firebase/firebase-config';
import { createUserProfile, getUserProfile, type UserProfile } from '@/services/user-service'; 
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/models/user'; 

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTransportOwner: boolean;
  isBuyerSeller: boolean;
  // This function will be used by the dev role switcher
  setMockUserRole?: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- DEVELOPMENT BYPASS CONTROL ---
// SET TO true TO BYPASS AUTH AND MOCK A USER.
// SET TO false FOR NORMAL AUTHENTICATION.
// WARNING: THIS MUST be 'false' for production deployment.
const DEVELOPMENT_BYPASS_AUTH = true; 
const INITIAL_MOCK_ROLE: UserRole = UserRole.BUYER_SELLER; // Initial role on load
// --- END DEVELOPMENT BYPASS CONTROL ---


export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // Add state for the mock role to allow dynamic switching
  const [mockRole, setMockRole] = useState<UserRole>(INITIAL_MOCK_ROLE);

  const setupMockUser = useCallback((role: UserRole) => {
     console.warn(
        `%cAUTH BYPASS ACTIVE: Mocking user with role: ${role}`,
        "color: orange; font-weight: bold; font-size: 14px;"
      );
      const mockFirebaseUser: FirebaseUser = {
        uid: 'mock-user-uid-67890',
        email: `${role}@example.com`,
        displayName: `${role.charAt(0).toUpperCase() + role.slice(1).replace('_', '/')} User (Bypass)`,
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
        toJSON: () => ({ uid: 'mock-user-uid-67890', email: `${role}@example.com` }),
      } as FirebaseUser; 

      const mockUserProfileData: UserProfile = {
        uid: 'mock-user-uid-67890',
        email: `${role}@example.com`,
        displayName: `${role.charAt(0).toUpperCase() + role.slice(1).replace('_', '/')} User (Bypass)`,
        role: role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setCurrentUser(mockFirebaseUser);
      setUserProfile(mockUserProfileData);
      setLoading(false);
  }, []);

  useEffect(() => {
    if (DEVELOPMENT_BYPASS_AUTH) {
      setupMockUser(mockRole);
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
                    await createUserProfile(user.uid, user.email, UserRole.ADMIN, { displayName: "Admin" });
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
  }, [mockRole, setupMockUser]); 

  const isAdmin = userProfile?.role === UserRole.ADMIN;
  const isTransportOwner = userProfile?.role === UserRole.TRANSPORT_OWNER;
  const isBuyerSeller = userProfile?.role === UserRole.BUYER_SELLER;

  if (loading) { // Display loader regardless of bypass when initially loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading application...</p>
      </div>
    );
  }
  
  // Conditionally provide the setMockUserRole function
  const contextValue: AuthContextType = DEVELOPMENT_BYPASS_AUTH
    ? { currentUser, userProfile, loading, isAdmin, isTransportOwner, isBuyerSeller, setMockUserRole: setMockRole }
    : { currentUser, userProfile, loading, isAdmin, isTransportOwner, isBuyerSeller };

  return (
    <AuthContext.Provider value={contextValue}>
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
