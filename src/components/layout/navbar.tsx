
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebase-config';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, LogOut, LayoutDashboard, ShoppingCart, TruckIcon, UserCog, HomeIcon } from 'lucide-react';
// import Image from 'next/image'; // Logo removed

export default function Navbar() {
  const { currentUser, userProfile, isAdmin, isTransportOwner, isBuyerSeller } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login'); // Redirect to login page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally, show an error toast to the user
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary">
          {/* Logo removed from here */}
          {/* <Image src="/logo.png" alt="FuelFlex Logo" width={40} height={40} data-ai-hint="logo transport" /> */}
          <span>FuelFlex</span>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link href="/" legacyBehavior passHref>
            <Button variant="ghost" className="text-sm sm:text-base">
              <HomeIcon className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> Home
            </Button>
          </Link>
          {currentUser ? (
            <>
              {isBuyerSeller && (
                <Link href="/marketplace" legacyBehavior passHref>
                  <Button variant="ghost" className="text-sm sm:text-base">
                    <ShoppingCart className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> Marketplace
                  </Button>
                </Link>
              )}
              {isTransportOwner && (
                <Link href="/transport-owner/dashboard" legacyBehavior passHref>
                  <Button variant="ghost" className="text-sm sm:text-base">
                     <TruckIcon className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> Owner Dashboard
                  </Button>
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin/dashboard" legacyBehavior passHref>
                  <Button variant="ghost" className="text-sm sm:text-base">
                    <UserCog className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> Admin Dashboard
                  </Button>
                </Link>
              )}
              <Button onClick={handleSignOut} variant="outline" className="text-sm sm:text-base">
                <LogOut className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> Sign Out
              </Button>
              {userProfile?.displayName && <span className="text-sm text-muted-foreground hidden sm:inline">Hi, {userProfile.displayName}</span>}
            </>
          ) : (
            <>
              <Link href="/login" legacyBehavior passHref>
                <Button variant="ghost" className="text-sm sm:text-base">
                  <LogIn className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> Login
                </Button>
              </Link>
              <Link href="/create-account" legacyBehavior passHref>
                <Button className="text-sm sm:text-base">
                  <UserPlus className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> Create Account
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
