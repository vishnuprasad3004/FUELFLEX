import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';
import Navbar from '@/components/layout/navbar'; // Assuming Navbar component exists or will be created
import { Toaster } from "@/components/ui/toaster"; // For Shadcn Toasts

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FuelFlex Transport Platform',
  description: 'Smart goods transport and fuel credit platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="pt-16"> {/* Add padding-top to avoid content overlap with fixed navbar */}
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
