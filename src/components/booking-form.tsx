
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MapPin, Package, Calendar, Clock, Truck, Building, Home, CircleDollarSign, Loader2, IndianRupee, AlertCircle } from "lucide-react"; // Added AlertCircle

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
import { calculatePrice, type CalculatePriceInput, type CalculatePriceOutput } from "@/ai/flows/ai-powered-pricing";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar as ShadCalendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// Define the form schema using Zod
const formSchema = z.object({
  pickupAddress: z.string().min(5, { message: "Pickup address must be at least 5 characters." }),
  destinationAddress: z.string().min(5, { message: "Destination address must be at least 5 characters." }),
  // Latitude/Longitude will be derived from addresses via geocoding in a real app
  // For demo purposes, we'll use example coordinates if geocoding isn't implemented.
  // These are kept in the schema but populated *before* calling the AI flow.
  pickupLatitude: z.number().min(-90).max(90).optional(),
  pickupLongitude: z.number().min(-180).max(180).optional(),
  destinationLatitude: z.number().min(-90).max(90).optional(),
  destinationLongitude: z.number().min(-180).max(180).optional(),
  goodsDescription: z.string().min(3, { message: "Please describe the goods." }),
  loadWeightKg: z.coerce.number().positive({ message: "Weight must be a positive number." }),
  pickupDate: z.date({ required_error: "Pickup date is required." }),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
});

type FormData = z.infer<typeof formSchema>;

