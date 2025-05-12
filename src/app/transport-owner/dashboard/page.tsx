
// This MUST be the very first line
'use client';

import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Truck, Fuel, MapPin, AlertCircle, IndianRupee, ListChecks, RefreshCw, PlusCircle, Loader2, UploadCloud, FileText } from 'lucide-react'; // Removed ImageIcon as next/image is used
import { useEffect, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { uploadFile as uploadFileToStorage } from '@/services/storage-service'; 

interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
  location: string; 
  fuelLevel: number; 
  fastagBalance: number; 
  status: 'idle' | 'in_transit' | 'maintenance' | 'offline';
  imageUrl: string;
  rcBookUrl?: string; 
  dataAiHint: string;
  lastUpdated: string;
}

const initialMockVehicles: Vehicle[] = [
  { id: 'V001', name: 'Tata Ace Gold', registrationNumber: 'MH12AB1234', location: 'Mumbai, MH', fuelLevel: 75, fastagBalance: 1250, status: 'idle', imageUrl: 'https://picsum.photos/seed/tataacegold/400/250', rcBookUrl: 'https://picsum.photos/seed/rcV001/200/300', dataAiHint: 'mini truck city', lastUpdated: '2 mins ago' },
  { id: 'V002', name: 'Ashok Leyland Dost+', registrationNumber: 'KA01CD5678', location: 'En route to Pune', fuelLevel: 40, fastagBalance: 800, status: 'in_transit', imageUrl: 'https://picsum.photos/seed/leylanddostplus/400/250', dataAiHint: 'light truck highway', lastUpdated: 'Now' },
  { id: 'V003', name: 'Mahindra Bolero Maxx', registrationNumber: 'DL03EF9012', location: 'Delhi NCR', fuelLevel: 90, fastagBalance: 2500, status: 'idle', imageUrl: 'https://picsum.photos/seed/boleromaxx/400/250', rcBookUrl: 'https://picsum.photos/seed/rcV003/200/300', dataAiHint: 'pickup truck urban', lastUpdated: '10 mins ago' },
];

const vehicleRegistrationSchema = z.object({
  name: z.string().min(3, "Vehicle name must be at least 3 characters"),
  registrationNumber: z.string().min(6, "Registration number is required (e.g., MH01AB1234)")
    .regex(/^[A-Z]{2}[0-9]{1,2}(?:[A-Z])?(?:[A-Z]*)?[0-9]{4}$/, "Invalid registration number format. E.g., MH01AB1234, DL1C1234, KA05N9876"),
});
type VehicleRegistrationFormInputs = z.infer<typeof vehicleRegistrationSchema>;


