"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Corrected import
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase-config';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, LayoutDashboard, ShieldCheck, LogOut, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/services/user-service';
import { UserRole, type UserProfile } from '@/models/user';
import { useToast } from '@/hooks/use-toast';

export function AuthenticatedNavLinks() {
  const [user, loading, error] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !loading) {
      setProfileLoading(true);
      getUserProfile(user.uid)
        .then(profile => {
          setUserProfile(profile);
        })
        .catch(profileError => {
          console.error("Error fetching user profile:", profileError);
          // Optionally, show a toast or handle the error
        })
        .finally(() => {
          setProfileLoading(false);
        });
    } else if (!user && !loading) {
      setUserProfile(null); // Clear profile if user logs out
    }
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/'); // Redirect to home page after logout
    } catch (logoutError) {
      console.error("Logout error:", logoutError);
      toast({ title: "Logout Failed", description: "Could not log you out. Please try again.", variant: "destructive" });
    }
  };

  if (loading || profileLoading) {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }

  if (error) {
    // Handle auth error (e.g., display a message or a generic login button)
    console.error("Firebase auth error in nav:", error);
    return (
      <Link href="/login" passHref>
        <Button variant="ghost" className="text-sm font-medium">
          <LogIn className="mr-1 h-4 w-4" /> Login (Error)
        </Button>
      </Link>
    );
  }

  if (!user) {
    return (
      <>
        <Link href="/login" passHref>
          <Button variant="ghost" className="text-sm font-medium">
            <LogIn className="mr-1 h-4 w-4" /> Login
          </Button>
        </Link>
        <Link href="/signup" passHref>
          <Button variant="ghost" className="text-sm font-medium">
            <UserPlus className="mr-1 h-4 w-4" /> Sign Up
          </Button>
        </Link>
      </>
    );
  }

  // User is authenticated
  return (
    <>
      {userProfile?.role === UserRole.ADMIN && (
        <Link href="/admin/dashboard" passHref>
          <Button variant="ghost" className="text-sm font-medium">
            <ShieldCheck className="mr-1 h-4 w-4" /> Admin
          </Button>
        </Link>
      )}
      {userProfile?.role === UserRole.TRANSPORT_OWNER && (
        <Link href="/owner/dashboard" passHref>
          <Button variant="ghost" className="text-sm font-medium">
            <LayoutDashboard className="mr-1 h-4 w-4" /> Owner
          </Button>
        </Link>
      )}
      {/* Buyer/Seller might not have a dedicated dashboard link in the main nav, 
          or they might have a "My Account" or similar. For now, it's implicit. 
          If they have a specific dashboard, it can be added here.
      */}
      <Button variant="ghost" className="text-sm font-medium" onClick={handleLogout}>
        <LogOut className="mr-1 h-4 w-4" /> Logout
      </Button>
    </>
  );
}
