'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';

interface UseAuthRedirectOptions {
  redirectTo?: string; // Where to redirect if conditions are met (e.g., user not authenticated)
  requireAuth?: boolean; // If true, redirect if user is not authenticated
  requireRole?: 'admin' | 'transport_owner' | 'buyer_seller'; // If set, redirect if user does not have this role
  redirectIfAuthenticated?: string; // Where to redirect if user IS authenticated (e.g., from login page to dashboard)
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { currentUser, userProfile, loading, isAdmin, isTransportOwner, isBuyerSeller } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Don't redirect while loading auth state
    }

    // Redirect if authenticated (e.g., from login/register page to dashboard)
    if (options.redirectIfAuthenticated && currentUser) {
      if (isAdmin) router.push('/admin/dashboard');
      else if (isTransportOwner) router.push('/transport-owner/dashboard');
      else if (isBuyerSeller) router.push('/marketplace');
      else router.push(options.redirectIfAuthenticated); // Fallback redirect
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
      if (options.requireRole === 'admin' && isAdmin) hasRequiredRole = true;
      if (options.requireRole === 'transport_owner' && isTransportOwner) hasRequiredRole = true;
      if (options.requireRole === 'buyer_seller' && isBuyerSeller) hasRequiredRole = true;
      
      if (!hasRequiredRole) {
        // Redirect to a generic "access denied" or home page if role doesn't match
        console.warn(`User does not have required role: ${options.requireRole}. Current role: ${userProfile?.role}`);
        // Redirect to home page if not authorized for a specific role page.
        // If redirectTo is specified, it might be a login page, which isn't appropriate here.
        router.push('/'); 
      }
    }
  }, [currentUser, userProfile, loading, router, options, isAdmin, isTransportOwner, isBuyerSeller]);

  return { currentUser, userProfile, loading };
}

```