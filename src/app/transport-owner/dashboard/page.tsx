
// This MUST be the very first line
'use client';

import React, { useState, useMemo, type ChangeEvent } from 'react';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Truck, Fuel, ShieldCheck, ShieldAlert, User, Calendar, Phone, Car, Bike, RefreshCw, PlusCircle, Loader2, UploadCloud, FileText, Search, X, Star, UserCheck, Shield, BookUser, CheckCircle, Clock, XCircle, MoreHorizontal, UserPlus, IndianRupee, Satellite, TrendingUp, ArrowDown, Wallet, Percent } from 'lucide-react';
import Image from 'next/image';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { uploadFile as uploadFileToStorage } from '@/services/storage-service'; 
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';


// --- DATA MODELS ---

type VehicleType = 'Truck' | 'Car' | 'Van' | 'Auto' | 'Bike' | 'Tipper' | 'Trailer';
type DocumentType = 'RC' | 'Insurance' | 'Pollution' | 'Permit' | 'Fitness' | 'License' | 'Aadhaar';

interface VehicleDocument {
  type: DocumentType;
  name: string;
  url: string; // URL to the document (PDF/Image)
  expiryDate?: Date;
  status: 'active' | 'expired' | 'expiring_soon';
}

interface DriverDocument extends VehicleDocument {}

interface Driver {
  id: string;
  name: string;
  age: number;
  licenseNumber: string;
  licenseExpiry: Date;
  phone: string;
  experience: number; // in years
  address: string;
  imageUrl: string;
  assignedVehicleIds: string[];
  documents: DriverDocument[];
}

interface Vehicle {
  id: string;
  number: string;
  type: VehicleType;
  model: string;
  owner: string;
  lastServiceDate: Date;
  nextServiceDate: Date;
  driverId?: string;
  imageUrl: string;
  documents: VehicleDocument[];
  // New fields for extended info
  fuelLevel: number; // Percentage
  mileage: number; // in km
  fastagBalance: number; // in INR
}


// --- DUMMY DATA ---

const initialDrivers: Driver[] = [
  {
    id: 'D01', name: 'Ramesh Kumar', age: 35, licenseNumber: 'DL1420200012345', licenseExpiry: new Date('2028-05-20'), phone: '+91 9876543210', experience: 10, address: '123, MG Road, Bangalore', imageUrl: 'https://picsum.photos/seed/driver1/200/200', assignedVehicleIds: ['V01'],
    documents: [
      { type: 'License', name: 'Driving License', url: '#', expiryDate: new Date('2028-05-20'), status: 'active'},
      { type: 'Aadhaar', name: 'Aadhaar Card', url: '#', status: 'active' },
    ]
  },
  {
    id: 'D02', name: 'Suresh Singh', age: 42, licenseNumber: 'MH0120180054321', licenseExpiry: new Date('2025-11-15'), phone: '+91 9988776655', experience: 15, address: '456, SV Road, Mumbai', imageUrl: 'https://picsum.photos/seed/driver2/200/200', assignedVehicleIds: ['V02', 'V03'],
    documents: [
      { type: 'License', name: 'Driving License', url: '#', expiryDate: new Date('2025-11-15'), status: 'active'},
      { type: 'Aadhaar', name: 'Aadhaar Card', url: '#', status: 'active' },
    ]
  },
];

