// This MUST be the very first line
'use client';

import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Truck, Fuel, MapPin, AlertCircle, IndianRupee, ListChecks, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";


interface Vehicle {
  id: string;
  name: string;
  type: string;
  registrationNumber: string;
  location: string; // Could be city name or live coordinates in a real app
  fuelLevel: number; // Percentage
  fastagBalance: number; // In INR
  status: 'idle' | 'in_transit' | 'maintenance' | 'offline';
  imageUrl: string;
  dataAiHint: string;
  lastUpdated: string;
}

// Mock data for demonstration
const mockVehicles: Vehicle[] = [
  { id: 'V001', name: 'Tata Ace Gold', type: 'Mini Truck', registrationNumber: 'MH12AB1234', location: 'Mumbai, MH', fuelLevel: 75, fastagBalance: 1250, status: 'idle', imageUrl: 'https://picsum.photos/seed/tataacegold/400/250', dataAiHint: 'mini truck city', lastUpdated: '2 mins ago' },
  { id: 'V002', name: 'Ashok Leyland Dost+', type: 'LCV', registrationNumber: 'KA01CD5678', location: 'En route to Pune', fuelLevel: 40, fastagBalance: 800, status: 'in_transit', imageUrl: 'https://picsum.photos/seed/leylanddostplus/400/250', dataAiHint: 'light truck highway', lastUpdated: 'Now' },
  { id: 'V003', name: 'Mahindra Bolero Maxx', type: 'Pickup Truck', registrationNumber: 'DL03EF9012', location: 'Delhi NCR', fuelLevel: 90, fastagBalance: 2500, status: 'idle', imageUrl: 'https://picsum.photos/seed/boleromaxx/400/250', dataAiHint: 'pickup truck urban', lastUpdated: '10 mins ago' },
  { id: 'V004', name: 'Eicher Pro 2049', type: 'Medium Duty Truck', registrationNumber: 'TN04GH3456', location: 'Maintenance Yard, Chennai', fuelLevel: 20, fastagBalance: 300, status: 'maintenance', imageUrl: 'https://picsum.photos/seed/eicherpro2049/400/250', dataAiHint: 'medium truck garage', lastUpdated: '1 hour ago' },
  { id: 'V005', name: 'BharatBenz 1617R', type: 'Heavy Duty Truck', registrationNumber: 'GJ05IJ7890', location: 'Ahmedabad Depot', fuelLevel: 60, fastagBalance: 5000, status: 'idle', imageUrl: 'https://picsum.photos/seed/bharatbenz1617r/400/250', dataAiHint: 'heavy truck depot', lastUpdated: '5 mins ago' },
  { id: 'V006', name: 'Maruti Suzuki Super Carry', type: 'Mini Truck', registrationNumber: 'WB06KL1234', location: 'Kolkata City Limits', fuelLevel: 15, fastagBalance: 150, status: 'offline', imageUrl: 'https://picsum.photos/seed/supercarry/400/250', dataAiHint: 'small truck street', lastUpdated: '3 hours ago' },
];


