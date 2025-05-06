"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { MapPin, Fuel, IndianRupee, Truck, Loader2, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase-config';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getUserProfile } from '@/services/user-service';
import { UserRole, type UserProfile } from '@/models/user';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Vehicle {
  id: string;
  name: string; 
  location: {
    lat: number;
    lng: number;
    description: string; 
  };
  fuelLevelPercent: number; 
  fastagBalance: number; 
}

const mockVehicles: Vehicle[] = [
  {
    id: "V001",
    name: "Truck MH 14 AZ 5678",
    location: { lat: 18.5204, lng: 73.8567, description: "Pune Ring Road" },
    fuelLevelPercent: 75,
    fastagBalance: 2500.50,
  },
  {
    id: "V002",
    name: "Lorry TN 07 CQ 9012",
    location: { lat: 13.0827, lng: 80.2707, description: "Chennai Bypass" },
    fuelLevelPercent: 40,
    fastagBalance: 850.00,
  },
  {
    id: "V003",
    name: "Tanker DL 1 Z C 3456",
    location: { lat: 28.7041, lng: 77.1025, description: "Delhi-Gurgaon Exp" },
    fuelLevelPercent: 90,
    fastagBalance: 5120.75,
  },
    {
    id: "V004",
    name: "Truck KA 01 MN 7890",
    location: { lat: 12.9716, lng: 77.5946, description: "Outer Ring Rd, Blr" },
    fuelLevelPercent: 20,
    fastagBalance: 300.25,
  },
];

export default function OwnerDashboardPage() {
  const [currentUser, authLoading, authError] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      router.push('/login?message=Transport%20owner%20access%20required');
      return;
    }

    getUserProfile(currentUser.uid)
      .then(profile => {
        if (profile && profile.role === UserRole.TRANSPORT_OWNER) {
          setUserProfile(profile);
        } else {
          setUserProfile(null);
          router.push('/?message=Unauthorized%20access');
        }
      })
      .catch(error => {
        console.error("Error fetching owner profile:", error);
        router.push('/login?message=Error%20verifying%20owner%20status');
      })
      .finally(() => {
        setProfileLoading(false);
      });
  }, [currentUser, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto py-20 px-4 text-center flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Verifying transport owner access...</p>
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
                    Could not verify your authentication status. Please try logging in again.
                    <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
                </AlertDescription>
            </Alert>
        </div>
     );
  }

  if (!userProfile || userProfile.role !== UserRole.TRANSPORT_OWNER) {
     return (
      <div className="container mx-auto py-20 px-4 text-center">
        <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                You do not have permission to view this page.
                 <Button onClick={() => router.push('/')} className="mt-4">Go to Home</Button>
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-5xl mx-auto shadow-lg border border-border rounded-lg">
        <CardHeader className="text-center">
          <Truck className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-primary">Owner Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            Overview of your vehicle fleet status. Welcome, {userProfile.displayName || userProfile.email}!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Vehicle</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[150px]">Fuel Level</TableHead>
                  <TableHead className="w-[180px] text-right">FASTag Balance (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-secondary flex-shrink-0" />
                         <span>{vehicle.location.description} ({vehicle.location.lat.toFixed(4)}, {vehicle.location.lng.toFixed(4)})</span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-secondary flex-shrink-0" />
                        <Progress value={vehicle.fuelLevelPercent} className="w-24 h-2" aria-label={`${vehicle.fuelLevelPercent}% fuel`} />
                        <span className="text-sm text-muted-foreground">{vehicle.fuelLevelPercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                             <IndianRupee className="h-4 w-4 text-muted-foreground" />
                             <span className="font-mono">{vehicle.fastagBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-8 p-4 border border-dashed border-border rounded-lg text-center bg-muted/50">
            <Image
              src="https://picsum.photos/seed/map/600/300" 
              alt="Placeholder Map"
              width={600}
              height={300}
              className="mx-auto mb-2 rounded opacity-50"
              data-ai-hint="India map truck locations"
            />
            <p className="text-muted-foreground text-sm">Fleet map view (coming soon)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
