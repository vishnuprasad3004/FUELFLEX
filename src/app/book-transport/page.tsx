"use client"; 

import { BookingForm } from "@/components/booking-form";
import { Separator } from "@/components/ui/separator";
import { FileText, ShieldCheck, Truck, ShoppingCart, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation'; 
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase-config';
import { Button } from "@/components/ui/button";


export default function BookTransportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const goodsId = searchParams.get('goodsId');
  const [relatedGoodsInfo, setRelatedGoodsInfo] = useState<string | null>(null);
  
  const [currentUser, authLoading, authError] = useAuthState(auth);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser && !authError) {
      router.push('/login?message=Please%20login%20to%20book%20transport');
    }
  }, [currentUser, authLoading, authError, router]);

  useEffect(() => {
    if (goodsId) {
      setRelatedGoodsInfo(`You are booking transport for a specific item (ID: ${goodsId}). Details will be pre-filled or considered.`);
      console.log("Booking transport for goods ID:", goodsId);
    }
  }, [goodsId]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading booking information...</p>
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

  if (!currentUser) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
         <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                You need to be logged in to book transport.
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
            <Truck className="mx-auto h-12 w-12 text-primary mb-3" />
            <h1 className="text-3xl font-bold text-primary">
              {goodsId ? "Book Transport for Your Selected Item" : "Plan Your Shipment"}
            </h1>
            <p className="text-muted-foreground">
              {goodsId 
                ? "Confirm details below to arrange transport for the item you selected from our marketplace."
                : "Fill in the details below to get an instant AI-powered price estimate and request your transport booking across India."
              }
            </p>
        </div>

        {relatedGoodsInfo && (
          <Alert className="bg-accent/10 border-accent/30 text-accent-foreground">
            <ShoppingCart className="h-5 w-5 text-accent" />
            <AlertTitle className="text-accent">Marketplace Item Selected</AlertTitle>
            <AlertDescription>
              {relatedGoodsInfo} If this is not correct, please <Link href="/browse-goods" className="underline hover:text-primary">browse goods</Link> again.
            </AlertDescription>
          </Alert>
        )}
        
        <BookingForm goodsId={goodsId} /> 

        <Separator className="my-12" />

        <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-7 w-7 text-accent" />
                    <h3 className="text-xl font-semibold text-primary">Secure & Reliable</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                    We prioritize the safety of your goods. Our platform connects you with verified transport providers and offers features to ensure a secure transit. Track your shipment and get real-time updates.
                </p>
            </div>
             <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <FileText className="h-7 w-7 text-accent" />
                    <h3 className="text-xl font-semibold text-primary">Transparent Process</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                    Get detailed breakdowns of your transport costs. Our AI-powered estimation considers multiple factors for fair pricing. Access proforma invoices and manage your bookings with ease.
                </p>
            </div>
        </div>
      </div>
    </main>
  );
}
