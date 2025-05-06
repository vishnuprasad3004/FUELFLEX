
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MapPin, Package, Calendar, Clock, Truck, Building, Home, CircleDollarSign, Loader2, IndianRupee, AlertCircle, CreditCard, FileText, Car } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculatePrice, type CalculatePriceInput, type CalculatePriceOutput } from "@/ai/flows/ai-powered-pricing";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar as ShadCalendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VEHICLE_TYPES, type VehicleType } from "@/models/booking";


// Define the form schema using Zod
const formSchema = z.object({
  pickupAddress: z.string().min(5, { message: "Pickup address must be at least 5 characters." }),
  destinationAddress: z.string().min(5, { message: "Destination address must be at least 5 characters." }),
  pickupLatitude: z.number().min(-90).max(90).optional(),
  pickupLongitude: z.number().min(-180).max(180).optional(),
  destinationLatitude: z.number().min(-90).max(90).optional(),
  destinationLongitude: z.number().min(-180).max(180).optional(),
  goodsType: z.string().min(3, { message: "Please describe the type of goods." }), // Renamed from goodsDescription
  loadWeightKg: z.coerce.number().positive({ message: "Weight must be a positive number." }),
  vehicleType: z.string().min(1, { message: "Please select a vehicle type." }), // New field
  preferredDate: z.date({ required_error: "Preferred pickup date is required." }), // Renamed from pickupDate
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
});

type FormData = z.infer<typeof formSchema>;