const initialVehicles: Vehicle[] = [
  { 
    id: 'V01', number: 'KA 01 AB 1234', type: 'Truck', model: 'Tata Ultra T.7', owner: 'FuelFlex Corp', lastServiceDate: new Date('2024-03-15'), nextServiceDate: new Date('2024-09-15'), driverId: 'D01', imageUrl: 'https://picsum.photos/seed/tata-ultra/600/400',
    documents: [
      { type: 'RC', name: 'RC Book', url: '#', status: 'active' },
      { type: 'Insurance', name: 'Vehicle Insurance', url: '#', expiryDate: new Date('2025-06-30'), status: 'active' },
      { type: 'Fitness', name: 'Fitness Certificate', url: '#', expiryDate: new Date('2024-12-31'), status: 'expiring_soon' },
      { type: 'Permit', name: 'National Permit', url: '#', expiryDate: new Date('2026-01-15'), status: 'active' },
      { type: 'Pollution', name: 'PUC Certificate', url: '#', expiryDate: new Date('2024-08-20'), status: 'expired' },
    ],
    fuelLevel: 75, mileage: 125000, fastagBalance: 1250,
  },
  {
    id: 'V02', number: 'MH 12 CD 5678', type: 'Van', model: 'Maruti Suzuki Eeco', owner: 'FuelFlex Corp', lastServiceDate: new Date('2024-05-01'), nextServiceDate: new Date('2024-11-01'), driverId: 'D02', imageUrl: 'https://picsum.photos/seed/eeco-van/600/400',
    documents: [
      { type: 'RC', name: 'RC Book', url: '#', status: 'active' },
      { type: 'Insurance', name: 'Vehicle Insurance', url: '#', expiryDate: new Date('2025-02-10'), status: 'active' },
      { type: 'Fitness', name: 'Fitness Certificate', url: '#', expiryDate: new Date('2025-02-10'), status: 'active' },
      { type: 'Permit', name: 'State Permit', url: '#', expiryDate: new Date('2027-01-01'), status: 'active' },
      { type: 'Pollution', name: 'PUC Certificate', url: '#', expiryDate: new Date('2025-01-25'), status: 'active' },
    ],
    fuelLevel: 45, mileage: 85000, fastagBalance: 800,
  },
   {
    id: 'V03', number: 'DL 03 EF 9012', type: 'Truck', model: 'Tata LPT 3118 (12-wheeler)', owner: 'FuelFlex Corp', lastServiceDate: new Date('2024-06-20'), nextServiceDate: new Date('2025-06-20'), driverId: 'D02', imageUrl: 'https://picsum.photos/seed/tata-12-wheeler/600/400',
    documents: [
       { type: 'RC', name: 'RC Book', url: '#', status: 'active' },
       { type: 'Insurance', name: 'Vehicle Insurance', url: '#', expiryDate: new Date('2024-09-05'), status: 'expiring_soon' },
       { type: 'Pollution', name: 'PUC Certificate', url: '#', expiryDate: new Date('2025-03-10'), status: 'active' },
    ],
    fuelLevel: 90, mileage: 142000, fastagBalance: 2500,
  },
  { 
    id: 'V04', number: 'TN 22 TR 4018', type: 'Trailer', model: 'Ashok Leyland 3118', owner: 'Southern Carriers', lastServiceDate: new Date('2024-04-10'), nextServiceDate: new Date('2024-10-10'), driverId: undefined, imageUrl: 'https://picsum.photos/seed/ashok-leyland-trailer/600/400',
    documents: [
      { type: 'RC', name: 'RC Book', url: '#', status: 'active' },
      { type: 'Insurance', name: 'Vehicle Insurance', url: '#', expiryDate: new Date('2025-04-30'), status: 'active' },
      { type: 'Fitness', name: 'Fitness Certificate', url: '#', expiryDate: new Date('2024-10-15'), status: 'expiring_soon' },
      { type: 'Permit', name: 'National Permit', url: '#', expiryDate: new Date('2028-01-01'), status: 'active' },
      { type: 'Pollution', name: 'PUC Certificate', url: '#', expiryDate: new Date('2025-04-10'), status: 'active' },
    ],
    fuelLevel: 60, mileage: 210000, fastagBalance: 3100,
  },
  { 
    id: 'V05', number: 'GJ 05 XY 7890', type: 'Tipper', model: 'TATA 4018', owner: 'Western Infra', lastServiceDate: new Date('2024-07-01'), nextServiceDate: new Date('2025-01-01'), driverId: undefined, imageUrl: 'https://picsum.photos/seed/tata-tipper/600/400',
    documents: [
      { type: 'RC', name: 'RC Book', url: '#', status: 'active' },
      { type: 'Insurance', name: 'Vehicle Insurance', url: '#', expiryDate: new Date('2024-07-30'), status: 'expired' },
      { type: 'Fitness', name: 'Fitness Certificate', url: '#', expiryDate: new Date('2024-08-30'), status: 'expired' },
    ],
    fuelLevel: 80, mileage: 95000, fastagBalance: 500,
  },
];

