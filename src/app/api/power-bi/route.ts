// src/app/api/power-bi/route.ts

import { NextResponse } from 'next/server';
import { format } from 'date-fns';

// --- Replicating Dummy Data Models & Data ---
// In a real application, this data would be fetched from a database (e.g., Firestore).
// For this example, we are replicating the mock data structure from the dashboard component.

type VehicleType = 'Truck' | 'Car' | 'Van' | 'Auto' | 'Bike' | 'Tipper' | 'Trailer';
type DocumentType = 'RC' | 'Insurance' | 'Pollution' | 'Permit' | 'Fitness' | 'License' | 'Aadhaar';

interface VehicleDocument {
  type: DocumentType;
  name: string;
  url: string;
  expiryDate?: string; // Using string for JSON compatibility
  status: 'active' | 'expired' | 'expiring_soon';
}

interface DriverDocument extends VehicleDocument {}

interface Driver {
  id: string;
  name: string;
  age: number;
  licenseNumber: string;
  licenseExpiry: string;
  phone: string;
  experience: number;
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
  lastServiceDate: string;
  nextServiceDate: string;
  driverId?: string;
  imageUrl: string;
  documents: VehicleDocument[];
  fuelLevel: number;
  mileage: number;
  fastagBalance: number;
}

const getDocumentStatus = (expiryDate?: Date): 'active' | 'expired' | 'expiring_soon' => {
  if (!expiryDate) return 'active';
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  if (expiryDate < today) return 'expired';
  if (expiryDate <= thirtyDaysFromNow) return 'expiring_soon';
  return 'active';
};

const initialDrivers: Driver[] = [
  {
    id: 'D01', name: 'Ramesh Kumar', age: 35, licenseNumber: 'DL1420200012345', licenseExpiry: new Date('2028-05-20').toISOString(), phone: '+91 9876543210', experience: 10, address: '123, MG Road, Bangalore', imageUrl: 'https://picsum.photos/seed/driver1/200/200', assignedVehicleIds: ['V01'],
    documents: [
      { type: 'License', name: 'Driving License', url: '#', expiryDate: new Date('2028-05-20').toISOString(), status: 'active'},
      { type: 'Aadhaar', name: 'Aadhaar Card', url: '#', status: 'active' },
    ]
  },
  {
    id: 'D02', name: 'Suresh Singh', age: 42, licenseNumber: 'MH0120180054321', licenseExpiry: new Date('2025-11-15').toISOString(), phone: '+91 9988776655', experience: 15, address: '456, SV Road, Mumbai', imageUrl: 'https://picsum.photos/seed/driver2/200/200', assignedVehicleIds: ['V02', 'V03'],
    documents: [
      { type: 'License', name: 'Driving License', url: '#', expiryDate: new Date('2025-11-15').toISOString(), status: 'active'},
      { type: 'Aadhaar', name: 'Aadhaar Card', url: '#', status: 'active' },
    ]
  },
];

