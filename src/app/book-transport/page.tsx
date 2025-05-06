
import { BookingForm } from "@/components/booking-form";
import { Separator } from "@/components/ui/separator";
import { FileText, ShieldCheck, Truck } from "lucide-react";

export default function BookTransportPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-start p-4 md:p-8 bg-gradient-to-br from-background to-secondary/10">
      <div className="w-full max-w-4xl space-y-8">
        {/* Optional: Add a header or some introductory text specific to this page */}
        <div className="text-center mb-8">
            <Truck className="mx-auto h-12 w-12 text-primary mb-3" />
            <h1 className="text-3xl font-bold text-primary">Plan Your Shipment</h1>
            <p className="text-muted-foreground">Fill in the details below to get an instant AI-powered price estimate and request your transport booking across India.</p>
        </div>
        
        <BookingForm />

        <Separator className="my-12" />

        <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-7 w-7 text-accent" />
                    <h3 className="text-xl font-semibold text-primary">Secure & Reliable</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                    We prioritize the safety of your goods. Our platform connects you with verified transport providers and offers features to ensure a secure transit. Track your shipment and get real-time updates.
                </p>
            </div>
             <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <FileText className="h-7 w-7 text-accent" />
                    <h3 className="text-xl font-semibold text-primary">Transparent Process</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                    Get detailed breakdowns of your transport costs. Our AI-powered estimation considers multiple factors for fair pricing. Access proforma invoices and manage your bookings with ease.
                </p>
            </div>
        </div>
      </div>
    </main>
  );
}