const yearlyRevenueData = [
    { name: 'Jan', revenue: 400000, expenses: 240000, profit: 160000 },
    { name: 'Feb', revenue: 300000, expenses: 190000, profit: 110000 },
    { name: 'Mar', revenue: 500000, expenses: 300000, profit: 200000 },
    { name: 'Apr', revenue: 450000, expenses: 280000, profit: 170000 },
    { name: 'May', revenue: 600000, expenses: 350000, profit: 250000 },
    { name: 'Jun', revenue: 550000, expenses: 320000, profit: 230000 },
    { name: 'Jul', revenue: 680000, expenses: 400000, profit: 280000 },
    { name: 'Aug', revenue: 650000, expenses: 380000, profit: 270000 },
    { name: 'Sep', revenue: 720000, expenses: 420000, profit: 300000 },
    { name: 'Oct', revenue: 800000, expenses: 450000, profit: 350000 },
    { name: 'Nov', revenue: 750000, expenses: 430000, profit: 320000 },
    { name: 'Dec', revenue: 900000, expenses: 500000, profit: 400000 },
];

const totalRevenue = yearlyRevenueData.reduce((acc, item) => acc + item.revenue, 0);
const totalExpenses = yearlyRevenueData.reduce((acc, item) => acc + item.expenses, 0);
const netProfit = totalRevenue - totalExpenses;
const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;


// --- ZOD SCHEMAS for Forms ---

const vehicleFormSchema = z.object({
  number: z.string().min(6, "Reg. number is required").regex(/^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,2}[ -]?[0-9]{1,4}$/, "Invalid vehicle number format"),
  type: z.enum(['Truck', 'Car', 'Van', 'Auto', 'Bike', 'Tipper', 'Trailer']),
  model: z.string().min(3, "Model name is required"),
  owner: z.string().min(3, "Owner name is required"),
  lastServiceDate: z.date({ required_error: "Last service date is required."}),
  fuelLevel: z.preprocess((val) => parseInt(String(val), 10), z.number().min(0).max(100)),
  mileage: z.preprocess((val) => parseInt(String(val), 10), z.number().min(0)),
  fastagBalance: z.preprocess((val) => parseInt(String(val), 10), z.number().min(0)),
});

const driverFormSchema = z.object({
    name: z.string().min(3, "Driver name is required"),
    age: z.preprocess(val => parseInt(String(val), 10), z.number().min(18, "Driver must be at least 18").max(65, "Age seems incorrect")),
    licenseNumber: z.string().min(10, "License number is required"),
    licenseExpiry: z.date({ required_error: "License expiry date is required." }),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    experience: z.preprocess(val => parseInt(String(val), 10), z.number().min(0, "Experience cannot be negative")),
    address: z.string().min(10, "Address is required"),
});

// --- HELPER & UTILITY FUNCTIONS ---

const getDocumentStatus = (expiryDate?: Date): 'active' | 'expired' | 'expiring_soon' => {
  if (!expiryDate) return 'active';
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  if (expiryDate < today) return 'expired';
  if (expiryDate <= thirtyDaysFromNow) return 'expiring_soon';
  return 'active';
};


