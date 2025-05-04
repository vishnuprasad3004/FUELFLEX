import { BookingForm } from "@/components/booking-form";
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-background to-secondary/10">
       {/* Removed the centered header block, title now handled in BookingForm */}
      <BookingForm />
    </main>
  );
}
