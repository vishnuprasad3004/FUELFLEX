
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Filter, Search, ShieldCheck, UserCog, DollarSign, Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Separator } from "@/components/ui/separator"; // Added import

// Mock Data - Replace with actual data fetching and types
interface Trip {
  id: string;
  clientName: string;
  driverName: string;
  pickup: string;
  destination: string;
  status: "Ongoing" | "Completed" | "Pending" | "Cancelled";
  estimatedCost: number;
  date: string;
}

interface Repayment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
}

const mockTrips: Trip[] = [
  { id: "T001", clientName: "ABC Corp", driverName: "Ramesh K.", pickup: "Delhi", destination: "Mumbai", status: "Ongoing", estimatedCost: 12500, date: "2024-07-28" },
  { id: "T002", clientName: "XYZ Ltd", driverName: "Suresh P.", pickup: "Chennai", destination: "Bengaluru", status: "Completed", estimatedCost: 8000, date: "2024-07-25" },
  { id: "T003", clientName: "PQR Inc", driverName: "Anil S.", pickup: "Kolkata", destination: "Patna", status: "Pending", estimatedCost: 9500, date: "2024-08-01" },
];

const mockRepayments: Repayment[] = [
  { id: "R001", userId: "U001", userName: "Rohan Sharma", amount: 5000, dueDate: "2024-08-05", status: "Pending" },
  { id: "R002", userId: "U002", userName: "Priya Singh", amount: 3500, dueDate: "2024-07-20", status: "Paid" },
  { id: "R003", userId: "U003", userName: "Amit Patel", amount: 7200, dueDate: "2024-07-15", status: "Overdue" },
];

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-6xl mx-auto shadow-lg border border-border rounded-lg">
        <CardHeader className="text-center border-b pb-4 mb-6">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-3xl font-bold text-primary">Admin Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage and monitor platform operations. (Note: This page is a placeholder and not currently protected by authentication).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Trip Monitoring Section */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <h2 className="text-2xl font-semibold text-primary flex items-center"><Map className="mr-2 h-6 w-6"/> Trip Monitoring</h2>
              <div className="flex items-center gap-2">
                <Input placeholder="Search trips..." className="max-w-xs" />
                <Button variant="outline"><Filter className="mr-1 h-4 w-4" /> Filter</Button>
              </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Cost (INR)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">{trip.id}</TableCell>
                      <TableCell>{trip.clientName}</TableCell>
                      <TableCell>{trip.driverName}</TableCell>
                      <TableCell>{trip.pickup} to {trip.destination}</TableCell>
                      <TableCell>
                        <Badge variant={trip.status === "Completed" ? "default" : trip.status === "Ongoing" ? "secondary" : "outline"}
                               className={trip.status === "Cancelled" ? "bg-destructive text-destructive-foreground" : ""}>
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{trip.estimatedCost.toLocaleString('en-IN')}</TableCell>
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
                src="https://picsum.photos/seed/adminmap/600/200"
                alt="Placeholder Admin Map View"
                width={600}
                height={200}
                className="mx-auto mb-2 rounded opacity-60"
                data-ai-hint="admin map overview"
                />
                <p className="text-muted-foreground text-sm">Live trip overview map (coming soon)</p>
            </div>
          </section>

          <Separator />

          {/* Repayment Monitoring Section */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <h2 className="text-2xl font-semibold text-primary flex items-center"><DollarSign className="mr-2 h-6 w-6"/> Repayment Monitoring</h2>
               <div className="flex items-center gap-2">
                <Input placeholder="Search repayments..." className="max-w-xs" />
                <Button variant="outline"><Filter className="mr-1 h-4 w-4" /> Filter</Button>
              </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Repayment ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount (INR)</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRepayments.map((repayment) => (
                    <TableRow key={repayment.id}>
                      <TableCell className="font-medium">{repayment.id}</TableCell>
                      <TableCell>{repayment.userName} ({repayment.userId})</TableCell>
                      <TableCell className="font-mono">{repayment.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{repayment.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={repayment.status === "Paid" ? "default" : repayment.status === "Pending" ? "secondary" : "destructive"}>
                          {repayment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /> View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
          
          <Separator />

          {/* User Management (Placeholder) */}
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center"><UserCog className="mr-2 h-6 w-6"/> User Management</h2>
            <div className="p-6 border border-dashed border-border rounded-lg text-center bg-muted/50">
                <UserCog className="mx-auto h-12 w-12 text-muted-foreground mb-3"/>
                <p className="text-muted-foreground">
                    User management interface (view users, manage roles, etc.) will be available here.
                    This will require Firebase Authentication and Firestore integration.
                </p>
                <Button variant="secondary" className="mt-4" disabled>Manage Users (Coming Soon)</Button>
            </div>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
