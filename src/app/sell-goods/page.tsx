"use client";

import { SellGoodsForm } from "@/components/sell-goods-form";
import { Separator } from "@/components/ui/separator";
import { Coins, ListChecks, Loader2, PackagePlus, ShoppingCart, Store, AlertTriangle } from "lucide-react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase-config';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/models/user';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function SellGoodsPage() {
  const [currentUser, authLoading, authError] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      router.push('/login?message=Please%20login%20to%20sell%20goods');
      return;
    }

    getUserProfile(currentUser.uid)
      .then(profile => {
        setUserProfile(profile);
      })
      .catch(error => {
        console.error("Error fetching user profile for sell goods page:", error);
        // Optionally handle this error, e.g., redirect or show message
      })
      .finally(() => {
        setProfileLoading(false);
      });
  }, [currentUser, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading seller information...</p>
      </div>
    );
  }

  if (authError) {
     return (
        <div className="container mx-auto py-20 px-4 text-center">
            <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>
                    Could not verify your authentication status.
                    <Button onClick={() => router.push('/login')} className="mt-4 ml-2">Go to Login</Button>
                </AlertDescription>
            </Alert>
        </div>
     );
  }

  if (!currentUser || !userProfile) {
     return (
      <div className="container mx-auto py-20 px-4 text-center">
         <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                You need to be logged in and have a profile to sell goods.
                <Button onClick={() => router.push('/login')} className="mt-4 ml-2">Go to Login</Button>
            </AlertDescription>
        </Alert>
      </div>
    );
  }


  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-start p-4 md:p-8 bg-gradient-to-br from-background to-secondary/10">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center mb-8">
          <Store className="mx-auto h-12 w-12 text-primary mb-3" />
          <h1 className="text-3xl font-bold text-primary">List Your Goods</h1>
          <p className="text-muted-foreground">
            Fill in the details below to make your products available to buyers across India.
          </p>
        </div>
        
        <SellGoodsForm />

        <Separator className="my-12" />

        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="space-y-3 p-4 border border-border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <PackagePlus className="h-7 w-7 text-accent" />
              <h3 className="text-xl font-semibold text-primary">Easy Listing</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Quickly add your products with all necessary details like category, price, and location.
            </p>
          </div>
          <div className="space-y-3 p-4 border border-border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-7 w-7 text-accent" />
              <h3 className="text-xl font-semibold text-primary">Reach Buyers</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Your listed goods will be visible to a wide network of buyers looking for transport.
            </p>
          </div>
          <div className="space-y-3 p-4 border border-border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <Coins className="h-7 w-7 text-accent" />
              <h3 className="text-xl font-semibold text-primary">Transparent Process</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage your inventory and sales with clear tracking and communication tools.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
