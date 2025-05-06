"use client"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Filter, Loader2, Search, ShieldCheck, UserCog, DollarSign, Map, UploadCloud, Package, Calendar, Users, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Separator } from "@/components/ui/separator"; 
import { StorageDemoWidget } from "@/components/admin/storage-demo-widget"; 
import type { Booking } from "@/models/booking";
import { BookingStatus, RepaymentStatus, VEHICLE_TYPES } from "@/models/booking"; 
import { format } from 'date-fns';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase-config';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getUserProfile } from '@/services/user-service';
import { UserRole, type UserProfile } from '@/models/user';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const mockBookings: Booking[] = [
  {
    bookingId: "B001",
    buyerId: "C001", 
    goodsId: "G123",
    sellerId: "S001",
    dropoffLocation: { address: "Client Site, Mumbai", latitude: 19.0760, longitude: 72.8777 },
    vehicleType: VEHICLE_TYPES[1], 
    preferredPickupDate: new Date("2024-08-15T10:00:00Z"),
    status: BookingStatus.IN_TRANSIT,
    driverId: "D001",
    driverName: "Ramesh Kumar", 
    estimatedTransportCost: 12500,
    fuelCreditRequested: true, 
    fuelCost: 4500,
    repayAmount: 4750, 
    repayDueDate: new Date("2024-09-01T10:00:00Z"),
    repayStatus: RepaymentStatus.PENDING,
    createdAt: new Date("2024-07-28T09:00:00Z"),
    updatedAt: new Date("2024-07-29T14:00:00Z"),
    actionLogs: [
      { timestamp: new Date("2024-07-28T09:00:00Z"), actorId: "C001", actionDescription: "Booking created" },
      { timestamp: new Date("2024-07-28T11:00:00Z"), actorId: "Admin01", actionDescription: "Booking confirmed, assigned to D001" },
      { timestamp: new Date("2024-07-29T14:00:00Z"), actorId: "D001", actionDescription: "Status changed to in_transit" },
    ],
  },
  {
    bookingId: "B002",
    buyerId: "C002",
    goodsId: "G456",
    sellerId: "S002",
    dropoffLocation: { address: "Retail Outlet, Bengaluru", latitude: 12.9716, longitude: 77.5946 },
    vehicleType: VEHICLE_TYPES[0], 
    preferredPickupDate: new Date("2024-08-10T14:00:00Z"),
    status: BookingStatus.DELIVERED,
    driverId: "D002",
    driverName: "Suresh Patil",
    estimatedTransportCost: 8000,
    finalTransportCost: 7800,
    repayStatus: RepaymentStatus.NOT_APPLICABLE,
    createdAt: new Date("2024-07-25T10:00:00Z"),
    updatedAt: new Date("2024-07-27T16:00:00Z"),
    actionLogs: [
      { timestamp: new Date("2024-07-25T10:00:00Z"), actorId: "C002", actionDescription: "Booking created" },
      { timestamp: new Date("2024-07-27T16:00:00Z"), actorId: "D002", actionDescription: "Status changed to delivered" },
    ],
  },
    {
    bookingId: "B003",
    buyerId: "C003",
    goodsId: "G789",
    sellerId: "S003",
    dropoffLocation: { address: "Distribution Center, Patna", latitude: 25.5941, longitude: 85.1376 },
    vehicleType: VEHICLE_TYPES[2], 
    preferredPickupDate: null, 
    status: BookingStatus.PAYMENT_DUE,
    driverId: "D003",
    driverName: "Anil Singh",
    estimatedTransportCost: 9500,
    finalTransportCost: 9500,
    fuelCreditRequested: true,
    fuelCost: 3000,
    repayAmount: 3150,
    repayDueDate: new Date("2024-08-20T10:00:00Z"),
    repayStatus: RepaymentStatus.OVERDUE,
    createdAt: new Date("2024-08-01T12:00:00Z"),
    updatedAt: new Date("2024-08-05T18:00:00Z"),
    actionLogs: [{ timestamp: new Date(), actorId: "System", actionDescription: "Marked as payment_due" }],
  },
];

const getStatusBadgeVariant = (status: BookingStatus | RepaymentStatus) => {
  switch (status) {
    case BookingStatus.COMPLETED:
    case BookingStatus.DELIVERED:
    case RepaymentStatus.PAID:
      return "default"; 
    case BookingStatus.IN_TRANSIT:
    case BookingStatus.AWAITING_PICKUP: 
    case RepaymentStatus.PENDING:
      return "secondary"; 
    case BookingStatus.CANCELLED_BY_ADMIN: 
    case BookingStatus.CANCELLED_BY_BUYER:
    case BookingStatus.CANCELLED_BY_SELLER:
    case BookingStatus.FAILED:
    case BookingStatus.ON_HOLD: 
    case RepaymentStatus.OVERDUE:
      return "destructive"; 
    case BookingStatus.PENDING:
    case BookingStatus.CONFIRMED:
    case BookingStatus.PAYMENT_DUE:
    case RepaymentStatus.PARTIALLY_PAID:
      return "outline"; 
    default:
      return "outline";
  }
};