export default function TransportOwnerDashboardPage() {
  useAuthRedirect({ requireAuth: true, requireRole: 'transport_owner' });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVehicleData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Introduce some randomness to mock data updates
      const updatedVehicles = mockVehicles.map(v => ({
        ...v,
        fuelLevel: Math.max(10, Math.min(100, v.fuelLevel + Math.floor(Math.random() * 20) - 10)), // Fluctuate fuel
        fastagBalance: Math.max(100, v.fastagBalance + Math.floor(Math.random() * 500) - 250), // Fluctuate balance
        status: v.status === 'offline' ? (Math.random() > 0.7 ? 'idle' : 'offline') : v.status, // Chance for offline to come online
        lastUpdated: `${Math.floor(Math.random()*59) +1} mins ago`
      }));
      setVehicles(updatedVehicles);
      setLoading(false);
      toast({
        title: "Vehicle Data Refreshed",
        description: "Latest mock vehicle statuses loaded.",
      });
    }, 1000);
  }

  useEffect(() => {
    fetchVehicleData();
  }, []);

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'idle': return 'bg-blue-100 text-blue-700';
      case 'in_transit': return 'bg-green-100 text-green-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      case 'offline': return 'bg-gray-100 text-gray-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  if (loading && vehicles.length === 0) { // Show initial loading state
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading your fleet data...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-8 shadow-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle className="text-3xl font-bold">Transport Owner Dashboard</CardTitle>
                <CardDescription className="text-primary-foreground/80">Manage your fleet, view real-time status, and track finances.</CardDescription>
            </div>
            <Button onClick={fetchVehicleData} variant="secondary" size="sm" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <RefreshCw className="h-4 w-4 mr-2"/>}
                Refresh Data
            </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Truck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">Active in your fleet</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles In Transit</CardTitle>
            <MapPin className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'in_transit').length}</div>
            <p className="text-xs text-muted-foreground">Currently on trips</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {vehicles.filter(v => v.fuelLevel < 25 || v.status === 'maintenance' || v.status === 'offline').length}
            </div>
            <p className="text-xs text-muted-foreground">Low fuel, maintenance, or offline</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Vehicle Fleet</h2>
        <Button onClick={() => toast({title: "Feature Coming Soon", description: "Adding new vehicles will be available shortly."})}>
            <PlusCircle className="mr-2 h-5 w-5"/> Add New Vehicle
        </Button>
      </div>
      
      {loading && vehicles.length > 0 && ( // Show loading indicator on refresh without clearing existing data
         <div className="text-center py-6">
             <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
             <p className="text-muted-foreground mt-2">Refreshing vehicle data...</p>
         </div>
      )}

      {vehicles.length === 0 && !loading && (
        <Card className="text-center py-10 shadow-md">
          <CardContent className="flex flex-col items-center">
            <Truck className="h-20 w-20 text-muted-foreground mb-6" />
            <p className="text-xl text-muted-foreground mb-2">Your fleet is currently empty.</p>
            <p className="text-sm text-muted-foreground mb-6">Add your vehicles to start managing them here.</p>
            <Button onClick={() => toast({title: "Feature Coming Soon", description: "Adding new vehicles will be available shortly."})}>
                 <PlusCircle className="mr-2 h-5 w-5"/> Add Your First Vehicle
            </Button>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
            <div className="relative h-52 w-full">
                <Image 
                    src={vehicle.imageUrl} 
                    alt={vehicle.name} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={vehicle.dataAiHint}
                    className="transition-transform duration-300 group-hover:scale-105"
                />
                 <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status.replace('_', ' ')}
                 </div>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl truncate" title={vehicle.name}>{vehicle.name}</CardTitle>
              <CardDescription className="text-sm">{vehicle.type} - {vehicle.registrationNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-muted-foreground"><MapPin className="h-4 w-4 mr-2 text-sky-500" /> Location:</span>
                <span className="font-semibold truncate" title={vehicle.location}>{vehicle.location}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground"><Fuel className="h-4 w-4 mr-2 text-orange-500" /> Fuel Level:</span>
                  <span className={`font-semibold ${vehicle.fuelLevel < 25 ? 'text-destructive' : vehicle.fuelLevel < 50 ? 'text-yellow-500' : 'text-green-600'}`}>{vehicle.fuelLevel}%</span>
                </div>
                <Progress 
                    value={vehicle.fuelLevel} 
                    className={`h-2 ${vehicle.fuelLevel < 25 ? '[&>div]:bg-destructive' : vehicle.fuelLevel < 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} 
                    aria-label={`Fuel level ${vehicle.fuelLevel}%`}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-muted-foreground"><IndianRupee className="h-4 w-4 mr-2 text-emerald-600" /> FASTag Balance:</span>
                <span className={`font-semibold ${vehicle.fastagBalance < 500 ? 'text-destructive': 'text-emerald-700'}`}>₹{vehicle.fastagBalance.toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                Last updated: {vehicle.lastUpdated}
              </div>
            </CardContent>
             <CardFooter className="border-t pt-4">
                <Button variant="outline" size="sm" className="flex-1 mr-2" onClick={() => toast({title: "Vehicle Details", description:`Showing details for ${vehicle.name} (${vehicle.registrationNumber})`})}>View Details</Button>
                <Button size="sm" className="flex-1" onClick={() => toast({title: "Manage Vehicle", description:`Managing options for ${vehicle.name}`})}>Manage</Button>
              </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
// Added PlusCircle icon to imports
import { PlusCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
```