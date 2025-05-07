'use client';

import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Truck, Fuel, MapPin, AlertCircle, IndianRupee, ListChecks } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Vehicle {
  id: string;
  name: string;
  type: string;
  location: string; // Could be city name or live coordinates in a real app
  fuelLevel: number; // Percentage
  fastagBalance: number; // In INR
  status: 'idle' | 'in_transit' | 'maintenance';
  imageUrl: string;
  dataAiHint: string;
}

// Mock data for demonstration
const mockVehicles: Vehicle[] = [
  { id: 'V001', name: 'Tata Ace Gold', type: 'Mini Truck', location: 'Mumbai, MH', fuelLevel: 75, fastagBalance: 1250, status: 'idle', imageUrl: 'https://picsum.photos/seed/tataace/300/200', dataAiHint: 'mini truck' },
  { id: 'V002', name: 'Ashok Leyland Dost', type: 'LCV', location: 'En route to Pune', fuelLevel: 40, fastagBalance: 800, status: 'in_transit', imageUrl: 'https://picsum.photos/seed/leylanddost/300/200', dataAiHint: 'light truck' },
  { id: 'V003', name: 'Mahindra Bolero Pickup', type: 'Pickup Truck', location: 'Delhi NCR', fuelLevel: 90, fastagBalance: 2500, status: 'idle', imageUrl: 'https://picsum.photos/seed/boleropickup/300/200', dataAiHint: 'pickup truck' },
  { id: 'V004', name: 'Eicher Pro 2049', type: 'Medium Duty Truck', location: 'Maintenance Yard', fuelLevel: 20, fastagBalance: 300, status: 'maintenance', imageUrl: 'https://picsum.photos/seed/eicherpro/300/200', dataAiHint: 'medium truck' },
];


export default function TransportOwnerDashboardPage() {
  useAuthRedirect({ requireAuth: true, requireRole: 'transport_owner' });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVehicles(mockVehicles);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading vehicle data...</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Transport Owner Dashboard</CardTitle>
          <CardDescription>Manage your fleet, view real-time status, and track finances.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Truck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">Active in your fleet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles In Transit</CardTitle>
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'in_transit').length}</div>
            <p className="text-xs text-muted-foreground">Currently on trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {vehicles.filter(v => v.fuelLevel < 25 || v.status === 'maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground">Low fuel or maintenance required</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />


      <h2 className="text-2xl font-semibold mb-6 mt-8">My Vehicle Fleet</h2>
      {vehicles.length === 0 && !loading && (
        <Card className="text-center py-8">
          <CardContent>
            <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You haven't added any vehicles yet.</p>
            <Button className="mt-4">Add New Vehicle</Button>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative h-48 w-full">
                <Image 
                    src={vehicle.imageUrl} 
                    alt={vehicle.name} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={vehicle.dataAiHint}
                />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">{vehicle.name} <span className="text-sm font-normal text-muted-foreground">({vehicle.type})</span></CardTitle>
              <CardDescription>ID: {vehicle.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-muted-foreground"><MapPin className="h-4 w-4 mr-2" /> Location:</span>
                <span className="font-semibold">{vehicle.location}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground"><Fuel className="h-4 w-4 mr-2" /> Fuel Level:</span>
                  <span className={`font-semibold ${vehicle.fuelLevel < 25 ? 'text-destructive' : 'text-green-600'}`}>{vehicle.fuelLevel}%</span>
                </div>
                <Progress value={vehicle.fuelLevel} className={`h-2 ${vehicle.fuelLevel < 25 ? '[&>div]:bg-destructive' : ''}`} />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-muted-foreground"><IndianRupee className="h-4 w-4 mr-2" /> FASTag Balance:</span>
                <span className="font-semibold">₹{vehicle.fastagBalance.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                 <span className="flex items-center text-muted-foreground"><ListChecks className="h-4 w-4 mr-2" /> Status:</span>
                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                    ${vehicle.status === 'idle' ? 'bg-blue-100 text-blue-700' : 
                      vehicle.status === 'in_transit' ? 'bg-green-100 text-green-700' : 
                      'bg-orange-100 text-orange-700'}`}>
                  {vehicle.status.replace('_', ' ')}
                 </span>
              </div>
              <div className="pt-2 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                <Button size="sm" className="flex-1">Manage</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Added Separator for consistent UI
import { Separator } from "@/components/ui/separator";