const EXAMPLE_COORDINATES = {
    delhi: { lat: 28.6139, lng: 77.2090 },
    mumbai: { lat: 19.0760, lng: 72.8777 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    bengaluru: { lat: 12.9716, lng: 77.5946 },
};

const isValidCoordinate = (coord: number | undefined | null): coord is number => {
    return typeof coord === 'number' && !isNaN(coord);
}

export function BookingForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [priceResult, setPriceResult] = React.useState<CalculatePriceOutput | null>(null);
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickupAddress: "Delhi", 
      destinationAddress: "Mumbai", 
      goodsType: "",
      loadWeightKg: undefined,
      vehicleType: VEHICLE_TYPES[0], // Default to the first vehicle type
      preferredDate: new Date(), 
      pickupTime: "09:00",
      pickupLatitude: EXAMPLE_COORDINATES.delhi.lat,
      pickupLongitude: EXAMPLE_COORDINATES.delhi.lng,
      destinationLatitude: EXAMPLE_COORDINATES.mumbai.lat,
      destinationLongitude: EXAMPLE_COORDINATES.mumbai.lng,
    },
  });

  // TODO: This onSubmit function needs to be updated to create a `Booking` document in Firestore
  // and not just call the `calculatePrice` flow. This is a significant change and would involve
  // interacting with Firestore services, which are not fully defined yet.
  // For now, it will still primarily focus on price estimation.
  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setPriceResult(null); 
    setSubmissionError(null);

    const pickupCoords = {
        latitude: values.pickupLatitude, 
        longitude: values.pickupLongitude,
    };
    const destinationCoords = {
        latitude: values.destinationLatitude,
        longitude: values.destinationLongitude,
    };
    console.log(
      `[BookingForm] Using coordinates for calculation - Pickup: ${pickupCoords.latitude}, ${pickupCoords.longitude} | Dest: ${destinationCoords.latitude}, ${destinationCoords.longitude}`
    );
     if (!isValidCoordinate(pickupCoords.latitude) || !isValidCoordinate(pickupCoords.longitude) ||
         !isValidCoordinate(destinationCoords.latitude) || !isValidCoordinate(destinationCoords.longitude)) {
        const errorMsg = "Invalid or missing coordinates. Please ensure addresses resolve correctly or manually input coordinates if needed.";
        console.error("[BookingForm] Coordinate validation failed:", { pickupCoords, destinationCoords });
        setSubmissionError(errorMsg);
        toast({
          variant: "destructive",
          title: "Invalid Location Data",
          description: errorMsg,
        });
        setIsLoading(false);
        return; 
     }

    const aiInput: CalculatePriceInput = {
      pickupLatitude: pickupCoords.latitude, 
      pickupLongitude: pickupCoords.longitude,
      destinationLatitude: destinationCoords.latitude,
      destinationLongitude: destinationCoords.longitude,
      loadWeightKg: values.loadWeightKg, 
      // vehicleType could be passed to the AI if the pricing model supports it
    };

    try {
      console.log("[BookingForm] Calling calculatePrice with:", aiInput);
      const result = await calculatePrice(aiInput);
      console.log("[BookingForm] Received result:", result);

      setPriceResult(result);

       if (result.estimatedPrice <= 0 && result.breakdown.toLowerCase().includes('error')) {
           const isGenkitApiKeyError = result.breakdown.includes('Genkit API Key') || result.breakdown.toLowerCase().includes('google_genai_api_key');
           const isMapsApiKeyError = result.breakdown.includes('Google Maps API key') || result.breakdown.toLowerCase().includes('google_maps_api_key');
            
           let detailedError = result.breakdown;
           if (isGenkitApiKeyError) {
             detailedError = "AI configuration error: Invalid or missing GOOGLE_GENAI_API_KEY. Please contact support or check environment variables.";
           } else if (isMapsApiKeyError) {
             detailedError = "Map service error: Invalid or missing GOOGLE_MAPS_API_KEY, or Distance Matrix API not enabled. Please contact support or check environment variables.";
           }


           setSubmissionError(detailedError);
           toast({
               variant: "destructive",
               title: "Price Estimation Failed",
               description: detailedError,
           });
       } else if (result.breakdown.toLowerCase().includes('fallback rate')) {
            toast({
              title: "Price Estimated (Fallback Rate)",
              description: `AI unavailable, used fallback rate. Est: ₹${result.estimatedPrice.toLocaleString('en-IN')}`,
              variant: "default", 
            });
       } else if (result.estimatedPrice <= 0) {
           const unavailableMsg = "Price estimate is currently unavailable for the provided details. Please try modifying the input or try again later.";
           setSubmissionError(unavailableMsg);
           setPriceResult({...result, breakdown: unavailableMsg}); 
           toast({
               variant: "destructive",
               title: "Estimate Unavailable",
               description: unavailableMsg,
           });
       } else {
           toast({
             title: "AI Price Estimated Successfully",
             description: `Estimated cost: ₹${result.estimatedPrice.toLocaleString('en-IN')}`,
             variant: "default",
           });
       }
       // Placeholder for actual booking creation
       console.log("Form values for booking:", values);
       // Here you would typically call a service to save the booking to Firestore:
       // await createBookingService({...values, estimatedCost: result.estimatedPrice });
       // toast({ title: "Booking Request Submitted!", description: "Admin will review your request."});


    } catch (error: any) {
      console.error("[BookingForm] Error during calculatePrice call or booking submission:", error);
      let errorMessage = "An unexpected error occurred while processing your request.";

      if (error instanceof Error) {
         errorMessage = `Processing Error: ${error.message}. Please check your network and try again.`;
      }

      setSubmissionError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error Processing Request",
        description: errorMessage,
      });
       setPriceResult({
           estimatedPrice: 0,
           breakdown: `Error: ${errorMessage}`,
           currency: "INR"
       });
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    const pickupAddr = form.watch('pickupAddress').toLowerCase();
    const destAddr = form.watch('destinationAddress').toLowerCase();

    const getCoords = (addr: string) => {
        if (addr.includes('delhi')) return EXAMPLE_COORDINATES.delhi;
        if (addr.includes('mumbai')) return EXAMPLE_COORDINATES.mumbai;
        if (addr.includes('kolkata')) return EXAMPLE_COORDINATES.kolkata;
        if (addr.includes('chennai')) return EXAMPLE_COORDINATES.chennai;
        if (addr.includes('bengaluru') || addr.includes('bangalore')) return EXAMPLE_COORDINATES.bengaluru;
        return null; 
    }

    const pickupCoords = getCoords(pickupAddr);
    const destCoords = getCoords(destAddr);

    if (pickupCoords) {
        form.setValue('pickupLatitude', pickupCoords.lat, { shouldValidate: false });
        form.setValue('pickupLongitude', pickupCoords.lng, { shouldValidate: false });
    } else {
        // Clear if address doesn't match example, prompting manual entry or better geocoding
        form.setValue('pickupLatitude', undefined, { shouldValidate: false });
        form.setValue('pickupLongitude', undefined, { shouldValidate: false });
    }
    if (destCoords) {
        form.setValue('destinationLatitude', destCoords.lat, { shouldValidate: false });
        form.setValue('destinationLongitude', destCoords.lng, { shouldValidate: false });
    } else {
        form.setValue('destinationLatitude', undefined, { shouldValidate: false });
        form.setValue('destinationLongitude', undefined, { shouldValidate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('pickupAddress'), form.watch('destinationAddress')]); 

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Book Your Transport</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter shipment details for an AI-powered price estimate and to place a booking. Supports India locations.
          (Demo uses example coordinates for major cities).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Home className="mr-2 h-4 w-4 text-secondary" /> Pickup Address (India)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Delhi, Mumbai, or specific address" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-xs">
                      (Type major city name for demo coords, or full address for future geocoding)
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4 text-secondary" /> Destination Address (India)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mumbai, Kolkata, or specific address" {...field} />
                    </FormControl>
                    <FormMessage />
                     <FormDescription className="text-xs">
                      (Type major city name for demo coords, or full address for future geocoding)
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

             <FormField
              control={form.control}
              name="goodsType" // Changed from goodsDescription
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Package className="mr-2 h-4 w-4 text-secondary" /> Type of Goods</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electronics, Textiles, Perishables" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="loadWeightKg"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex items-center"><Truck className="mr-2 h-4 w-4 text-secondary" /> Load Weight (kg)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 1000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center"><Car className="mr-2 h-4 w-4 text-secondary" /> Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {VEHICLE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                {type}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                  control={form.control}
                  name="preferredDate" // Changed from pickupDate
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel className="flex items-center mb-1"><Calendar className="mr-2 h-4 w-4 text-secondary" /> Preferred Pickup Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <ShadCalendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0)) 
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pickupTime"
                  render={({ field }) => (
                    <FormItem className="pt-2">
                      <FormLabel className="flex items-center"><Clock className="mr-2 h-4 w-4 text-secondary" /> Preferred Pickup Time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

             {/* Hidden fields for coordinates, could be populated by a map/geocoding service in future */}
             <FormField control={form.control} name="pickupLatitude" render={({ field }) => <Input type="hidden" {...field} />} />
             <FormField control={form.control} name="pickupLongitude" render={({ field }) => <Input type="hidden" {...field} />} />
             <FormField control={form.control} name="destinationLatitude" render={({ field }) => <Input type="hidden" {...field} />} />
             <FormField control={form.control} name="destinationLongitude" render={({ field }) => <Input type="hidden" {...field} />} />

            {submissionError && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{submissionError}</AlertDescription>
                </Alert>
            )}
            
            {/* Button text needs to reflect booking action, not just price estimation */}
            <Button type="submit" className="w-full bg-accent hover:bg-primary transition-colors duration-200" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                 <Truck className="mr-2 h-4 w-4" /> Get Estimate & Book Transport
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      {priceResult && priceResult.estimatedPrice > 0 && (
        <CardFooter className="flex flex-col items-start space-y-4 mt-6 border-t pt-6">
           <h3 className="text-lg font-semibold text-primary">
               {priceResult.breakdown.toLowerCase().includes('fallback rate')
                   ? "Price Estimate (Fallback)"
                   : "AI Price Estimate Result"}
           </h3>
           <div className="w-full p-4 bg-secondary/10 rounded-lg border border-secondary/20 space-y-2">
              <p className="text-2xl font-bold text-accent">
                 ₹{priceResult.estimatedPrice.toLocaleString('en-IN')}
              </p>
              {(priceResult.distanceText || priceResult.durationText) && (
                 <div className="text-sm text-muted-foreground">
                    {priceResult.distanceText && <span>Distance: {priceResult.distanceText}</span>}
                    {priceResult.distanceText && priceResult.durationText && <span className="mx-2">|</span>}
                    {priceResult.durationText && <span>Est. Time: {priceResult.durationText}</span>}
                 </div>
              )}
              <Separator className="my-2 bg-secondary/30" />
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                <strong className="text-foreground">Details:</strong> {priceResult.breakdown}
              </p>
           </div>
           {/* Placeholder for Payment and Invoice actions */}
            <div className="w-full flex flex-col sm:flex-row gap-2 mt-4">
                <Button variant="default" className="flex-1" disabled> {/* TODO: Enable when payment integrated */}
                    <CreditCard className="mr-2 h-4 w-4" /> Proceed to Confirm Booking (Coming Soon)
                </Button>
                <Button variant="outline" className="flex-1" disabled> {/* TODO: Enable when invoice integrated */}
                    <FileText className="mr-2 h-4 w-4" /> Download Proforma Invoice (Coming Soon)
                </Button>
            </div>
            <p className="text-xs text-muted-foreground italic text-center w-full pt-2">
              {priceResult.breakdown.toLowerCase().includes('fallback rate')
                ? "Note: AI estimation was unavailable. This price is based on a standard fallback rate. Booking will be reviewed by admin."
                : "Note: This is an AI-generated estimate. Final booking and price will be confirmed by admin."}
            </p>
        </CardFooter>
      )}
      {priceResult && priceResult.estimatedPrice <= 0 && !submissionError && !priceResult.breakdown.toLowerCase().includes('fallback rate') && (
         <CardFooter className="flex flex-col items-start space-y-2 mt-6 border-t pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Estimate Unavailable</AlertTitle>
              <AlertDescription>
                {priceResult.breakdown.includes("Error:") ? priceResult.breakdown : "Price estimate is currently unavailable for the provided details. Please try modifying the input or try again later. You can still attempt to submit the booking for manual review."}
              </AlertDescription>
            </Alert>
         </CardFooter>
      )}
    </Card>
  );
}