const statusStyles = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  expiring_soon: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const statusIcons = {
  active: <ShieldCheck className="h-4 w-4 text-green-600" />,
  expiring_soon: <ShieldAlert className="h-4 w-4 text-yellow-600" />,
  expired: <ShieldAlert className="h-4 w-4 text-red-600" />,
};

const vehicleIcons: Record<VehicleType, React.ReactElement> = {
  Truck: <Truck className="h-6 w-6 text-primary" />,
  Car: <Car className="h-6 w-6 text-primary" />,
  Van: <Truck className="h-6 w-6 text-primary" />, // Using Truck for Van
  Auto: <Bike className="h-6 w-6 text-primary" />, // Using Bike for Auto
  Bike: <Bike className="h-6 w-6 text-primary" />,
  Tipper: <Truck className="h-6 w-6 text-primary" />,
  Trailer: <Truck className="h-6 w-6 text-primary" />,
};

const documentIcons = {
    RC: <BookUser className="h-5 w-5 text-indigo-500" />,
    Insurance: <Shield className="h-5 w-5 text-blue-500" />,
    Pollution: <ShieldCheck className="h-5 w-5 text-green-500" />,
    Permit: <FileText className="h-5 w-5 text-orange-500" />,
    Fitness: <Star className="h-5 w-5 text-yellow-500" />,
    License: <UserCheck className="h-5 w-5 text-cyan-500" />,
    Aadhaar: <User className="h-5 w-5 text-gray-500" />,
};


// --- MAIN DASHBOARD COMPONENT ---