export default function TransportOwnerDashboardPage() {
  useAuthRedirect({ requireAuth: true, requireRole: 'transport_owner' });
  
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialMockVehicles);
  const [loading, setLoading] = useState(false); 
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [vehicleImageFile, setVehicleImageFile] = useState<File | null>(null);
  const [rcBookFile, setRcBookFile] = useState<File | null>(null);
  
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<VehicleRegistrationFormInputs>({
    resolver: zodResolver(vehicleRegistrationSchema),
  });

  const fetchVehicleData = () => {
    setLoading(true);
    setTimeout(() => {
      const updatedVehicles = vehicles.map(v => ({ 
        ...v,
        fuelLevel: Math.max(10, Math.min(100, v.fuelLevel + Math.floor(Math.random() * 20) - 10)),
        fastagBalance: Math.max(100, v.fastagBalance + Math.floor(Math.random() * 500) - 250),
        status: v.status === 'offline' ? (Math.random() > 0.7 ? 'idle' : 'offline') : v.status,
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


  const getStatusColorClasses = (status: Vehicle['status']) => {
    switch (status) {
      case 'idle': return 'bg-primary/20 text-primary-foreground dark:bg-primary/30 dark:text-primary-foreground'; // Theme primary (Blue)
      case 'in_transit': return 'bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-accent-foreground'; // Theme accent (Teal)
      case 'maintenance': return 'bg-yellow-400/20 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300'; // Explicit yellow for warning
      case 'offline': return 'bg-muted text-muted-foreground';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'; // Fallback, ensure it's defined
    }
  };

  const getFuelProgressColor = (level: number) => {
    if (level < 25) return '[&>div]:bg-destructive'; // Theme destructive
    if (level < 50) return '[&>div]:bg-yellow-500'; // Explicit yellow for warning
    return '[&>div]:bg-accent'; // Theme accent for good level
  };


  const handleVehicleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setVehicleImageFile(e.target.files[0]);
  };
  const handleRcBookChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setRcBookFile(e.target.files[0]);
  };

  const onRegisterVehicleSubmit: SubmitHandler<VehicleRegistrationFormInputs> = async (data) => {
    let vehicleImageUrl = 'https://picsum.photos/seed/newvehicle/400/250'; 
    let rcBookMockUrl = undefined;

    if (vehicleImageFile) {
      try {
        vehicleImageUrl = await uploadFileToStorage({ file: vehicleImageFile, path: `vehicles/images/${Date.now()}-${vehicleImageFile.name}`});
      } catch (error) {
        console.error("Error uploading vehicle image (mock):", error);
        toast({ title: "Image Upload Failed (Mock)", description: "Using default image.", variant: "warning"});
      }
    }
    if (rcBookFile) {
       try {
        rcBookMockUrl = await uploadFileToStorage({ file: rcBookFile, path: `vehicles/rc_books/${Date.now()}-${rcBookFile.name}`});
      } catch (error) {
        console.error("Error uploading RC book (mock):", error);
        toast({ title: "RC Book Upload Failed (Mock)", description: "Proceeding without RC book URL.", variant: "warning"});
      }
    }

    const newVehicle: Vehicle = {
      id: `V${String(vehicles.length + 1).padStart(3, '0')}`,
      name: data.name,
      registrationNumber: data.registrationNumber.toUpperCase(),
      location: 'Garage (New)', 
      fuelLevel: 100, 
      fastagBalance: 1000, 
      status: 'idle',
      imageUrl: vehicleImageUrl,
      rcBookUrl: rcBookMockUrl,
      dataAiHint: `${data.name.split(' ')[0] || 'vehicle'} transport`, // Generic hint
      lastUpdated: 'Now',
    };

    setVehicles(prev => [newVehicle, ...prev]);
    toast({ title: "Vehicle Registered (Mock)", description: `${data.name} has been added to your fleet.` });
    resetForm();
    setVehicleImageFile(null);
    setRcBookFile(null);
    setIsRegisterDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-8 shadow-xl bg-gradient-to-br from-primary via-primary/90 to-accent/50 text-primary-foreground border-primary/30">
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle className="text-3xl font-bold">Transport Owner Dashboard</CardTitle>
                <CardDescription className="text-primary-foreground/90">Manage your fleet, view real-time status, and track finances.</CardDescription>
            </div>
            <Button onClick={fetchVehicleData} variant="secondary" size="sm" disabled={loading} className="text-secondary-foreground hover:bg-secondary/80">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <RefreshCw className="h-4 w-4 mr-2"/>}
                Refresh Data
            </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            <Truck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">Active in your fleet</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vehicles In Transit</CardTitle>
            <MapPin className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'in_transit').length}</div>
            <p className="text-xs text-muted-foreground">Currently on trips</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Attention</CardTitle>
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
        <h2 className="text-2xl font-semibold text-foreground">My Vehicle Fleet</h2>
        <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5"/> Register New Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Register a New Vehicle</DialogTitle>
              <DialogDescription>Enter the details of your vehicle to add it to your fleet. All fields are required unless marked optional.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onRegisterVehicleSubmit)} className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Vehicle Name / Model</Label>
                <Input id="name" {...register('name')} placeholder="e.g., Tata Ace Gold BS6" />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input id="registrationNumber" {...register('registrationNumber')} placeholder="e.g., MH01AB1234" />
                {errors.registrationNumber && <p className="text-sm text-destructive mt-1">{errors.registrationNumber.message}</p>}
              </div>
               <div>
                <Label htmlFor="vehicleImage">Vehicle Image (Optional)</Label>
                <Input id="vehicleImage" type="file" accept="image/*" onChange={handleVehicleImageChange} />
                {vehicleImageFile && <p className="text-xs text-muted-foreground mt-1">Selected: {vehicleImageFile.name}</p>}
              </div>
              <div>
                <Label htmlFor="rcBook">RC Book (PDF/Image, Optional)</Label>
                <Input id="rcBook" type="file" accept="image/*,.pdf" onChange={handleRcBookChange} />
                 {rcBookFile && <p className="text-xs text-muted-foreground mt-1">Selected: {rcBookFile.name}</p>}
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => { resetForm(); setVehicleImageFile(null); setRcBookFile(null); }}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isFormSubmitting} className="bg-primary hover:bg-primary/90">
                  {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Add Vehicle
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading && vehicles.length > 0 && (
         <div className="text-center py-6">
             <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
             <p className="text-muted-foreground mt-2">Refreshing vehicle data...</p>
         </div>
      )}

      {vehicles.length === 0 && !loading && (
        <Card className="text-center py-10 shadow-md border-dashed border-muted-foreground/50">
          <CardContent className="flex flex-col items-center">
            <Truck className="h-20 w-20 text-muted-foreground mb-6" />
            <p className="text-xl text-muted-foreground mb-2">Your fleet is currently empty.</p>
            <p className="text-sm text-muted-foreground mb-6">Register your vehicles to start managing them here.</p>
             <DialogTrigger asChild>
                <Button onClick={() => setIsRegisterDialogOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <PlusCircle className="mr-2 h-5 w-5"/> Register Your First Vehicle
                </Button>
            </DialogTrigger>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col group border-primary/10 hover:border-primary/30">
            <div className="relative h-52 w-full">
                <Image 
                    src={vehicle.imageUrl} 
                    alt={vehicle.name} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={vehicle.dataAiHint}
                    className="transition-transform duration-300 group-hover:scale-105"
                />
                 <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColorClasses(vehicle.status)}`}>
                  {vehicle.status.replace('_', ' ')}
                 </div>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl truncate text-foreground" title={vehicle.name}>{vehicle.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                 {vehicle.registrationNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-muted-foreground"><MapPin className="h-4 w-4 mr-2 text-primary" /> Location:</span>
                <span className="font-semibold truncate text-foreground" title={vehicle.location}>{vehicle.location}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground"><Fuel className="h-4 w-4 mr-2 text-orange-500" /> Fuel Level:</span>
                  <span className={`font-semibold ${vehicle.fuelLevel < 25 ? 'text-destructive' : vehicle.fuelLevel < 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-accent'}`}>{vehicle.fuelLevel}%</span>
                </div>
                <Progress 
                    value={vehicle.fuelLevel} 
                    className={`h-2 ${getFuelProgressColor(vehicle.fuelLevel)}`} 
                    aria-label={`Fuel level ${vehicle.fuelLevel}%`}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-muted-foreground"><IndianRupee className="h-4 w-4 mr-2 text-green-600" /> FASTag Balance:</span>
                <span className={`font-semibold ${vehicle.fastagBalance < 500 ? 'text-destructive': 'text-green-700 dark:text-green-500'}`}>₹{vehicle.fastagBalance.toLocaleString()}</span>
              </div>
              {vehicle.rcBookUrl && (
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground"><FileText className="h-4 w-4 mr-2 text-indigo-500" /> RC Book:</span>
                    <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-primary hover:underline"
                        onClick={() => {
                            toast({title: "View RC Book (Mock)", description: `Displaying RC book for ${vehicle.name}. Mock URL: ${vehicle.rcBookUrl}`});
                            window.open(vehicle.rcBookUrl, '_blank');
                        }}
                    >
                        View Document
                    </Button>
                </div>
              )}
              <div className="text-xs text-muted-foreground text-right pt-2">
                Last updated: {vehicle.lastUpdated}
              </div>
            </CardContent>
             <CardFooter className="border-t pt-4 bg-muted/30">
                <Button variant="outline" size="sm" className="flex-1 mr-2 hover:bg-secondary/70" onClick={() => toast({title: "Vehicle Details", description:`Showing details for ${vehicle.name} (${vehicle.registrationNumber})`})}>View Details</Button>
                <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => toast({title: "Manage Vehicle", description:`Managing options for ${vehicle.name}`})}>Manage</Button>
              </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}