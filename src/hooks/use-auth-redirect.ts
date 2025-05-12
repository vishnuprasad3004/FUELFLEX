
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { UserRole } from '@/models/user'; // Added import for UserRole


// --- DEVELOPMENT BYPASS CONTROL ---
// This should ideally be consistent with the one in AuthProvider.
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
    if (loading) {
      return; 
    }

    // Redirect if authenticated (e.g., from login/register page to a dashboard)
    if (options.redirectIfAuthenticated && currentUser) {
      // With bypass, this ensures that if we are on login/create-account while "mock-logged-in", we still redirect.
      if (DEVELOPMENT_BYPASS_AUTH_REDIRECT) {
        // The role-based redirection logic below will handle it for bypassed users.
      }
      
      if (isAdmin) router.push('/admin/dashboard');
      else if (isTransportOwner) router.push('/transport-owner/dashboard');
      else if (isBuyerSeller) router.push('/marketplace');
      else router.push(options.redirectIfAuthenticated); 
      return;
    }

    // If bypass is active, skip further auth/role checks for pages that *require* auth or specific roles,
    // as the mock user is already set up.
    if (DEVELOPMENT_BYPASS_AUTH_REDIRECT && (options.requireAuth || options.requireRole)) {
        // console.warn("useAuthRedirect: Auth checks (requireAuth, requireRole) potentially bypassed due to DEVELOPMENT_BYPASS_AUTH_REDIRECT.");
        return; 
    }


    // Redirect if authentication is required and user is not logged in
    if (options.requireAuth && !currentUser) {
      router.push(options.redirectTo || '/login');
      return;
    }

    // Redirect if a specific role is required and user does not have it
    if (currentUser && options.requireRole) {
      let hasRequiredRole = false;
      if (options.requireRole === UserRole.ADMIN && isAdmin) hasRequiredRole = true;
      if (options.requireRole === UserRole.TRANSPORT_OWNER && isTransportOwner) hasRequiredRole = true;
      if (options.requireRole === UserRole.BUYER_SELLER && isBuyerSeller) hasRequiredRole = true;
      
      if (!hasRequiredRole) {
        console.warn(`useAuthRedirect: User does not have required role: ${options.requireRole}. Current role: ${userProfile?.role}. Redirecting to home.`);
        router.push('/'); 
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userProfile, loading, router, options, isAdmin, isTransportOwner, isBuyerSeller]);

  return { currentUser, userProfile, loading };
}