export default function TransportOwnerDashboardPage() {
  useAuthRedirect({ requireAuth: true, requireRole: 'transport_owner' });
  
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [loading, setLoading] = useState(false); 
  const { toast } = useToast();

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<VehicleType | 'all'>('all');

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(v => filterType === 'all' || v.type === filterType)
      .filter(v => v.number.toLowerCase().includes(searchTerm.toLowerCase()) || v.model.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [vehicles, searchTerm, filterType]);

  const viewVehicleDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };
  
  const viewDriverDetails = (driverId?: string) => {
    if (!driverId) {
      toast({ title: 'No Driver Assigned', variant: 'destructive' });
      return;
    }
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setSelectedDriver(driver);
      setIsDriverModalOpen(true);
    } else {
      toast({ title: 'Driver Not Found', variant: 'destructive' });
    }
  };


  // --- FORM HANDLING ---
  const vehicleForm = useForm<z.infer<typeof vehicleFormSchema>>({ resolver: zodResolver(vehicleFormSchema), defaultValues: { fuelLevel: 70, mileage: 50000, fastagBalance: 1000 } });
  const driverForm = useForm<z.infer<typeof driverFormSchema>>({ resolver: zodResolver(driverFormSchema) });

  const onAddVehicleSubmit: SubmitHandler<z.infer<typeof vehicleFormSchema>> = async (data) => {
    const newVehicle: Vehicle = {
      id: `V${String(vehicles.length + 1).padStart(3, '0')}`,
      number: data.number.toUpperCase(),
      type: data.type as VehicleType,
      model: data.model,
      owner: data.owner,
      lastServiceDate: data.lastServiceDate,
      nextServiceDate: new Date(new Date(data.lastServiceDate).setMonth(data.lastServiceDate.getMonth() + 6)), // 6 months later
      imageUrl: `https://picsum.photos/seed/${data.number}/600/400`,
      documents: [], // Start with no documents
      fuelLevel: data.fuelLevel,
      mileage: data.mileage,
      fastagBalance: data.fastagBalance,
    };
    setVehicles(prev => [newVehicle, ...prev]);
    toast({ title: "Vehicle Added", description: `${data.model} has been added to your fleet.` });
    vehicleForm.reset();
    setIsAddVehicleModalOpen(false);
  };
  
  const onAddDriverSubmit: SubmitHandler<z.infer<typeof driverFormSchema>> = async (data) => {
      const newDriver: Driver = {
        id: `D${String(drivers.length + 1).padStart(2, '0')}`,
        name: data.name,
        age: data.age,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry,
        phone: data.phone,
        experience: data.experience,
        address: data.address,
        imageUrl: `https://picsum.photos/seed/${data.licenseNumber}/200/200`,
        assignedVehicleIds: [],
        documents: [],
      };
      setDrivers(prev => [newDriver, ...prev]);
      toast({ title: "Driver Added", description: `${data.name} has been added to your staff.` });
      driverForm.reset();
      setIsAddDriverModalOpen(false);
  };
  

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Fleet Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your vehicles, drivers, and documents.</p>
            </div>
             <div className="flex items-center space-x-2">
                 <Button onClick={() => setIsAddDriverModalOpen(true)} variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Driver
                 </Button>
                <Button onClick={() => setIsAddVehicleModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            {/* Profit Analytics Dashboard Section */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Fleet Analytics: Yearly Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last year</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <ArrowDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString('en-IN')}</div>
                            <p className="text-xs text-muted-foreground">Fuel, Tolls, Maintenance, Fines</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{netProfit.toLocaleString('en-IN')}</div>
                            <p className="text-xs text-muted-foreground">+15.2% from last year</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{profitMargin.toFixed(2)}%</div>
                            <p className="text-xs text-muted-foreground">Net Profit / Revenue</p>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue & Profit Analysis (Yearly)</CardTitle>
                        <CardDescription>Monthly breakdown of revenue, expenses, and profit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={yearlyRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                                <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
                                <Bar dataKey="profit" fill="#ffc658" name="Profit" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </section>
            
            <Separator className="my-8" />
            
            {/* Filter and Search Bar */}
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input placeholder="Search by vehicle number or model..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Truck">Truck</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Car">Car</SelectItem>
                        <SelectItem value="Auto">Auto</SelectItem>
                        <SelectItem value="Bike">Bike</SelectItem>
                        <SelectItem value="Tipper">Tipper</SelectItem>
                        <SelectItem value="Trailer">Trailer</SelectItem>
                    </SelectContent>
                </Select>
            </div>


            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVehicles.map(vehicle => {
                    const driver = drivers.find(d => d.id === vehicle.driverId);
                    const docStatus = {
                        insurance: vehicle.documents.find(d => d.type === 'Insurance')?.status,
                        fitness: vehicle.documents.find(d => d.type === 'Fitness')?.status,
                        permit: vehicle.documents.find(d => d.type === 'Permit')?.status,
                    }
                    const hasExpiredDoc = Object.values(docStatus).some(s => s === 'expired');

                    return (
                        <Card key={vehicle.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group border-l-4 border-transparent hover:border-primary">
                            {hasExpiredDoc && <div className="absolute top-0 left-0 h-full w-1.5 bg-red-500 z-10 animate-pulse" title="A document has expired!"></div>}
                            <CardHeader className="p-0">
                                <div className="relative h-48 w-full">
                                    <Image src={vehicle.imageUrl} alt={vehicle.model} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-300" data-ai-hint={`${vehicle.type} vehicle`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <h2 className="text-2xl font-bold text-white shadow-md">{vehicle.number}</h2>
                                        <p className="text-sm text-gray-200 shadow-sm">{vehicle.model}</p>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 p-2 rounded-full shadow-lg">
                                        {vehicleIcons[vehicle.type]}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                               <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                  <div title="Fuel Level">
                                    <Fuel className="h-5 w-5 mx-auto text-gray-400 mb-1"/>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{vehicle.fuelLevel}%</p>
                                  </div>
                                  <div title="Mileage">
                                     <Satellite className="h-5 w-5 mx-auto text-gray-400 mb-1"/>
                                     <p className="font-semibold text-gray-700 dark:text-gray-300">{vehicle.mileage.toLocaleString()} km</p>
                                  </div>
                                  <div title="FASTag Balance">
                                     <IndianRupee className="h-5 w-5 mx-auto text-gray-400 mb-1"/>
                                     <p className="font-semibold text-gray-700 dark:text-gray-300">₹{vehicle.fastagBalance.toLocaleString()}</p>
                                  </div>
                               </div>

                                <Separator />
                                
                                <div className="space-y-2 pt-2">
                                     <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Document Status</h4>
                                     <div className="flex justify-around items-center text-xs">
                                        <div className={cn('flex items-center gap-1 p-1 px-2 rounded-md', statusStyles[getDocumentStatus(vehicle.documents.find(d => d.type === 'Insurance')?.expiryDate)])} title={`Insurance: ${docStatus.insurance}`}>Ins</div>
                                        <div className={cn('flex items-center gap-1 p-1 px-2 rounded-md', statusStyles[getDocumentStatus(vehicle.documents.find(d => d.type === 'Fitness')?.expiryDate)])} title={`Fitness: ${docStatus.fitness}`}>Fit</div>
                                        <div className={cn('flex items-center gap-1 p-1 px-2 rounded-md', statusStyles[getDocumentStatus(vehicle.documents.find(d => d.type === 'Permit')?.expiryDate)])} title={`Permit: ${docStatus.permit}`}>Per</div>
                                        <div className={cn('flex items-center gap-1 p-1 px-2 rounded-md', statusStyles[getDocumentStatus(vehicle.documents.find(d => d.type === 'Pollution')?.expiryDate)])} title={`Pollution: ${docStatus.permit}`}>PUC</div>
                                     </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Service Schedule</h4>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>Last: {format(vehicle.lastServiceDate, 'dd MMM yyyy')}</span>
                                            <span>Next Due: {format(vehicle.nextServiceDate, 'dd MMM yyyy')}</span>
                                        </div>
                                        <Progress value={50} className="h-1.5 mt-1" />
                                    </div>
                                </div>

                                <div className="pt-2">
                                     <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Assigned Driver</h4>
                                     <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Image src={driver?.imageUrl || 'https://picsum.photos/seed/placeholder/50/50'} alt={driver?.name || "Unassigned"} width={40} height={40} className="rounded-full" data-ai-hint="driver portrait" />
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{driver?.name || 'Unassigned'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{driver ? 'View Details' : 'Assign a driver'}</p>
                                            </div>
                                        </div>
                                         <Button variant="ghost" size="sm" onClick={() => viewDriverDetails(driver?.id)}>
                                            <MoreHorizontal className="h-5 w-5"/>
                                         </Button>
                                     </div>
                                </div>
                            </CardContent>
                             <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-3 flex justify-end space-x-2">
                                <Button variant="outline" size="sm" onClick={() => viewVehicleDetails(vehicle)}>View Documents</Button>
                                <Button size="sm" onClick={() => viewVehicleDetails(vehicle)}>Manage Vehicle</Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
             {filteredVehicles.length === 0 && (
                <div className="text-center py-16 col-span-full">
                    <Truck className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-medium text-gray-800 dark:text-gray-200">No Vehicles Found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter, or add a new vehicle.</p>
                </div>
             )}
        </main>
      </div>


      {/* Modals for Details */}
      <Dialog open={isVehicleModalOpen} onOpenChange={setIsVehicleModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Vehicle Details & Documents</DialogTitle>
            <DialogDescription>{selectedVehicle?.model} - {selectedVehicle?.number}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
            {selectedVehicle?.documents.map(doc => (
                <Card key={doc.type} className="flex items-center p-3 gap-3">
                    {documentIcons[doc.type]}
                    <div className="flex-grow">
                        <p className="font-semibold">{doc.name}</p>
                        {doc.expiryDate && <p className={cn('text-xs font-medium p-1 rounded-md inline-block', statusStyles[getDocumentStatus(doc.expiryDate)])}>Expires: {format(doc.expiryDate, 'dd MMM yyyy')}</p>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open('#', '_blank')}>View</Button>
                </Card>
            ))}
             {selectedVehicle?.documents.length === 0 && <p className="text-sm text-gray-500 md:col-span-2 text-center">No documents uploaded for this vehicle.</p>}
          </div>
           <DialogFooter>
                <Button variant="secondary" onClick={() => setIsVehicleModalOpen(false)}>Close</Button>
                <Button><UploadCloud className="mr-2 h-4 w-4"/> Upload Document</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDriverModalOpen} onOpenChange={setIsDriverModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Driver Profile</DialogTitle>
             <DialogDescription>Details for {selectedDriver?.name}</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="py-4 space-y-4">
                <div className="flex items-center gap-4">
                    <Image src={selectedDriver.imageUrl} alt={selectedDriver.name} width={80} height={80} className="rounded-full border-4 border-primary" data-ai-hint="driver portrait"/>
                    <div>
                        <h3 className="text-xl font-bold">{selectedDriver.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedDriver.experience} years experience</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-semibold text-gray-500">Age:</div> <div>{selectedDriver.age}</div>
                    <div className="font-semibold text-gray-500">Phone:</div> <div>{selectedDriver.phone}</div>
                    <div className="font-semibold text-gray-500">License No:</div> <div>{selectedDriver.licenseNumber}</div>
                    <div className="font-semibold text-gray-500">License Expiry:</div> <div className={cn("font-medium", statusStyles[getDocumentStatus(selectedDriver.licenseExpiry)])}>{format(selectedDriver.licenseExpiry, 'dd MMM yyyy')}</div>
                    <div className="font-semibold text-gray-500 col-span-2">Address:</div>
                    <div className="col-span-2">{selectedDriver.address}</div>
                </div>
                <div>
                     <h4 className="font-semibold mb-2">Documents</h4>
                     <div className="space-y-2">
                        {selectedDriver.documents.map(doc => (
                             <Card key={doc.type} className="flex items-center p-2 gap-3 text-sm">
                                {documentIcons[doc.type]}
                                <p className="flex-grow font-medium">{doc.name}</p>
                                <Button variant="ghost" size="sm" onClick={() => window.open('#', '_blank')}>View</Button>
                            </Card>
                        ))}
                     </div>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modals for Adding New Entries */}
       <Dialog open={isAddVehicleModalOpen} onOpenChange={setIsAddVehicleModalOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                    <DialogDescription>Fill in the details to register a new vehicle to your fleet.</DialogDescription>
                </DialogHeader>
                <form onSubmit={vehicleForm.handleSubmit(onAddVehicleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                     <div>
                        <Label htmlFor="number">Vehicle Number</Label>
                        <Input id="number" {...vehicleForm.register('number')} placeholder="e.g. MH 12 AB 3456" />
                        {vehicleForm.formState.errors.number && <p className="text-sm text-red-500 mt-1">{vehicleForm.formState.errors.number.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="type">Vehicle Type</Label>
                        <Controller name="type" control={vehicleForm.control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Truck">Truck</SelectItem>
                                    <SelectItem value="Van">Van</SelectItem>
                                    <SelectItem value="Car">Car</SelectItem>
                                    <SelectItem value="Auto">Auto</SelectItem>
                                    <SelectItem value="Bike">Bike</SelectItem>
                                    <SelectItem value="Tipper">Tipper</SelectItem>
                                    <SelectItem value="Trailer">Trailer</SelectItem>
                                </SelectContent>
                            </Select>
                        )} />
                        {vehicleForm.formState.errors.type && <p className="text-sm text-red-500 mt-1">{vehicleForm.formState.errors.type.message}</p>}
                    </div>
                     <div>
                        <Label htmlFor="model">Model</Label>
                        <Input id="model" {...vehicleForm.register('model')} placeholder="e.g. TATA 4018" />
                        {vehicleForm.formState.errors.model && <p className="text-sm text-red-500 mt-1">{vehicleForm.formState.errors.model.message}</p>}
                    </div>
                     <div>
                        <Label htmlFor="owner">Owner Name</Label>
                        <Input id="owner" {...vehicleForm.register('owner')} />
                        {vehicleForm.formState.errors.owner && <p className="text-sm text-red-500 mt-1">{vehicleForm.formState.errors.owner.message}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                           <Label htmlFor="fuelLevel">Fuel (%)</Label>
                           <Input id="fuelLevel" type="number" {...vehicleForm.register('fuelLevel')} />
                       </div>
                        <div>
                           <Label htmlFor="mileage">Mileage (km)</Label>
                           <Input id="mileage" type="number" {...vehicleForm.register('mileage')} />
                       </div>
                        <div>
                           <Label htmlFor="fastagBalance">FASTag (₹)</Label>
                           <Input id="fastagBalance" type="number" {...vehicleForm.register('fastagBalance')} />
                       </div>
                    </div>
                    <div>
                        <Label>Last Service Date</Label>
                         <Controller name="lastServiceDate" control={vehicleForm.control} render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-gray-500")}>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent>
                            </Popover>
                         )} />
                        {vehicleForm.formState.errors.lastServiceDate && <p className="text-sm text-red-500 mt-1">{vehicleForm.formState.errors.lastServiceDate.message}</p>}
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={vehicleForm.formState.isSubmitting}>Add Vehicle</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog open={isAddDriverModalOpen} onOpenChange={setIsAddDriverModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Driver</DialogTitle>
                    <DialogDescription>Add a new driver to your personnel list.</DialogDescription>
                </DialogHeader>
                 <form onSubmit={driverForm.handleSubmit(onAddDriverSubmit)} className="space-y-3 max-h-[70vh] overflow-y-auto p-1">
                     <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...driverForm.register('name')} />
                        {driverForm.formState.errors.name && <p className="text-sm text-red-500 mt-1">{driverForm.formState.errors.name.message}</p>}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <Label htmlFor="age">Age</Label>
                           <Input id="age" type="number" {...driverForm.register('age')} />
                           {driverForm.formState.errors.age && <p className="text-sm text-red-500 mt-1">{driverForm.formState.errors.age.message}</p>}
                       </div>
                        <div>
                           <Label htmlFor="experience">Experience (Years)</Label>
                           <Input id="experience" type="number" {...driverForm.register('experience')} />
                           {driverForm.formState.errors.experience && <p className="text-sm text-red-500 mt-1">{driverForm.formState.errors.experience.message}</p>}
                       </div>
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" {...driverForm.register('phone')} />
                        {driverForm.formState.errors.phone && <p className="text-sm text-red-500 mt-1">{driverForm.formState.errors.phone.message}</p>}
                    </div>
                     <div>
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <Input id="licenseNumber" {...driverForm.register('licenseNumber')} />
                        {driverForm.formState.errors.licenseNumber && <p className="text-sm text-red-500 mt-1">{driverForm.formState.errors.licenseNumber.message}</p>}
                    </div>
                     <div>
                        <Label>License Expiry Date</Label>
                         <Controller name="licenseExpiry" control={driverForm.control} render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-gray-500")}>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                            </Popover>
                         )} />
                        {driverForm.formState.errors.licenseExpiry && <p className="text-sm text-red-500 mt-1">{driverForm.formState.errors.licenseExpiry.message}</p>}
                    </div>
                     <div>
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" {...driverForm.register('address')} />
                        {driverForm.formState.errors.address && <p className="text-sm text-red-500 mt-1">{driverForm.formState.errors.address.message}</p>}
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={driverForm.formState.isSubmitting}>Add Driver</Button>
                    </DialogFooter>
                 </form>
            </DialogContent>
        </Dialog>
    </>
  );
}
