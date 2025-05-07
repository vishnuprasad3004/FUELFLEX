'use client'; // This MUST be the very first line

import React, { useState, useEffect, useMemo } from 'react';
// import { useAuthRedirect } from '@/hooks/use-auth-redirect'; // Temporarily commented out for bypass
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit, startAfter, endBefore, limitToLast, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase-config';
import type { Booking, BookingStatus, RepaymentStatus } from '@/models/booking';
import { format } from 'date-fns';
import { ArrowUpDown, Download, FilterIcon, Eye, Edit3, Trash2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator'; 
import { useToast } from "@/components/ui/use-toast";

// --- StorageDemoComponent (copied from storage-service.ts for direct use here for now) ---
// This is for demonstration. In a real app, you'd likely have this as a separate component.
import { uploadFile as uploadFileToStorage, getFileUrl as getFileUrlFromStorage, deleteFile as deleteFileFromStorage, listFilesAndFolders as listItemsFromStorage } from '@/services/storage-service';
// --- End of StorageDemoComponent ---

const ITEMS_PER_PAGE = 10;

export default function AdminDashboardPage() {
  // useAuthRedirect({ requireAuth: true, requireRole: 'admin' }); // Temporarily commented out for bypass

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filters
  const [tripIdFilter, setTripIdFilter] = useState('');
  const [driverIdFilter, setDriverIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [repaymentStatusFilter, setRepaymentStatusFilter] = useState<RepaymentStatus | 'all'>('all');

  // Sorting
  const [sortColumn, setSortColumn] = useState<keyof Booking | 'estimatedTransportCost' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [totalBookings, setTotalBookings] = useState(0); // For displaying total count if needed

  // Storage Demo states
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>('admin-uploads/report.pdf');
  const [storageMessage, setStorageMessage] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [listedItems, setListedItems] = useState<{ files: string[], folders: string[] }>({ files: [], folders: [] });


  const fetchBookings = async (direction: 'next' | 'prev' | 'first' = 'first') => {
    setLoading(true);
    try {
      let q = query(collection(firestore, 'bookings'), orderBy(sortColumn, sortDirection));

      // Apply filters directly in the query if possible
      // This is more efficient than client-side filtering for large datasets
      // Note: Firestore requires composite indexes for complex queries involving multiple where clauses and orderBy.
      // Example (simple status filter, more complex filters might need index creation):
      // if (statusFilter !== 'all') {
      //   q = query(q, where('status', '==', statusFilter));
      // }
      // if (repaymentStatusFilter !== 'all') {
      //    q = query(q, where('repayStatus', '==', repaymentStatusFilter));
      // }
      // Filtering by tripId (substring) or driverId (substring) is best done client-side after fetching
      // or using a more advanced search solution like Algolia/Elasticsearch with Firebase.

      if (direction === 'next' && lastVisible) {
        q = query(q, startAfter(lastVisible), limit(ITEMS_PER_PAGE));
      } else if (direction === 'prev' && firstVisible) {
        q = query(q, endBefore(firstVisible), limitToLast(ITEMS_PER_PAGE));
      } else { // 'first' or initial load
        q = query(q, limit(ITEMS_PER_PAGE));
      }
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedBookings: Booking[] = [];
        querySnapshot.forEach((doc) => {
          fetchedBookings.push({ bookingId: doc.id, ...doc.data() } as Booking);
        });
        
        setBookings(fetchedBookings); // Update raw bookings
        if (querySnapshot.docs.length > 0) {
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setFirstVisible(querySnapshot.docs[0]);
        } else if (direction !== 'first') {
            // If no results on next/prev, it might mean we are at an edge
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching bookings: ", error);
        toast({ title: "Error", description: "Failed to fetch bookings.", variant: "destructive" });
        setLoading(false);
      });

      return unsubscribe;

    } catch (error) {
      console.error("Error constructing query: ", error);
      toast({ title: "Error", description: "Failed to initialize booking fetch.", variant: "destructive" });
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribePromise = fetchBookings();
    return () => {
      unsubscribePromise?.then(unsub => {
        if (typeof unsub === 'function') {
          unsub();
        }
      });
    };
  }, [sortColumn, sortDirection]); // Refetch on sort change for the first page


  useEffect(() => {
    let tempBookings = [...bookings]; // Start with the currently fetched page of bookings

    if (tripIdFilter) {
      tempBookings = tempBookings.filter(b => b.bookingId.toLowerCase().includes(tripIdFilter.toLowerCase()));
    }
    if (driverIdFilter) {
      tempBookings = tempBookings.filter(b => b.driverId?.toLowerCase().includes(driverIdFilter.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      tempBookings = tempBookings.filter(b => b.status === statusFilter);
    }
    if (repaymentStatusFilter !== 'all') {
      tempBookings = tempBookings.filter(b => b.repayStatus === repaymentStatusFilter);
    }
    
    setFilteredBookings(tempBookings);
  }, [bookings, tripIdFilter, driverIdFilter, statusFilter, repaymentStatusFilter]);

  const handleSort = (column: keyof Booking | 'estimatedTransportCost' | 'createdAt') => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
    setLastVisible(null);
    setFirstVisible(null);
    // fetchBookings will be re-triggered by the useEffect watching sortColumn/Direction
  };

  const handleNextPage = () => {
    if (lastVisible && filteredBookings.length === ITEMS_PER_PAGE) { // Ensure there *could* be more items
      setCurrentPage(prev => prev + 1);
      fetchBookings('next');
    } else if (filteredBookings.length < ITEMS_PER_PAGE) {
        toast({ title: "End of Results", description: "No more bookings to load for the current page/filters.", variant: "default" });
    }
  };

  const handlePrevPage = () => {
    if (firstVisible && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      fetchBookings('prev');
    }
  };
  
  const refreshData = () => {
    setCurrentPage(1);
    setLastVisible(null);
    setFirstVisible(null);
    fetchBookings('first');
    toast({title: "Data Refreshed", description: "Latest bookings loaded."})
  }

  // Storage Demo handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setFilePath(`admin-uploads/${event.target.files[0].name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStorageMessage("Please select a file to upload.");
      return;
    }
    setStorageMessage("Uploading...");
    try {
      const downloadURL = await uploadFileToStorage({ file, path: filePath });
      setStorageMessage(`File uploaded! URL: ${downloadURL}`);
      setFileUrl(downloadURL);
      toast({ title: "Upload Successful", description: `File ${file.name} uploaded.` });
    } catch (error: any) {
      setStorageMessage(`Upload failed: ${error.message}`);
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    }
  };
   const handleListItems = async (listPath: string) => {
    setStorageMessage(`Listing items in '${listPath}'...`);
    try {
      const items = await listItemsFromStorage(listPath);
      setListedItems(items);
      setStorageMessage(`Listed items in '${listPath}'. Files: ${items.files.length}, Folders: ${items.folders.length}`);
       toast({ title: "Listing Successful", description: `Found ${items.files.length} files and ${items.folders.length} folders.` });
    } catch (error: any) {
      setStorageMessage(`Listing failed: ${error.message}`);
      toast({ title: "Listing Failed", description: error.message, variant: "destructive" });
    }
  }


  const memoizedFilteredBookings = useMemo(() => filteredBookings, [filteredBookings]);


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
          <CardDescription>Monitor trips, repayments, users, and platform activity.</CardDescription>
        </CardHeader>
      </Card>

      {/* Filters Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><FilterIcon className="mr-2 h-5 w-5" /> Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input placeholder="Filter by Trip ID..." value={tripIdFilter} onChange={(e) => setTripIdFilter(e.target.value)} />
          <Input placeholder="Filter by Driver ID..." value={driverIdFilter} onChange={(e) => setDriverIdFilter(e.target.value)} />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | 'all')}>
            <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(BookingStatus).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={repaymentStatusFilter} onValueChange={(value) => setRepaymentStatusFilter(value as RepaymentStatus | 'all')}>
            <SelectTrigger><SelectValue placeholder="Filter by Repayment Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Repayment Statuses</SelectItem>
              {Object.values(RepaymentStatus).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Trip Monitoring Section */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trip Monitoring</CardTitle>
          <Button onClick={refreshData} variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2"/>Refresh Data</Button>
        </CardHeader>
        <CardContent>
          {loading && memoizedFilteredBookings.length === 0 ? ( // Show loading only if no data is yet displayed
            <p className="text-center py-4">Loading bookings...</p>
          ) : !loading && memoizedFilteredBookings.length === 0 && bookings.length > 0 ? ( // No results after filtering, but raw bookings exist
            <p className="text-center text-muted-foreground py-4">No bookings match the current client-side filters.</p>
          ) : !loading && bookings.length === 0 ? ( // No bookings fetched from Firestore at all
             <p className="text-center text-muted-foreground py-4">No bookings found in the database.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('bookingId')} className="cursor-pointer">
                      Trip ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead>Goods Type</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead onClick={() => handleSort('estimatedTransportCost')} className="cursor-pointer">
                      Est. Cost <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                      Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                     <TableHead onClick={() => handleSort('repayStatus')} className="cursor-pointer">
                      Repayment <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">
                      Booked On <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memoizedFilteredBookings.map((booking) => (
                    <TableRow key={booking.bookingId}>
                      <TableCell className="font-medium">{booking.bookingId.substring(0,8)}...</TableCell>
                      <TableCell>{(booking as any).goodsType || 'N/A'}</TableCell> {/* Temp fix for goodsType */}
                      <TableCell>{booking.vehicleType || 'N/A'}</TableCell>
                      <TableCell>₹{booking.estimatedTransportCost?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded-full text-xs font-semibold 
                        ${booking.status === BookingStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                          booking.status === BookingStatus.CANCELLED_BY_ADMIN || booking.status === BookingStatus.CANCELLED_BY_BUYER || booking.status === BookingStatus.CANCELLED_BY_SELLER ? 'bg-red-100 text-red-700' :
                          booking.status === BookingStatus.IN_TRANSIT ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {booking.status}
                      </span></TableCell>
                      <TableCell><span className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.repayStatus === RepaymentStatus.PAID ? 'bg-green-100 text-green-700' : booking.repayStatus === RepaymentStatus.OVERDUE ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {booking.repayStatus}
                        </span></TableCell>
                      <TableCell>
                        {booking.createdAt ? format(new Date((booking.createdAt as any).seconds * 1000), 'PPpp') : 'N/A'}
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => toast({title: "View Booking", description: `Details for ${booking.bookingId}`})}><Eye className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => toast({title: "Edit Booking", description: `Editing ${booking.bookingId}`})}><Edit3 className="h-4 w-4"/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination Controls */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1"/>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={loading || memoizedFilteredBookings.length < ITEMS_PER_PAGE || !lastVisible}

            >
              Next
              <ChevronRight className="h-4 w-4 ml-1"/>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-8" /> {/* Separator usage */}

      {/* File Management Section (Firebase Storage Demo) */}
      <Card>
        <CardHeader>
          <CardTitle>File Management (Storage Demo)</CardTitle>
          <CardDescription>Upload, list, and manage files in Firebase Storage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select file to upload:</Label>
            <Input id="file-upload" type="file" onChange={handleFileChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file-path">File Path (e.g., reports/monthly.pdf):</Label>
            <Input 
              id="file-path" 
              type="text" 
              value={filePath} 
              onChange={(e) => setFilePath(e.target.value)} 
              placeholder="admin-uploads/document.pdf" 
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleUpload} disabled={!file}>Upload File</Button>
            {/* <Button onClick={handleGetUrl} disabled={!filePath}>Get File URL</Button> */}
            {/* <Button onClick={handleDelete} variant="destructive" disabled={!filePath}>Delete File</Button> */}
          </div>
           {fileUrl && (
            <div className="mt-2">
              <p>Last retrieved/uploaded file URL:</p>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{fileUrl}</a>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-medium">List Items in Storage Path</h3>
            <div className="flex space-x-2 items-center">
                <Input 
                  type="text" 
                  placeholder="Path (e.g., 'admin-uploads/' or empty for root)" 
                  id="list-path-input"
                  defaultValue="admin-uploads/"
                  className="flex-grow"
                />
                <Button onClick={() => handleListItems((document.getElementById('list-path-input') as HTMLInputElement)?.value || '')}>
                    List
                </Button>
            </div>
            { (listedItems.files.length > 0 || listedItems.folders.length > 0) && (
              <Card className="p-4 bg-muted/50 max-h-60 overflow-y-auto">
                <h4 className="font-semibold">Folders:</h4>
                {listedItems.folders.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm">
                    {listedItems.folders.map(folder => <li key={folder}>{folder}</li>)}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">No folders found.</p>}
                <h4 className="font-semibold mt-2">Files:</h4>
                {listedItems.files.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm">
                    {listedItems.files.map(file => <li key={file}>{file}</li>)}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">No files found.</p>}
              </Card>
            )}
          </div>

          {storageMessage && (
            <p className={`mt-4 p-2 rounded text-sm ${storageMessage.includes('failed') || storageMessage.includes('Error') ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
              {storageMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
