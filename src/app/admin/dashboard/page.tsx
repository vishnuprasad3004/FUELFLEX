
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Filter, Search, ShieldCheck, UserCog, DollarSign, Map, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Separator } from "@/components/ui/separator"; 
// import { StorageDemoComponent } from "@/services/storage-service"; // Conceptual import, actual component might be different

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

// --- StorageDemoComponent (copied from storage-service.ts for direct use here) ---
// This is for demonstration. In a real app, you'd likely have this as a separate component.
"use client";
import React, { useState, useEffect } from 'react'; // Added useEffect
import { uploadFile as uploadFileToStorage, getFileUrl as getFileUrlFromStorage, deleteFile as deleteFileFromStorage, listFilesAndFolders as listItemsFromStorage } from '@/services/storage-service';

function StorageDemoComponentInternal() { // Renamed to avoid conflict if original is imported
  const [file, setFile] = useState<File | null>(null);
  // Use useEffect to set initial filePath on client-side to avoid hydration mismatch
  const [filePath, setFilePath] = useState<string>(''); 
  useEffect(() => {
    setFilePath('test-uploads/my-file.txt');
  }, []);


  const [message, setMessage] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [listedItems, setListedItems] = useState<{ files: string[], folders: string[] }>({ files: [], folders: [] });
  const [isClient, setIsClient] = useState(false); // To ensure browser APIs are only called client-side

  useEffect(() => {
    setIsClient(true); // Component has mounted
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFilePath(`test-uploads/${selectedFile.name}`); 
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }
    setMessage("Uploading...");
    try {
      const downloadURL = await uploadFileToStorage({ file, path: filePath });
      setMessage(`File uploaded! URL: ${downloadURL}`);
      setFileUrl(downloadURL);
    } catch (error: any) {
      setMessage(`Upload failed: ${error.message}`);
    }
  };

  const handleGetUrl = async () => {
    if (!filePath) {
      setMessage("Please enter a file path to get URL.");
      return;
    }
    setMessage("Getting URL...");
    try {
      const url = await getFileUrlFromStorage(filePath);
      setMessage(`File URL: ${url}`);
      setFileUrl(url);
    } catch (error: any) {
      setMessage(`Failed to get URL: ${error.message}`);
    }
  };
  
  const handleDelete = async () => {
    if (!filePath) {
      setMessage("Please enter a file path to delete.");
      return;
    }
    setMessage("Deleting...");
    try {
      await deleteFileFromStorage({ path: filePath });
      setMessage(`File deleted from ${filePath}`);
      setFileUrl(''); 
    } catch (error: any) {
      setMessage(`Delete failed: ${error.message}`);
    }
  };

  const handleListItems = async (listPath: string) => {
    if (!isClient) return; // Ensure this runs only on client
    setMessage(`Listing items in '${listPath}'...`);
    try {
      const items = await listItemsFromStorage(listPath);
      setListedItems(items);
      setMessage(`Listed items in '${listPath}'. Files: ${items.files.length}, Folders: ${items.folders.length}`);
    } catch (error: any) {
      setMessage(`Listing failed: ${error.message}`);
    }
  }
  
  if (!isClient) {
    return <p>Loading storage demo...</p>; // Or a skeleton loader
  }

  return (
    <div className="p-4 space-y-4 border rounded-lg my-6 bg-card">
      <h3 className="text-xl font-semibold text-primary flex items-center"><UploadCloud className="mr-2 h-6 w-6"/> Firebase Storage Demo</h3>
      
      <div>
        <Label htmlFor="file-upload-admin" className="block text-sm font-medium">
          Select file to upload:
        </Label>
        <Input id="file-upload-admin" type="file" onChange={handleFileChange} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="file-path-admin" className="block text-sm font-medium">
          File Path (e.g., invoices/doc.pdf or users/uid/profile.jpg):
        </Label>
        <Input 
          id="file-path-admin" 
          type="text" 
          value={filePath} 
          onChange={(e) => setFilePath(e.target.value)} 
          placeholder="test-uploads/my-image.png" 
          className="mt-1" 
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleUpload} disabled={!file}>Upload File</Button>
        <Button onClick={handleGetUrl} disabled={!filePath}>Get File URL</Button>
        <Button onClick={handleDelete} variant="destructive" disabled={!filePath}>Delete File</Button>
      </div>

      {fileUrl && (
        <div className="mt-2">
          <p className="text-sm font-medium">Last retrieved/uploaded file URL:</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all text-sm">{fileUrl}</a>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <h4 className="text-lg font-medium">List Items in Storage Path</h4>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Input 
              type="text" 
              placeholder="Path (e.g. 'invoices/' or empty for root)" 
              id="list-path-input-admin" // Ensure unique ID
              className="flex-grow"
            />
            <Button onClick={() => {
                const pathInput = document.getElementById('list-path-input-admin') as HTMLInputElement;
                handleListItems(pathInput?.value || '');
            }}>
                List
            </Button>
        </div>
        { (listedItems.files.length > 0 || listedItems.folders.length > 0) && (
          <div className="p-2 border rounded bg-muted/50 max-h-60 overflow-y-auto text-sm">
            <p><strong>Folders:</strong></p>
            {listedItems.folders.length > 0 ? (
              <ul className="list-disc pl-5">
                {listedItems.folders.map(folder => <li key={folder}>{folder}</li>)}
              </ul>
            ) : <p className="text-xs text-muted-foreground">No folders found.</p>}
            <p className="mt-2"><strong>Files:</strong></p>
            {listedItems.files.length > 0 ? (
              <ul className="list-disc pl-5">
                {listedItems.files.map(f => <li key={f}>{f}</li>)}
              </ul>
            ) : <p className="text-xs text-muted-foreground">No files found.</p>}
          </div>
        )}
      </div>

      {message && (
        <p className={`mt-4 p-2 rounded text-sm ${message.includes('failed') || message.includes('Error') || message.includes('error') ? 'bg-destructive/20 text-destructive-foreground' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
// --- End StorageDemoComponent ---


// Helper component for Label (if not globally available or to avoid import issues in this specific context)
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`block text-sm font-medium text-foreground ${className}`}
      {...props}
    />
  );
});
Label.displayName = "Label";


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

          <Separator />

          {/* Firebase Storage Demo Section */}
          <section>
             {/* This component is defined within this file for simplicity of this request */}
            <StorageDemoComponentInternal />
          </section>


        </CardContent>
      </Card>
    </div>
  );
}

