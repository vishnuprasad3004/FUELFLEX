import { BookingForm } from "@/components/booking-form";
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-background to-secondary/10">
       <div className="text-center mb-8">
         <Image
            src="https://picsum.photos/seed/logo/150/50" // Placeholder logo
            alt="FuelFlex Transport Logo"
            width={150}
            height={50}
            className="mx-auto mb-4 rounded"
            data-ai-hint="modern logistics company logo"
          />
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">
          FuelFlex Transport
        </h1>
        <p className="text-lg text-muted-foreground">
          Your smart solution for goods transportation.
        </p>
      </div>
      <BookingForm />
    </main>
  );
}
