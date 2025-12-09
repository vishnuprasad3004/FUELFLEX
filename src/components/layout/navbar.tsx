
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebase-config';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, LogOut, LayoutDashboard, ShoppingCart, TruckIcon, UserCog, HomeIcon, Users, Settings } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from '@/models/user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// This is a development-only component. It will not be rendered in production.
const DevRoleSwitcher = () => {
  const { setMockUserRole, userProfile } = useAuth();
  
  if (process.env.NODE_ENV !== 'development' || !setMockUserRole) {
    return null;
  }

  const handleRoleChange = (role: UserRole) => {
    setMockUserRole(role);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="destructive" size="sm" className="h-8">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Role: {userProfile?.role.replace('_', '/')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Switch Mock Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleRoleChange(UserRole.BUYER_SELLER)}>Client / Buyer</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange(UserRole.TRANSPORT_OWNER)}>Transport Owner</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange(UserRole.ADMIN)}>Admin</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export default function Navbar() {
  const { currentUser, userProfile, isAdmin, isTransportOwner, isBuyerSeller } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Force a hard reload to the login page to ensure all state is cleared.
      window.location.href = '/login';
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign-out Failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary">
          <span>FuelFlex</span>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <DevRoleSwitcher />
          {currentUser ? (
            <>
              {isBuyerSeller && (
                 <Link href="/marketplace" legacyBehavior passHref>
                  <Button variant="ghost" className="hidden sm:flex">
                    <ShoppingCart className="mr-2 h-5 w-5" /> Marketplace
                  </Button>
                </Link>
              )}
              {isTransportOwner && (
                <Link href="/transport-owner/dashboard" legacyBehavior passHref>
                  <Button variant="ghost" className="hidden sm:flex">
                     <TruckIcon className="mr-2 h-5 w-5" /> Owner Dashboard
                  </Button>
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin/dashboard" legacyBehavior passHref>
                  <Button variant="ghost" className="hidden sm:flex">
                    <UserCog className="mr-2 h-5 w-5" /> Admin Dashboard
                  </Button>
                </Link>
              )}
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="mr-1 h-4 w-4 sm:mr-2" /> 
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
              {userProfile?.displayName && <span className="text-sm text-muted-foreground hidden lg:inline">Hi, {userProfile.displayName}</span>}
            </>
          ) : (
            <>
              <Link href="/login" legacyBehavior passHref>
                <Button variant="ghost">
                  <LogIn className="mr-2 h-5 w-5" /> Login
                </Button>
              </Link>
              <Link href="/create-account" legacyBehavior passHref>
                <Button>
                  <UserPlus className="mr-2 h-5 w-5" /> Create Account
                </Button>
              </Link>
            </>
          )}
           <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
