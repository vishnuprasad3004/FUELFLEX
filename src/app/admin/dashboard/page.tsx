
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Filter, Search, ShieldCheck, UserCog, DollarSign, Map, UploadCloud, Package, Calendar, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Separator } from "@/components/ui/separator"; 
import { StorageDemoWidget } from "@/components/admin/storage-demo-widget"; 
import type { Booking, ActionLogEntry } from "@/models/booking";
import { BookingStatus, RepaymentStatus, VEHICLE_TYPES } from "@/models/booking";
import { format } from 'date-fns'; // For date formatting

// Mock Data - Replace with actual data fetching and types
const mockBookings: Booking[] = [
  {
    bookingId: "B001",
    clientId: "C001",
    clientName: "ABC Corp",
    from: { address: "Warehouse A, Delhi", latitude: 28.6139, longitude: 77.2090 },
    to: { address: "Client Site, Mumbai", latitude: 19.0760, longitude: 72.8777 },
    goodsType: "Electronics",
    weightKg: 1200,
    vehicleType: VEHICLE_TYPES[1], // Medium Truck
    preferredDate: new Date("2024-08-15T10:00:00Z"),
    status: BookingStatus.IN_TRANSIT,
    driverId: "D001",
    driverName: "Ramesh Kumar",
    estimatedCost: 12500,
    fuelCreditRequested: true,
    fuelCost: 4500,
    repayAmount: 4750, // Includes small interest/fee
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
    clientId: "C002",
    clientName: "XYZ Ltd",
    from: { address: "Factory Hub, Chennai", latitude: 13.0827, longitude: 80.2707 },
    to: { address: "Retail Outlet, Bengaluru", latitude: 12.9716, longitude: 77.5946 },
    goodsType: "Textiles",
    weightKg: 800,
    vehicleType: VEHICLE_TYPES[0], // Small Truck
    preferredDate: new Date("2024-08-10T14:00:00Z"),
    status: BookingStatus.DELIVERED,
    driverId: "D002",
    driverName: "Suresh Patil",
    estimatedCost: 8000,
    finalCost: 7800,
    fuelCreditRequested: false,
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
    clientId: "C003",
    clientName: "PQR Inc",
    from: { address: "Port Area, Kolkata", latitude: 22.5726, longitude: 88.3639 },
    to: { address: "Distribution Center, Patna", latitude: 25.5941, longitude: 85.1376 },
    goodsType: "Industrial Parts",
    weightKg: 2500,
    vehicleType: VEHICLE_TYPES[2], // Large Truck
    preferredDate: null, // No preference
    status: BookingStatus.PAYMENT_DUE,
    driverId: "D003",
    driverName: "Anil Singh",
    estimatedCost: 9500,
    finalCost: 9500,
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
      return "default"; // Greenish or primary
    case BookingStatus.IN_TRANSIT:
    case BookingStatus.ASSIGNED:
    case RepaymentStatus.PENDING:
      return "secondary"; // Bluish or yellowish
    case BookingStatus.CANCELLED:
    case BookingStatus.ON_HOLD: // Could be warning
    case RepaymentStatus.OVERDUE:
      return "destructive"; // Reddish
    case BookingStatus.PENDING:
    case BookingStatus.CONFIRMED:
    case BookingStatus.PAYMENT_DUE:
    case RepaymentStatus.PARTIALLY_PAID:
      return "outline"; // Neutral or warning-like
    default:
      return "outline";
  }
};


export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-7xl mx-auto shadow-lg border border-border rounded-lg">
        <CardHeader className="text-center border-b pb-4 mb-6">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-3xl font-bold text-primary">Admin Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage and monitor platform bookings and operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <h2 className="text-2xl font-semibold text-primary flex items-center"><Package className="mr-2 h-6 w-6"/> Booking Management</h2>
              <div className="flex items-center gap-2">
                <Input placeholder="Search by Booking ID, Client, Driver..." className="max-w-xs" />
                <Button variant="outline"><Filter className="mr-1 h-4 w-4" /> Filter</Button>
              </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Goods/Vehicle</TableHead>
                    <TableHead><Calendar className="inline-block mr-1 h-4 w-4"/>Date</TableHead>
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
                      <TableCell>{booking.clientName || booking.clientId}</TableCell>
                      <TableCell className="text-xs">
                        <div className="font-semibold">{booking.from.address}</div>
                        <div className="text-muted-foreground">to {booking.to.address}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div><span className="font-semibold">Type:</span> {booking.goodsType}</div>
                        <div><span className="font-semibold">Weight:</span> {booking.weightKg} kg</div>
                        <div><span className="font-semibold">Vehicle:</span> {booking.vehicleType}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {booking.preferredDate ? format(new Date(booking.preferredDate), "PPp") : 'ASAP'}
                        <div className="text-muted-foreground">Created: {format(new Date(booking.createdAt), "PP")}</div>
                      </TableCell>
                      <TableCell>{booking.driverName || booking.driverId || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize text-xs">
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {booking.finalCost?.toLocaleString('en-IN') || booking.estimatedCost?.toLocaleString('en-IN') || 'N/A'}
                        {booking.finalCost && booking.estimatedCost && booking.finalCost !== booking.estimatedCost && (
                          <div className="text-xs text-muted-foreground line-through">{booking.estimatedCost.toLocaleString('en-IN')}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {booking.fuelCreditRequested ? (
                          <>
                            <div>Amt: <span className="font-mono">{booking.repayAmount?.toLocaleString('en-IN') || 'N/A'}</span></div>
                            <Badge variant={getStatusBadgeVariant(booking.repayStatus)} className="capitalize mt-1">
                              {booking.repayStatus.replace('_', ' ')}
                            </Badge>
                            {booking.repayDueDate && <div className="text-muted-foreground mt-0.5">Due: {format(new Date(booking.repayDueDate), "PP")}</div>}
                          </>
                        ) : (
                          <Badge variant="outline">No Credit</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /> View</Button>
                        {/* More actions could be added here (e.g., Edit, Cancel) */}
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

          {/* User Management (Placeholder) */}
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center"><Users className="mr-2 h-6 w-6"/> User Management</h2>
            <div className="p-6 border border-dashed border-border rounded-lg text-center bg-muted/50">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3"/>
                <p className="text-muted-foreground">
                    User management (clients, drivers, admins) and role assignments will be available here.
                </p>
                <Button variant="secondary" className="mt-4" disabled>Manage Users (Coming Soon)</Button>
            </div>
          </section>

          <Separator />

          {/* Firebase Storage Demo Section */}
          <section>
            <StorageDemoWidget />
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
