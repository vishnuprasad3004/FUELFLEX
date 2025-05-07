// This MUST be the very first line
'use client'; 

import React, { useState, useEffect, useMemo } from 'react';
// import { useAuthRedirect } from '@/hooks/use-auth-redirect'; // Temporarily commented out for bypass
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, query, getDocs, onSnapshot, orderBy, limit, startAfter, endBefore, limitToLast, DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase-config';
import type { Booking, BookingStatus, RepaymentStatus } from '@/models/booking';
import type { UserProfile, UserRole } from '@/models/user'; // Import UserProfile and UserRole
import { UserRole as UserRoleEnum } from '@/models/user'; // Import UserRole enum for filter
import { format } from 'date-fns';
import { ArrowUpDown, Download, FilterIcon, Eye, Edit3, Trash2, ChevronLeft, ChevronRight, RefreshCw, Users } from 'lucide-react';
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
  const [loadingBookings, setLoadingBookings] = useState(true);
  const { toast } = useToast();

  // Booking Filters
  const [tripIdFilter, setTripIdFilter] = useState('');
  const [driverIdFilter, setDriverIdFilter] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [repaymentStatusFilter, setRepaymentStatusFilter] = useState<RepaymentStatus | 'all'>('all');

  // Booking Sorting
  const [bookingSortColumn, setBookingSortColumn] = useState<keyof Booking | 'estimatedTransportCost' | 'createdAt'>('createdAt');
  const [bookingSortDirection, setBookingSortDirection] = useState<'asc' | 'desc'>('desc');

  // Booking Pagination
  const [bookingCurrentPage, setBookingCurrentPage] = useState(1);
  const [bookingLastVisible, setBookingLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [bookingFirstVisible, setBookingFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  
  // User Management States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userEmailFilter, setUserEmailFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<UserRole | 'all'>('all');
  const [userSortColumn, setUserSortColumn] = useState<keyof UserProfile | 'createdAt'>('createdAt');
  const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('desc');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userLastVisible, setUserLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [userFirstVisible, setUserFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);


  // Storage Demo states
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>('admin-uploads/report.pdf');
  const [storageMessage, setStorageMessage] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [listedItems, setListedItems] = useState<{ files: string[], folders: string[] }>({ files: [], folders: [] });


  const fetchBookings = async (direction: 'next' | 'prev' | 'first' = 'first') => {
    setLoadingBookings(true);
    try {
      let q = query(collection(firestore, 'bookings'), orderBy(bookingSortColumn, bookingSortDirection));

      if (direction === 'next' && bookingLastVisible) {
        q = query(q, startAfter(bookingLastVisible), limit(ITEMS_PER_PAGE));
      } else if (direction === 'prev' && bookingFirstVisible) {
        q = query(q, endBefore(bookingFirstVisible), limitToLast(ITEMS_PER_PAGE));
      } else { 
        q = query(q, limit(ITEMS_PER_PAGE));
      }
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedBookings: Booking[] = [];
        querySnapshot.forEach((doc) => {
          fetchedBookings.push({ bookingId: doc.id, ...doc.data() } as Booking);
        });
        
        setBookings(fetchedBookings);
        if (querySnapshot.docs.length > 0) {
            setBookingLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setBookingFirstVisible(querySnapshot.docs[0]);
        }
        setLoadingBookings(false);
      }, (error) => {
        console.error("Error fetching bookings: ", error);
        toast({ title: "Error", description: "Failed to fetch bookings.", variant: "destructive" });
        setLoadingBookings(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error constructing bookings query: ", error);
      toast({ title: "Error", description: "Failed to initialize booking fetch.", variant: "destructive" });
      setLoadingBookings(false);
    }
  };

  const fetchUsers = async (direction: 'next' | 'prev' | 'first' = 'first') => {
    setLoadingUsers(true);
    try {
      let q = query(collection(firestore, 'users'), orderBy(userSortColumn, userSortDirection));

      if (userRoleFilter !== 'all') {
        q = query(q, where('role', '==', userRoleFilter));
      }
      
      if (direction === 'next' && userLastVisible) {
        q = query(q, startAfter(userLastVisible), limit(ITEMS_PER_PAGE));
      } else if (direction === 'prev' && userFirstVisible) {
        q = query(q, endBefore(userFirstVisible), limitToLast(ITEMS_PER_PAGE));
      } else {
        q = query(q, limit(ITEMS_PER_PAGE));
      }
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedUsers: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        
        setUsers(fetchedUsers);
        if (querySnapshot.docs.length > 0) {
            setUserLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setUserFirstVisible(querySnapshot.docs[0]);
        } else {
            setUserLastVisible(null); // Important if filters yield no results on a page
            setUserFirstVisible(null);
        }
        setLoadingUsers(false);
      }, (error) => {
        console.error("Error fetching users: ", error);
        toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
        setLoadingUsers(false);
      });
      return unsubscribe;

    } catch (error) {
      console.error("Error constructing users query: ", error);
      toast({ title: "Error", description: "Failed to initialize user fetch.", variant: "destructive" });
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const unsubscribeBookingsPromise = fetchBookings();
    const unsubscribeUsersPromise = fetchUsers();
    return () => {
      unsubscribeBookingsPromise?.then(unsub => typeof unsub === 'function' && unsub());
      unsubscribeUsersPromise?.then(unsub => typeof unsub === 'function' && unsub());
    };
  }, [bookingSortColumn, bookingSortDirection, userSortColumn, userSortDirection, userRoleFilter]); // Refetch on sort/filter change

  useEffect(() => {
    let tempBookings = [...bookings];
    if (tripIdFilter) tempBookings = tempBookings.filter(b => b.bookingId.toLowerCase().includes(tripIdFilter.toLowerCase()));
    if (driverIdFilter) tempBookings = tempBookings.filter(b => b.driverId?.toLowerCase().includes(driverIdFilter.toLowerCase()));
    if (bookingStatusFilter !== 'all') tempBookings = tempBookings.filter(b => b.status === bookingStatusFilter);
    if (repaymentStatusFilter !== 'all') tempBookings = tempBookings.filter(b => b.repayStatus === repaymentStatusFilter);
    setFilteredBookings(tempBookings);
  }, [bookings, tripIdFilter, driverIdFilter, bookingStatusFilter, repaymentStatusFilter]);

  useEffect(() => {
    let tempUsers = [...users];
    if (userEmailFilter) tempUsers = tempUsers.filter(u => u.email?.toLowerCase().includes(userEmailFilter.toLowerCase()));
    // Role filter is handled by Firestore query
    setFilteredUsers(tempUsers);
  }, [users, userEmailFilter]);


  const handleBookingSort = (column: keyof Booking | 'estimatedTransportCost' | 'createdAt') => {
    if (bookingSortColumn === column) setBookingSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setBookingSortColumn(column); setBookingSortDirection('asc'); }
    setBookingCurrentPage(1); setBookingLastVisible(null); setBookingFirstVisible(null);
  };

  const handleUserSort = (column: keyof UserProfile | 'createdAt') => {
    if (userSortColumn === column) setUserSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setUserSortColumn(column); setUserSortDirection('asc'); }
    setUserCurrentPage(1); setUserLastVisible(null); setUserFirstVisible(null);
  };

  const handleBookingNextPage = () => {
    if (bookingLastVisible && filteredBookings.length === ITEMS_PER_PAGE) {
      setBookingCurrentPage(prev => prev + 1); fetchBookings('next');
    } else if (filteredBookings.length < ITEMS_PER_PAGE) {
        toast({ title: "End of Results", description: "No more bookings to load.", variant: "default" });
    }
  };
  const handleBookingPrevPage = () => {
    if (bookingFirstVisible && bookingCurrentPage > 1) {
      setBookingCurrentPage(prev => prev - 1); fetchBookings('prev');
    }
  };
  const refreshBookings = () => {
    setBookingCurrentPage(1); setBookingLastVisible(null); setBookingFirstVisible(null); fetchBookings('first');
    toast({title: "Bookings Refreshed", description: "Latest bookings loaded."})
  }

  const handleUserNextPage = () => {
    if (userLastVisible && filteredUsers.length === ITEMS_PER_PAGE) {
      setUserCurrentPage(prev => prev + 1); fetchUsers('next');
    } else if (filteredUsers.length < ITEMS_PER_PAGE) {
        toast({ title: "End of Results", description: "No more users to load.", variant: "default" });
    }
  };
  const handleUserPrevPage = () => {
    if (userFirstVisible && userCurrentPage > 1) {
      setUserCurrentPage(prev => prev - 1); fetchUsers('prev');
    }
  };
  const refreshUsers = () => {
    setUserCurrentPage(1); setUserLastVisible(null); setUserFirstVisible(null); fetchUsers('first');
    toast({title: "Users Refreshed", description: "Latest users loaded."})
  }


  // Storage Demo handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setFilePath(`admin-uploads/${event.target.files[0].name}`);
    }
  };
  const handleUpload = async () => {
    if (!file) { setStorageMessage("Please select a file to upload."); return; }
    setStorageMessage("Uploading...");
    try {
      const downloadURL = await uploadFileToStorage({ file, path: filePath });
      setStorageMessage(`File uploaded! URL: ${downloadURL}`); setFileUrl(downloadURL);
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
  const memoizedFilteredUsers = useMemo(() => filteredUsers, [filteredUsers]);


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
          <CardDescription>Monitor trips, repayments, users, and platform activity.</CardDescription>
        </CardHeader>
      </Card>

      {/* Trip Monitoring Section */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center"><FilterIcon className="mr-2 h-5 w-5" /> Trip Filters</CardTitle>
           <Button onClick={refreshBookings} variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2"/>Refresh Trips</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input placeholder="Filter by Trip ID..." value={tripIdFilter} onChange={(e) => setTripIdFilter(e.target.value)} />
          <Input placeholder="Filter by Driver ID..." value={driverIdFilter} onChange={(e) => setDriverIdFilter(e.target.value)} />
          <Select value={bookingStatusFilter} onValueChange={(value) => setBookingStatusFilter(value as BookingStatus | 'all')}>
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
         <CardContent>
          {loadingBookings && memoizedFilteredBookings.length === 0 ? (
            <p className="text-center py-4">Loading bookings...</p>
          ) : !loadingBookings && memoizedFilteredBookings.length === 0 && bookings.length > 0 ? (
            <p className="text-center text-muted-foreground py-4">No bookings match filters.</p>
          ) : !loadingBookings && bookings.length === 0 ? (
             <p className="text-center text-muted-foreground py-4">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleBookingSort('bookingId')} className="cursor-pointer">Trip ID <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead>Goods Type</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead onClick={() => handleBookingSort('estimatedTransportCost')} className="cursor-pointer">Est. Cost <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleBookingSort('status')} className="cursor-pointer">Status <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                     <TableHead onClick={() => handleBookingSort('repayStatus')} className="cursor-pointer">Repayment <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleBookingSort('createdAt')} className="cursor-pointer">Booked On <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memoizedFilteredBookings.map((booking) => (
                    <TableRow key={booking.bookingId}>
                      <TableCell className="font-medium">{booking.bookingId.substring(0,8)}...</TableCell>
                      <TableCell>{(booking as any).goodsType || 'N/A'}</TableCell>
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
                        {booking.createdAt ? format(new Date((booking.createdAt as any).seconds * 1000), 'PPp') : 'N/A'}
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
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={handleBookingPrevPage} disabled={bookingCurrentPage === 1 || loadingBookings}><ChevronLeft className="h-4 w-4 mr-1"/>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {bookingCurrentPage}</span>
            <Button variant="outline" size="sm" onClick={handleBookingNextPage} disabled={loadingBookings || memoizedFilteredBookings.length < ITEMS_PER_PAGE || !bookingLastVisible}>Next<ChevronRight className="h-4 w-4 ml-1"/></Button>
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-8" />

      {/* User Management Section */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> User Management</CardTitle>
            <Button onClick={refreshUsers} variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2"/>Refresh Users</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input placeholder="Filter by Email..." value={userEmailFilter} onChange={(e) => setUserEmailFilter(e.target.value)} />
            <Select value={userRoleFilter} onValueChange={(value) => setUserRoleFilter(value as UserRole | 'all')}>
                <SelectTrigger><SelectValue placeholder="Filter by Role" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {Object.values(UserRoleEnum).map(role => <SelectItem key={role} value={role}>{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
            </Select>
        </CardContent>
        <CardContent>
          {loadingUsers && memoizedFilteredUsers.length === 0 ? (
            <p className="text-center py-4">Loading users...</p>
          ) : !loadingUsers && memoizedFilteredUsers.length === 0 && users.length > 0 ? (
            <p className="text-center text-muted-foreground py-4">No users match filters.</p>
          ) : !loadingUsers && users.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleUserSort('uid')} className="cursor-pointer">User ID <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleUserSort('email')} className="cursor-pointer">Email <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleUserSort('displayName')} className="cursor-pointer">Display Name <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleUserSort('role')} className="cursor-pointer">Role <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleUserSort('createdAt')} className="cursor-pointer">Joined On <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memoizedFilteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.uid.substring(0,10)}...</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.displayName || 'N/A'}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === UserRoleEnum.ADMIN ? 'bg-purple-100 text-purple-700' : user.role === UserRoleEnum.TRANSPORT_OWNER ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? format(new Date((user.createdAt as any).seconds * 1000), 'PPp') : 'N/A'}
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => toast({title: "View User", description: `Details for ${user.email}`})}><Eye className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => toast({title: "Edit User Role", description: `Editing role for ${user.email}`})}><Edit3 className="h-4 w-4"/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
           <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={handleUserPrevPage} disabled={userCurrentPage === 1 || loadingUsers}><ChevronLeft className="h-4 w-4 mr-1"/>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {userCurrentPage}</span>
            <Button variant="outline" size="sm" onClick={handleUserNextPage} disabled={loadingUsers || memoizedFilteredUsers.length < ITEMS_PER_PAGE || !userLastVisible}>Next<ChevronRight className="h-4 w-4 ml-1"/></Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

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
                    {listedItems.files.map(fileItem => <li key={fileItem}>{fileItem}</li>)}
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