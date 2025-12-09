

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { UserRole } from '@/models/user'; 

// --- DEVELOPMENT BYPASS CONTROL ---
// This must be consistent with the one in AuthProvider.
// It MUST be false for production.
const DEVELOPMENT_BYPASS_AUTH_REDIRECT = true; 
// --- END DEVELOPMENT BYPASS CONTROL ---


interface UseAuthRedirectOptions {
  redirectTo?: string; 
  requireAuth?: boolean; 
  requireRole?: UserRole; 
  redirectIfAuthenticated?: string; 
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { currentUser, userProfile, loading, isAdmin, isTransportOwner, isBuyerSeller } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is complete before executing any redirect logic.
    if (loading) {
      return; 
    }

    // In development bypass mode, we just redirect to the correct dashboard based on the mocked role.
    if (DEVELOPMENT_BYPASS_AUTH_REDIRECT && currentUser) {
      const currentPath = window.location.pathname;
      if (isAdmin && !currentPath.startsWith('/admin')) {
          router.push('/admin/dashboard');
      } else if (isTransportOwner && !currentPath.startsWith('/transport-owner')) {
          router.push('/transport-owner/dashboard');
      } else if (isBuyerSeller && !(currentPath.startsWith('/marketplace') || currentPath === '/')) {
         // Allow root and marketplace for buyer/seller
         router.push('/marketplace');
      }
      return;
    }
    
    // --- LOGIC FOR REAL AUTHENTICATION (Bypass is false) ---

    // Redirect authenticated users away from public pages like login/register.
    if (options.redirectIfAuthenticated && currentUser) {
      if (isAdmin) router.push('/admin/dashboard');
      else if (isTransportOwner) router.push('/transport-owner/dashboard');
      else if (isBuyerSeller) router.push('/marketplace');
      else router.push(options.redirectIfAuthenticated); 
      return;
    }

    // For pages that require authentication, redirect unauthenticated users to the login page.
    if (options.requireAuth && !currentUser) {
      router.push(options.redirectTo || '/login');
      return;
    }

    // For pages that require a specific role, verify the logged-in user's role.
    if (currentUser && options.requireRole) {
      let hasRequiredRole = false;
      if (options.requireRole === UserRole.ADMIN && isAdmin) hasRequiredRole = true;
      if (options.requireRole === UserRole.TRANSPORT_OWNER && isTransportOwner) hasRequiredRole = true;
      if (options.requireRole === UserRole.BUYER_SELLER && isBuyerSeller) hasRequiredRole = true;
      
      // If the user does not have the required role, redirect them to a safe default page (e.g., home).
      if (!hasRequiredRole) {
        console.warn(`useAuthRedirect: User does not have required role: ${options.requireRole}. Current role: ${userProfile?.role}. Redirecting to home.`);
        router.push('/'); 
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userProfile, loading, router]);

  return { currentUser, userProfile, loading };
}
