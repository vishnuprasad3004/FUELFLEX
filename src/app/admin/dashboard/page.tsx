
// This MUST be the very first line
'use client'; 

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthRedirect } from '@/hooks/use-auth-redirect'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, query, onSnapshot, orderBy, limit, startAfter, endBefore, limitToLast, DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase-config';
import type { Booking } from '@/models/booking'; 
import { BookingStatus, RepaymentStatus } from '@/models/booking'; 
import type { UserProfile } from '@/models/user'; 
import { UserRole as UserRoleEnum } from '@/models/user'; 
import { format } from 'date-fns';
import { ArrowUpDown, FilterIcon, Eye, Edit3, ChevronLeft, ChevronRight, RefreshCw, Users, UploadCloud, PlusCircle, Loader2 } from 'lucide-react'; 
import { Separator } from '@/components/ui/separator'; 
import { useToast } from "@/components/ui/use-toast";
import { uploadFile as uploadFileToStorage, getFileUrl as getFileUrlFromStorage, listFilesAndFolders as listItemsFromStorage } from '@/services/storage-service';


const ITEMS_PER_PAGE = 10;

export default function AdminDashboardPage() {
  useAuthRedirect({ requireAuth: true, requireRole: UserRoleEnum.ADMIN }); 

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
  const [bookingHasMore, setBookingHasMore] = useState(true);
  
  // User Management States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userEmailFilter, setUserEmailFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<UserRoleEnum | 'all'>('all');
  const [userSortColumn, setUserSortColumn] = useState<keyof UserProfile | 'createdAt'>('createdAt');
  const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('desc');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userLastVisible, setUserLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [userFirstVisible, setUserFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [userHasMore, setUserHasMore] = useState(true);


  // Storage Demo states (now uses mock storage service)
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>('admin-uploads/mock-report.pdf');
  const [storageMessage, setStorageMessage] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [listedItems, setListedItems] = useState<{ files: string[], folders: string[] }>({ files: [], folders: [] });


  const fetchBookings = async (direction: 'next' | 'prev' | 'first' = 'first') => {
    setLoadingBookings(true);
    if (!firestore) {
      toast({ title: "Firestore Error", description: "Database service is not available. Check Firebase connection.", variant: "destructive" });
      setLoadingBookings(false);
      setBookingHasMore(false);
      return () => {}; 
    }
    try {
      let q = query(collection(firestore, 'bookings'));

      if (bookingStatusFilter !== 'all') {
        q = query(q, where('status', '==', bookingStatusFilter));
      }
      if (repaymentStatusFilter !== 'all') {
        q = query(q, where('repayStatus', '==', repaymentStatusFilter));
      }

      q = query(q, orderBy(bookingSortColumn, bookingSortDirection));


      if (direction === 'next' && bookingLastVisible) {
        q = query(q, startAfter(bookingLastVisible), limit(ITEMS_PER_PAGE));
      } else if (direction === 'prev' && bookingFirstVisible) {
        q = query(q, endBefore(bookingFirstVisible), limitToLast(ITEMS_PER_PAGE));
      } else { 
        q = query(q, limit(ITEMS_PER_PAGE));
      }
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedBookingsData: Booking[] = [];
        querySnapshot.forEach((doc) => {
          fetchedBookingsData.push({ bookingId: doc.id, ...doc.data() } as Booking);
        });
        
        setBookings(fetchedBookingsData);
        setBookingHasMore(fetchedBookingsData.length === ITEMS_PER_PAGE);

        if (querySnapshot.docs.length > 0) {
            setBookingLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setBookingFirstVisible(querySnapshot.docs[0]);
        } else {
            if (direction === 'first') { 
                setBookingLastVisible(null);
                setBookingFirstVisible(null);
            }
        }
        setLoadingBookings(false);
      }, (error) => {
        console.error("Error fetching bookings: ", error);
        toast({ title: "Error", description: "Failed to fetch bookings.", variant: "destructive" });
        setLoadingBookings(false);
        setBookingHasMore(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error constructing bookings query: ", error);
      toast({ title: "Query Error", description: "Failed to initialize booking fetch.", variant: "destructive" });
      setLoadingBookings(false);
      setBookingHasMore(false);
      return () => {};
    }
  };

  const fetchUsers = async (direction: 'next' | 'prev' | 'first' = 'first') => {
    setLoadingUsers(true);
     if (!firestore) {
      toast({ title: "Firestore Error", description: "Database service is not available. Check Firebase connection.", variant: "destructive" });
      setLoadingUsers(false);
      setUserHasMore(false);
      return () => {};
    }
    try {
      let q = query(collection(firestore, 'users')); 

      if (userRoleFilter !== 'all') {
        q = query(q, where('role', '==', userRoleFilter));
      }
      
      if (userRoleFilter !== 'all' && userSortColumn !== 'role') {
          q = query(q, orderBy('role'), orderBy(userSortColumn, userSortDirection));
      } else {
          q = query(q, orderBy(userSortColumn, userSortDirection));
      }
      
      if (direction === 'next' && userLastVisible) {
        q = query(q, startAfter(userLastVisible), limit(ITEMS_PER_PAGE));
      } else if (direction === 'prev' && userFirstVisible) {
        q = query(q, endBefore(userFirstVisible), limitToLast(ITEMS_PER_PAGE));
      } else {
        q = query(q, limit(ITEMS_PER_PAGE));
      }
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedUsersData: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          fetchedUsersData.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        
        setUsers(fetchedUsersData);
        setUserHasMore(fetchedUsersData.length === ITEMS_PER_PAGE);

        if (querySnapshot.docs.length > 0) {
            setUserLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setUserFirstVisible(querySnapshot.docs[0]);
        } else {
            if (direction === 'first') {
                setUserLastVisible(null); 
                setUserFirstVisible(null);
            }
        }
        setLoadingUsers(false);
      }, (error) => {
        console.error("Error fetching users: ", error);
        toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
        setLoadingUsers(false);
        setUserHasMore(false);
      });
      return unsubscribe;

    } catch (error) {
      console.error("Error constructing users query: ", error);
      toast({ title: "Query Error", description: "Failed to initialize user fetch.", variant: "destructive" });
      setLoadingUsers(false);
      setUserHasMore(false);
      return () => {};
    }
  };

  useEffect(() => {
    const unsubscribeBookingsPromise = fetchBookings('first');
    const unsubscribeUsersPromise = fetchUsers('first');
    return () => {
      unsubscribeBookingsPromise.then(unsub => typeof unsub === 'function' && unsub());
      unsubscribeUsersPromise.then(unsub => typeof unsub === 'function' && unsub());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingSortColumn, bookingSortDirection, userSortColumn, userSortDirection, userRoleFilter, bookingStatusFilter, repaymentStatusFilter]);

  useEffect(() => {
    let tempBookings = [...bookings];
    if (tripIdFilter) tempBookings = tempBookings.filter(b => b.bookingId && b.bookingId.toLowerCase().includes(tripIdFilter.toLowerCase()));
    if (driverIdFilter) tempBookings = tempBookings.filter(b => b.driverId?.toLowerCase().includes(driverIdFilter.toLowerCase()));
    setFilteredBookings(tempBookings);
  }, [bookings, tripIdFilter, driverIdFilter]);

  useEffect(() => {
    let tempUsers = [...users];
    if (userEmailFilter) tempUsers = tempUsers.filter(u => u.email?.toLowerCase().includes(userEmailFilter.toLowerCase()));
    setFilteredUsers(tempUsers);
  }, [users, userEmailFilter]);


  const handleBookingSort = (column: keyof Booking | 'estimatedTransportCost' | 'createdAt') => {
    setBookingSortDirection(prev => bookingSortColumn === column && prev === 'asc' ? 'desc' : 'asc');
    setBookingSortColumn(column); 
    setBookingCurrentPage(1); setBookingLastVisible(null); setBookingFirstVisible(null);
  };

  const handleUserSort = (column: keyof UserProfile | 'createdAt') => {
    setUserSortDirection(prev => userSortColumn === column && prev === 'asc' ? 'desc' : 'asc');
    setUserSortColumn(column); 
    setUserCurrentPage(1); setUserLastVisible(null); setUserFirstVisible(null);
  };

  const handleBookingNextPage = () => {
    if (bookingHasMore && !loadingBookings) {
      setBookingCurrentPage(prev => prev + 1); fetchBookings('next');
    } else if (!bookingHasMore && !loadingBookings) {
        toast({ title: "End of Results", description: "No more bookings to load.", variant: "default" });
    }
  };
  const handleBookingPrevPage = () => {
    if (bookingCurrentPage > 1 && !loadingBookings) { 
      setBookingCurrentPage(prev => prev - 1); fetchBookings('prev');
    }
  };
  const refreshBookings = () => {
    setBookingCurrentPage(1); setBookingLastVisible(null); setBookingFirstVisible(null); setBookingHasMore(true);
    fetchBookings('first');
    toast({title: "Bookings Refreshed", description: "Loading latest bookings..."})
  }

  const handleUserNextPage = () => {
    if (userHasMore && !loadingUsers) {
      setUserCurrentPage(prev => prev + 1); fetchUsers('next');
    } else if (!userHasMore && !loadingUsers) {
        toast({ title: "End of Results", description: "No more users to load.", variant: "default" });
    }
  };
  const handleUserPrevPage = () => {
    if (userCurrentPage > 1 && !loadingUsers) {
      setUserCurrentPage(prev => prev - 1); fetchUsers('prev');
    }
  };
  const refreshUsers = () => {
    setUserCurrentPage(1); setUserLastVisible(null); setUserFirstVisible(null); setUserHasMore(true);
    fetchUsers('first');
    toast({title: "Users Refreshed", description: "Loading latest users..."})
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setFilePath(`admin-uploads/${event.target.files[0].name}`); 
    }
  };
  const handleUpload = async () => {
    if (!file) { setStorageMessage("Please select a file to upload."); return; }
    setStorageMessage("Simulating upload...");
    try {
      const downloadURL = await uploadFileToStorage({ file, path: filePath });
      setStorageMessage(`File upload simulated! Mock URL: ${downloadURL}`); setFileUrl(downloadURL);
      toast({ title: "Upload Simulated", description: `Mock upload of ${file.name} complete.` });
    } catch (error: any) {
      setStorageMessage(`Mock upload failed: ${error.message}`);
      toast({ title: "Upload Simulation Failed", description: error.message, variant: "destructive" });
    }
  };
  const handleListItems = async (listPath: string) => {
    setStorageMessage(`Simulating listing items in '${listPath}'...`);
    try {
      const items = await listItemsFromStorage(listPath);
      setListedItems(items);
      setStorageMessage(`Listed mock items in '${listPath}'. Files: ${items.files.length}, Folders: ${items.folders.length}`);
      toast({ title: "Listing Simulated", description: `Found ${items.files.length} mock files and ${items.folders.length} mock folders.` });
    } catch (error: any) {
      setStorageMessage(`Mock listing failed: ${error.message}`);
      toast({ title: "Listing Simulation Failed", description: error.message, variant: "destructive" });
    }
  }

  const memoizedFilteredBookings = useMemo(() => filteredBookings, [filteredBookings]);
  const memoizedFilteredUsers = useMemo(() => filteredUsers, [filteredUsers]);

  const getBookingStatusBadgeStyle = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.COMPLETED:
      case BookingStatus.DELIVERED:
        return 'bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-accent-foreground'; // Teal for success
      case BookingStatus.CANCELLED_BY_ADMIN:
      case BookingStatus.CANCELLED_BY_BUYER:
      case BookingStatus.CANCELLED_BY_SELLER:
      case BookingStatus.FAILED:
        return 'bg-destructive/20 text-destructive-foreground dark:bg-destructive/30 dark:text-destructive-foreground'; // Red for destructive
      case BookingStatus.IN_TRANSIT:
      case BookingStatus.AWAITING_PICKUP:
        return 'bg-primary/20 text-primary-foreground dark:bg-primary/30 dark:text-primary-foreground'; // Blue for in-progress/info
      case BookingStatus.PENDING:
      case BookingStatus.CONFIRMED:
      case BookingStatus.ON_HOLD:
      case BookingStatus.PAYMENT_DUE: // Yellowish/Orange - using muted as fallback
        return 'bg-yellow-400/20 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300'; // Explicit yellow, as theme lacks it
      default:
        return 'bg-muted/50 text-muted-foreground';
    }
  };

  const getRepaymentStatusBadgeStyle = (status: RepaymentStatus) => {
     switch (status) {
      case RepaymentStatus.PAID:
        return 'bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-accent-foreground'; // Teal for success
      case RepaymentStatus.OVERDUE:
        return 'bg-destructive/20 text-destructive-foreground dark:bg-destructive/30 dark:text-destructive-foreground'; // Red for destructive
      case RepaymentStatus.PENDING:
      case RepaymentStatus.PARTIALLY_PAID:
         return 'bg-yellow-400/20 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300'; // Explicit yellow
      default: // NOT_APPLICABLE
        return 'bg-muted/50 text-muted-foreground';
    }
  }

   const getUserRoleBadgeStyle = (role: UserRoleEnum) => {
    switch (role) {
      case UserRoleEnum.ADMIN:
        return 'bg-accent text-accent-foreground'; // Teal
      case UserRoleEnum.TRANSPORT_OWNER:
        return 'bg-primary text-primary-foreground'; // Blue
      case UserRoleEnum.BUYER_SELLER:
        return 'bg-secondary text-secondary-foreground'; // Light Gray/Blue
      default:
        return 'bg-muted text-muted-foreground';
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-8 shadow-xl border-primary/30">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">Monitor trips, repayments, users, and platform activity.</CardDescription>
        </CardHeader>
      </Card>

      {/* Trip Monitoring Section */}
      <Card className="mb-8 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center"><FilterIcon className="mr-2 h-5 w-5 text-primary" /> Trip Filters</CardTitle>
           <Button onClick={refreshBookings} variant="outline" size="sm" disabled={loadingBookings}><RefreshCw className="h-4 w-4 mr-2"/>Refresh Trips</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input placeholder="Filter by Trip ID (client-side)" value={tripIdFilter} onChange={(e) => setTripIdFilter(e.target.value)} />
          <Input placeholder="Filter by Driver ID (client-side)" value={driverIdFilter} onChange={(e) => setDriverIdFilter(e.target.value)} />
          <Select value={bookingStatusFilter} onValueChange={(value) => {setBookingStatusFilter(value as BookingStatus | 'all'); setBookingCurrentPage(1); setBookingLastVisible(null); setBookingFirstVisible(null); setBookingHasMore(true);}}>
            <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(BookingStatus).map(status => <SelectItem key={status} value={status}>{status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={repaymentStatusFilter} onValueChange={(value) => {setRepaymentStatusFilter(value as RepaymentStatus | 'all'); setBookingCurrentPage(1); setBookingLastVisible(null); setBookingFirstVisible(null); setBookingHasMore(true);}}>
            <SelectTrigger><SelectValue placeholder="Filter by Repayment Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Repayment Statuses</SelectItem>
              {Object.values(RepaymentStatus).map(status => <SelectItem key={status} value={status}>{status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
         <CardContent>
          {loadingBookings && memoizedFilteredBookings.length === 0 ? (
            <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /><p className="mt-2 text-muted-foreground">Loading bookings...</p></div>
          ) : !loadingBookings && memoizedFilteredBookings.length === 0 ? (
             <p className="text-center text-muted-foreground py-4">No bookings match current filters or no bookings found.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleBookingSort('bookingId')} className="cursor-pointer hover:bg-muted/50 transition-colors">Trip ID <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead>Goods Type</TableHead>
                    <TableHead onClick={() => handleBookingSort('estimatedTransportCost')} className="cursor-pointer hover:bg-muted/50 transition-colors">Est. Cost <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleBookingSort('status')} className="cursor-pointer hover:bg-muted/50 transition-colors">Status <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                     <TableHead onClick={() => handleBookingSort('repayStatus')} className="cursor-pointer hover:bg-muted/50 transition-colors">Repayment <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleBookingSort('createdAt')} className="cursor-pointer hover:bg-muted/50 transition-colors">Booked On <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memoizedFilteredBookings.map((booking) => (
                    <TableRow key={booking.bookingId} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{booking.bookingId ? booking.bookingId.substring(0,8) + '...' : 'N/A'}</TableCell>
                      <TableCell>{(booking as any).goodsType || 'N/A'}</TableCell>
                      <TableCell>₹{booking.estimatedTransportCost?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getBookingStatusBadgeStyle(booking.status)}`}>
                          {booking.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getRepaymentStatusBadgeStyle(booking.repayStatus)}`}>
                          {booking.repayStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </TableCell>
                      <TableCell>
                        {booking.createdAt && (booking.createdAt as any).seconds ? format(new Date((booking.createdAt as any).seconds * 1000), 'PPp') : booking.createdAt instanceof Date ? format(booking.createdAt, 'PPp') : 'N/A'}
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => toast({title: "View Booking", description: `Details for ${booking.bookingId}`})}><Eye className="h-4 w-4 text-primary"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => toast({title: "Edit Booking", description: `Editing ${booking.bookingId}`})}><Edit3 className="h-4 w-4 text-primary"/></Button>
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
            <Button variant="outline" size="sm" onClick={handleBookingNextPage} disabled={loadingBookings || !bookingHasMore}>Next<ChevronRight className="h-4 w-4 ml-1"/></Button>
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-8" />

      {/* User Management Section */}
      <Card className="mb-8 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> User Management</CardTitle>
            <Button onClick={refreshUsers} variant="outline" size="sm" disabled={loadingUsers}><RefreshCw className="h-4 w-4 mr-2"/>Refresh Users</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input placeholder="Filter by Email (client-side)..." value={userEmailFilter} onChange={(e) => setUserEmailFilter(e.target.value)} />
            <Select value={userRoleFilter} onValueChange={(value) => {setUserRoleFilter(value as UserRoleEnum | 'all'); setUserCurrentPage(1); setUserLastVisible(null); setUserFirstVisible(null); setUserHasMore(true); }}>
                <SelectTrigger><SelectValue placeholder="Filter by Role" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {Object.values(UserRoleEnum).map(role => <SelectItem key={role} value={role}>{role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
            </Select>
        </CardContent>
        <CardContent>
          {loadingUsers && memoizedFilteredUsers.length === 0 ? (
            <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /><p className="mt-2 text-muted-foreground">Loading users...</p></div>
          ) : !loadingUsers && memoizedFilteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No users match current filters or no users found.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleUserSort('uid')} className="cursor-pointer hover:bg-muted/50 transition-colors">User ID <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleUserSort('email')} className="cursor-pointer hover:bg-muted/50 transition-colors">Email <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleUserSort('displayName')} className="cursor-pointer hover:bg-muted/50 transition-colors">Display Name <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleUserSort('role')} className="cursor-pointer hover:bg-muted/50 transition-colors">Role <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead onClick={() => handleUserSort('createdAt')} className="cursor-pointer hover:bg-muted/50 transition-colors">Joined On <ArrowUpDown size={16} className="inline ml-1" /></TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memoizedFilteredUsers.map((user) => (
                    <TableRow key={user.uid} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{user.uid ? user.uid.substring(0,10) + '...' : 'N/A'}</TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>{user.displayName || 'N/A'}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getUserRoleBadgeStyle(user.role)}`}>
                        {user.role ? user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        {user.createdAt && (user.createdAt as any).seconds ? format(new Date((user.createdAt as any).seconds * 1000), 'PPp') : user.createdAt instanceof Date ? format(user.createdAt, 'PPp') : 'N/A'}
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => toast({title: "View User", description: `Details for ${user.email}`})}><Eye className="h-4 w-4 text-primary"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => toast({title: "Edit User Role", description: `Editing role for ${user.email}`})}><Edit3 className="h-4 w-4 text-primary"/></Button>
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
            <Button variant="outline" size="sm" onClick={handleUserNextPage} disabled={loadingUsers || !userHasMore}>Next<ChevronRight className="h-4 w-4 ml-1"/></Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* File Management Section (Mock Storage Demo) */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><UploadCloud className="mr-2 h-5 w-5 text-primary"/>File Management (Mock Storage Demo)</CardTitle>
          <CardDescription className="text-muted-foreground">
            Demonstrates file operations using a MOCK storage service. 
            Actual file uploads to cloud storage are NOT occurring with this setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select file to simulate upload:</Label>
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
            <Button onClick={handleUpload} disabled={!file}>
                <UploadCloud className="mr-2 h-4 w-4"/> Simulate Upload
            </Button>
          </div>
           {fileUrl && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Last simulated/retrieved file mock URL:</p>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all text-sm">{fileUrl}</a>
            </div>
          )}
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-medium">List Mock Items in Storage Path</h3>
            <div className="flex space-x-2 items-center">
                <Input 
                  type="text" 
                  placeholder="Path (e.g., 'admin-uploads/' or empty for root)" 
                  id="list-path-input"
                  defaultValue="admin-uploads/"
                  className="flex-grow"
                />
                <Button onClick={() => {
                    const pathInput = document.getElementById('list-path-input') as HTMLInputElement;
                    handleListItems(pathInput?.value || '');
                }} variant="outline">
                    List Mock Items
                </Button>
            </div>
            { (listedItems.files.length > 0 || listedItems.folders.length > 0) && (
              <Card className="p-4 bg-muted/50 max-h-60 overflow-y-auto mt-2 rounded-md">
                <h4 className="font-semibold text-sm">Mock Folders:</h4>
                {listedItems.folders.length > 0 ? (
                  <ul className="list-disc pl-5 text-xs text-muted-foreground">
                    {listedItems.folders.map(folder => <li key={folder}>{folder}</li>)}
                  </ul>
                ) : <p className="text-xs text-muted-foreground">No mock folders found.</p>}
                <h4 className="font-semibold mt-2 text-sm">Mock Files:</h4>
                {listedItems.files.length > 0 ? (
                  <ul className="list-disc pl-5 text-xs text-muted-foreground">
                    {listedItems.files.map(fileItem => <li key={fileItem}>{fileItem}</li>)}
                  </ul>
                ) : <p className="text-xs text-muted-foreground">No mock files found.</p>}
              </Card>
            )}
          </div>
          {storageMessage && (
            <p className={`mt-4 p-3 rounded-md text-sm ${storageMessage.includes('failed') || storageMessage.includes('Error') ? 'bg-destructive/10 text-destructive dark:bg-destructive/20' : 'bg-accent/10 text-accent-foreground dark:bg-accent/20 dark:text-accent-foreground'}`}>
              {storageMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}