export default function AdminDashboardPage() {
  const [currentUser, authLoading, authError] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return; // Wait until auth state is resolved

    if (!currentUser) {
      router.push('/login?message=Admin%20access%20required');
      return;
    }

    getUserProfile(currentUser.uid)
      .then(profile => {
        if (profile && profile.role === UserRole.ADMIN) {
          setUserProfile(profile);
        } else {
          setUserProfile(null); // Explicitly set to null if not admin or no profile
          router.push('/?message=Unauthorized%20access'); // Redirect if not admin
        }
      })
      .catch(error => {
        console.error("Error fetching admin profile:", error);
        router.push('/login?message=Error%20verifying%20admin%20status');
      })
      .finally(() => {
        setProfileLoading(false);
      });
  }, [currentUser, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto py-20 px-4 text-center flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Verifying admin access...</p>
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

  if (!userProfile || userProfile.role !== UserRole.ADMIN) {
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
      <Card className="w-full max-w-7xl mx-auto shadow-lg border border-border rounded-lg">
        <CardHeader className="text-center border-b pb-4 mb-6">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-3xl font-bold text-primary">Admin Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage and monitor platform bookings, users, and operations. Welcome, {userProfile.displayName || userProfile.email}!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <h2 className="text-2xl font-semibold text-primary flex items-center"><Package className="mr-2 h-6 w-6"/> Booking Management</h2>
              <div className="flex items-center gap-2">
                <Input placeholder="Search by Booking ID, Buyer, Driver..." className="max-w-xs" />
                <Button variant="outline"><Filter className="mr-1 h-4 w-4" /> Filter</Button>
              </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Buyer ID</TableHead>
                    <TableHead>Goods ID</TableHead>
                    <TableHead>Vehicle/Pickup</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right"><DollarSign className="inline-block mr-1 h-4 w-4"/>Cost (INR)</TableHead>
                    <TableHead>Repayment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBookings.map((booking) => (
                    <TableRow key={booking.bookingId}>
                      <TableCell className="font-medium">{booking.bookingId}</TableCell>
                      <TableCell>{booking.buyerId}</TableCell>
                      <TableCell className="text-xs">
                         <div>{booking.goodsId}</div>
                         <div className="text-muted-foreground">Seller: {booking.sellerId}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div><span className="font-semibold">Vehicle:</span> {booking.vehicleType || 'N/A'}</div>
                        <div className="text-muted-foreground">
                            Pickup: {booking.preferredPickupDate ? format(new Date(booking.preferredPickupDate), "PPp") : 'ASAP'}
                        </div>
                         <div className="text-muted-foreground">Drop: {booking.dropoffLocation.address}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize text-xs">
                          {booking.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {booking.finalTransportCost?.toLocaleString('en-IN') || booking.estimatedTransportCost?.toLocaleString('en-IN') || 'N/A'}
                        {booking.finalTransportCost && booking.estimatedTransportCost && booking.finalTransportCost !== booking.estimatedTransportCost && (
                          <div className="text-xs text-muted-foreground line-through">{booking.estimatedTransportCost.toLocaleString('en-IN')}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {booking.fuelCreditRequested ? (
                          <>
                            <div>Amt: <span className="font-mono">{booking.repayAmount?.toLocaleString('en-IN') || 'N/A'}</span></div>
                            <Badge variant={getStatusBadgeVariant(booking.repayStatus)} className="capitalize mt-1 text-xs">
                              {booking.repayStatus.replace(/_/g, ' ')}
                            </Badge>
                            {booking.repayDueDate && <div className="text-muted-foreground mt-0.5">Due: {format(new Date(booking.repayDueDate), "PP")}</div>}
                          </>
                        ) : (
                          <Badge variant="outline" className="text-xs">No Credit</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /> View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             <div className="mt-4 p-4 border border-dashed border-border rounded-lg text-center bg-muted/50">
                <Image
                src="https://picsum.photos/seed/adminmapbookings/600/200"
                alt="Placeholder Admin Map View of Bookings"
                width={600}
                height={200}
                className="mx-auto mb-2 rounded opacity-60"
                data-ai-hint="bookings map overview"
                />
                <p className="text-muted-foreground text-sm">Live booking overview map (coming soon)</p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center"><Users className="mr-2 h-6 w-6"/> User Management</h2>
            <div className="p-6 border border-dashed border-border rounded-lg text-center bg-muted/50">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3"/>
                <p className="text-muted-foreground">
                    User listing (clients, drivers, admins) and role assignments will be available here.
                    (Requires fetching from 'users' collection in Firestore).
                </p>
                <Button variant="secondary" className="mt-4" disabled>Manage Users (Coming Soon)</Button>
            </div>
          </section>

          <Separator />

          <section>
            <StorageDemoWidget />
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