// Example coordinates (replace with actual geocoding results)
const EXAMPLE_COORDINATES = {
    delhi: { lat: 28.6139, lng: 77.2090 },
    mumbai: { lat: 19.0760, lng: 72.8777 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    bengaluru: { lat: 12.9716, lng: 77.5946 },
};

// Helper function to validate coordinates
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
      pickupAddress: "Delhi", // Example default
      destinationAddress: "Mumbai", // Example default
      goodsDescription: "",
      loadWeightKg: undefined,
      pickupDate: new Date(), // Default to today
      pickupTime: "09:00",
      // Example coordinates pre-filled for demo - USER CAN OVERRIDE BY TYPING ADDRESS
      pickupLatitude: EXAMPLE_COORDINATES.delhi.lat,
      pickupLongitude: EXAMPLE_COORDINATES.delhi.lng,
      destinationLatitude: EXAMPLE_COORDINATES.mumbai.lat,
      destinationLongitude: EXAMPLE_COORDINATES.mumbai.lng,
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setPriceResult(null); // Clear previous results
    setSubmissionError(null); // Clear previous errors

    // --- Geocoding Step (Placeholder) ---
    // In a real application, use a geocoding service here based on addresses.
    // For demo, we use the (potentially pre-filled or default) lat/lng values.
    // If implementing geocoding, update these values *here* based on the service response.
    const pickupCoords = {
        latitude: values.pickupLatitude, // Use values from form (potentially defaults)
        longitude: values.pickupLongitude,
    };
    const destinationCoords = {
        latitude: values.destinationLatitude,
        longitude: values.destinationLongitude,
    };
    console.log(
      `[Demo] Using coordinates for calculation - Pickup: ${pickupCoords.latitude}, ${pickupCoords.longitude} | Dest: ${destinationCoords.latitude}, ${destinationCoords.longitude}`
    );
     // Basic validation *before* calling the AI flow
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
        return; // Stop submission
     }
    // --- End Geocoding Placeholder ---


    // Prepare input for the AI function
    const aiInput: CalculatePriceInput = {
      pickupLatitude: pickupCoords.latitude, // Already validated above
      pickupLongitude: pickupCoords.longitude,
      destinationLatitude: destinationCoords.latitude,
      destinationLongitude: destinationCoords.longitude,
      loadWeightKg: values.loadWeightKg, // Schema ensures this is positive number
    };

    try {
      console.log("[BookingForm] Calling calculatePrice with:", aiInput);
      const result = await calculatePrice(aiInput);
      console.log("[BookingForm] Received result:", result);

      setPriceResult(result);

      // Check if the AI returned an error state (estimatedPrice 0 and breakdown contains "Error")
       if (result.estimatedPrice === 0 && result.breakdown.toLowerCase().includes('error')) {
           setSubmissionError(result.breakdown); // Display the error from AI
           toast({
               variant: "destructive",
               title: "Price Estimation Failed",
               description: result.breakdown,
           });
       } else {
           toast({
             title: "Price Estimated Successfully",
             description: `Estimated cost: ₹${result.estimatedPrice.toLocaleString('en-IN')}`,
             variant: "default",
           });
       }

    } catch (error: any) {
      console.error("[BookingForm] Error during calculatePrice call:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setSubmissionError(`Failed to estimate price: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Error Estimating Price",
        description: `An unexpected error occurred. Please try again later. Details: ${errorMessage}`,
      });
       // Set a generic error state in priceResult for display
       setPriceResult({
           estimatedPrice: 0,
           breakdown: `Error: Failed to get estimate. ${errorMessage}`,
           currency: "INR"
       });
    } finally {
      setIsLoading(false);
    }
  }

  // Update Lat/Lng when address changes (simple example, replace with actual geocoding)
  React.useEffect(() => {
    const pickupAddr = form.watch('pickupAddress').toLowerCase();
    const destAddr = form.watch('destinationAddress').toLowerCase();

    // Very basic string matching for demo - REPLACE WITH GEOCODING API
    const getCoords = (addr: string) => {
        if (addr.includes('delhi')) return EXAMPLE_COORDINATES.delhi;
        if (addr.includes('mumbai')) return EXAMPLE_COORDINATES.mumbai;
        if (addr.includes('kolkata')) return EXAMPLE_COORDINATES.kolkata;
        if (addr.includes('chennai')) return EXAMPLE_COORDINATES.chennai;
        if (addr.includes('bengaluru') || addr.includes('bangalore')) return EXAMPLE_COORDINATES.bengaluru;
        return null; // Or keep previous/default if no match
    }

    const pickupCoords = getCoords(pickupAddr);
    const destCoords = getCoords(destAddr);

    if (pickupCoords) {
        form.setValue('pickupLatitude', pickupCoords.lat, { shouldValidate: false });
        form.setValue('pickupLongitude', pickupCoords.lng, { shouldValidate: false });
    }
    if (destCoords) {
        form.setValue('destinationLatitude', destCoords.lat, { shouldValidate: false });
        form.setValue('destinationLongitude', destCoords.lng, { shouldValidate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('pickupAddress'), form.watch('destinationAddress')]); // Re-run when addresses change

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Book Your Transport</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter your shipment details for an AI-powered price estimate (Supports India locations). Use major city names (Delhi, Mumbai, Kolkata, Chennai, Bengaluru) for demo coordinates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Address Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Home className="mr-2 h-4 w-4 text-secondary" /> Pickup Address (India)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Delhi" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-xs">
                      (Type major city name like Delhi, Mumbai for demo coordinates)
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
                      <Input placeholder="e.g., Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-xs">
                      (Type major city name like Mumbai, Kolkata for demo coordinates)
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

             {/* Goods Description */}
             <FormField
              control={form.control}
              name="goodsDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Package className="mr-2 h-4 w-4 text-secondary" /> Goods Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electronics shipment, textiles" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight, Date, Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  name="pickupDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel className="flex items-center mb-1"><Calendar className="mr-2 h-4 w-4 text-secondary" /> Pickup Date</FormLabel>
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
                              date < new Date(new Date().setHours(0, 0, 0, 0)) // Disable past dates
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
                    <FormItem>
                      <FormLabel className="flex items-center"><Clock className="mr-2 h-4 w-4 text-secondary" /> Pickup Time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            {/* Hidden Lat/Lng Fields - Populated by useEffect or defaults */}
             <FormField control={form.control} name="pickupLatitude" render={({ field }) => <Input type="hidden" {...field} />} />
             <FormField control={form.control} name="pickupLongitude" render={({ field }) => <Input type="hidden" {...field} />} />
             <FormField control={form.control} name="destinationLatitude" render={({ field }) => <Input type="hidden" {...field} />} />
             <FormField control={form.control} name="destinationLongitude" render={({ field }) => <Input type="hidden" {...field} />} />

            {/* Display Submission Error */}
            {submissionError && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{submissionError}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" className="w-full bg-accent hover:bg-primary transition-colors duration-200" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Estimating Price...
                </>
              ) : (
                <>
                 <IndianRupee className="mr-2 h-4 w-4" /> Get Price Estimate (INR)
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      {/* Price Result Display */}
      {priceResult && !submissionError && ( // Only show result if there wasn't a submission error
        <CardFooter className="flex flex-col items-start space-y-4 mt-6 border-t pt-6">
           <h3 className="text-lg font-semibold text-primary">Price Estimate Result</h3>
           <div className="w-full p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <p className={`text-2xl font-bold mb-2 ${priceResult.estimatedPrice <= 0 ? 'text-destructive' : 'text-accent'}`}>
                 {priceResult.estimatedPrice > 0
                    ? `₹${priceResult.estimatedPrice.toLocaleString('en-IN')}`
                    : "Estimate Unavailable"}
              </p>
              <Separator className="my-2 bg-secondary/30" />
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                <strong className="text-foreground">Details:</strong> {priceResult.breakdown}
              </p>
           </div>
            <p className="text-xs text-muted-foreground italic text-center w-full">
              Note: This is an estimate for transport within India based on provided details and standard assumptions. Real-world factors may influence the final price.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}