const initialVehicles: Vehicle[] = [
  { 
    id: 'V01', number: 'KA 01 AB 1234', type: 'Truck', model: 'Tata Ultra T.7', owner: 'FuelFlex Corp', lastServiceDate: new Date('2024-03-15').toISOString(), nextServiceDate: new Date('2024-09-15').toISOString(), driverId: 'D01', imageUrl: 'https://picsum.photos/seed/tata-ultra/600/400',
    documents: [
      { type: 'RC', name: 'RC Book', url: '#', status: 'active' },
      { type: 'Insurance', name: 'Vehicle Insurance', url: '#', expiryDate: new Date('2025-06-30').toISOString(), status: 'active' },
      { type: 'Fitness', name: 'Fitness Certificate', url: '#', expiryDate: new Date('2024-12-31').toISOString(), status: 'expiring_soon' },
      { type: 'Permit', name: 'National Permit', url: '#', expiryDate: new Date('2026-01-15').toISOString(), status: 'active' },
      { type: 'Pollution', name: 'PUC Certificate', url: '#', expiryDate: new Date('2024-08-20').toISOString(), status: 'expired' },
    ],
    fuelLevel: 75, mileage: 125000, fastagBalance: 1250,
  },
  {
    id: 'V02', number: 'MH 12 CD 5678', type: 'Van', model: 'Maruti Suzuki Eeco', owner: 'FuelFlex Corp', lastServiceDate: new Date('2024-05-01').toISOString(), nextServiceDate: new Date('2024-11-01').toISOString(), driverId: 'D02', imageUrl: 'https://picsum.photos/seed/eeco-van/600/400',
    documents: [
      { type: 'RC', name: 'RC Book', url: '#', status: 'active' },
      { type: 'Insurance', name: 'Vehicle Insurance', url: '#', expiryDate: new Date('2025-02-10').toISOString(), status: 'active' },
      { type: 'Fitness', name: 'Fitness Certificate', url: '#', expiryDate: new Date('2025-02-10').toISOString(), status: 'active' },
      { type: 'Permit', name: 'State Permit', url: '#', expiryDate: new Date('2027-01-01').toISOString(), status: 'active' },
      { type: 'Pollution', name: 'PUC Certificate', url: '#', expiryDate: new Date('2025-01-25').toISOString(), status: 'active' },
    ],
    fuelLevel: 45, mileage: 85000, fastagBalance: 800,
  },
  {
    id: 'V03', number: 'DL 03 EF 9012', type: 'Truck', model: 'Tata LPT 3118 (12-wheeler)', owner: 'FuelFlex Corp', lastServiceDate: new Date('2024-06-20').toISOString(), nextServiceDate: new Date('2025-06-20').toISOString(), driverId: 'D02', imageUrl: 'https://picsum.photos/seed/tata-12-wheeler/600/400',
    documents: [
       { type: 'RC', name: 'RC Book', url: '#', status: 'active' },
       { type: 'Insurance', name: 'Vehicle Insurance', url: '#', expiryDate: new Date('2024-09-05').toISOString(), status: 'expiring_soon' },
       { type: 'Pollution', name: 'PUC Certificate', url: '#', expiryDate: new Date('2025-03-10').toISOString(), status: 'active' },
    ],
    fuelLevel: 90, mileage: 142000, fastagBalance: 2500,
  },
  { 
    id: 'V04', number: 'TN 22 TR 4018', type: 'Trailer', model: 'Ashok Leyland 3118', owner: 'Southern Carriers', lastServiceDate: new Date('2024-04-10').toISOString(), nextServiceDate: new Date('2024-10-10').toISOString(), driverId: undefined, imageUrl: 'https://picsum.photos/seed/ashok-leyland-trailer/600/400',
    documents: [
      { type: 'RC', name: 'RC Book', url: '#', status: 'active' },
      { type: 'Insurance', name: 'Vehicle Insurance', url: '#', expiryDate: new Date('2025-04-30').toISOString(), status: 'active' },
      { type: 'Fitness', name: 'Fitness Certificate', url: '#', expiryDate: new Date('2024-10-15').toISOString(), status: 'expiring_soon' },
      { type: 'Permit', name: 'National Permit', url: '#', expiryDate: new Date('2028-01-01').toISOString(), status: 'active' },
      { type: 'Pollution', name: 'PUC Certificate', url: '#', expiryDate: new Date('2025-04-10').toISOString(), status: 'active' },
    ],
    fuelLevel: 60, mileage: 210000, fastagBalance: 3100,
  },
  { 
    id: 'V05', number: 'GJ 05 XY 7890', type: 'Tipper', model: 'TATA 4018', owner: 'Western Infra', lastServiceDate: new Date('2024-07-01').toISOString(), nextServiceDate: new Date('2025-01-01').toISOString(), driverId: undefined, imageUrl: 'https://picsum.photos/seed/tata-tipper/600/400',
    documents: [
      { type: 'RC', name: 'RC Book', url: '#', status: 'active' },
      { type: 'Insurance', name: 'Vehicle Insurance', url: '#', expiryDate: new Date('2024-07-30').toISOString(), status: 'expired' },
      { type: 'Fitness', name: 'Fitness Certificate', url: '#', expiryDate: new Date('2024-08-30').toISOString(), status: 'expired' },
    ],
    fuelLevel: 80, mileage: 95000, fastagBalance: 500,
  },
];

const generateMonthlyDataForVehicle = (vehicleId: string, year: number) => {
    const data = [];
    const baseRevenue = 300000 + Math.random() * 200000;
    for (let i = 0; i < 12; i++) {
        const monthRevenue = baseRevenue * (1 + (Math.random() - 0.5) * 0.4);
        const monthExpenses = monthRevenue * (0.6 + Math.random() * 0.15);
        data.push({
            date: new Date(year, i, 1).toISOString(),
            vehicleId,
            month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
            year: year,
            revenue: Math.round(monthRevenue),
            expenses: Math.round(monthExpenses),
            profit: Math.round(monthRevenue - monthExpenses),
        });
    }
    return data;
};

const yearlyRevenueData = [
    ...generateMonthlyDataForVehicle('V01', 2024),
    ...generateMonthlyDataForVehicle('V02', 2024),
    ...generateMonthlyDataForVehicle('V03', 2024),
    ...generateMonthlyDataForVehicle('V04', 2024),
    ...generateMonthlyDataForVehicle('V05', 2024),
];


/**
 * GET handler for the /api/power-bi endpoint.
 * This function serves fleet management data in a JSON format
 * that can be consumed by Power BI's "Web" data source connector.
 * 
 * You can connect to this endpoint in Power BI:
 * 1. Get Data > Web
 * 2. Enter the URL: `http://<your-app-url>/api/power-bi`
 * 3. Power BI will detect the JSON structure and you can load
 *    `vehicles`, `drivers`, and `financials` as separate tables.
 */
export async function GET(request: Request) {
  try {
    // In a real-world scenario, you'd fetch this data from your database.
    // Here, we're using the mock data defined in this file.
    const data = {
      vehicles: initialVehicles,
      drivers: initialDrivers,
      financials: yearlyRevenueData,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /api/power-bi] Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data for Power BI.' },
      { status: 500 }
    );
  }
}