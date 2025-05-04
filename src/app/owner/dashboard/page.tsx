
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { MapPin, Fuel, IndianRupee, Truck } from "lucide-react";
import Image from "next/image";

// Mock Data Structure - Replace with actual data fetching
interface Vehicle {
  id: string;
  name: string; // e.g., "Truck MH 12 AB 1234"
  location: {
    lat: number;
    lng: number;
    description: string; // e.g., "Near Pune, MH"
  };
  fuelLevelPercent: number; // 0-100
  fastagBalance: number; // In INR
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
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-background to-secondary/10 p-4 md:p-8">
      <Card className="w-full max-w-5xl mx-auto shadow-lg border border-border rounded-lg">
        <CardHeader className="text-center">
          <Truck className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-primary">Owner Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            Overview of your vehicle fleet status.
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
                         {/* Placeholder for map - using text description for now */}
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
          {/* Placeholder for Map View */}
          <div className="mt-8 p-4 border border-dashed border-border rounded-lg text-center bg-muted/50">
            <Image
              src="https://picsum.photos/seed/map/600/300" // Placeholder map image
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
    </main>
  );
}
