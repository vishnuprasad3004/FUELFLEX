import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button'; // Import Button
import { Home, LogIn, UserPlus, LayoutDashboard } from 'lucide-react'; // Import icons

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'FuelFlex Transport',
  description: 'Smart Goods Transport Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              {/* Placeholder/Simple Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                <path d="M19 17h2l-3.3-3.3"/><path d="M5 7H3l3.3 3.3"/><path d="M12 12l1.7 1.7"/><path d="m21 21-1.7-1.7"/><path d="m3 3 1.7 1.7"/><path d="m7 21 3.3-3.3"/><path d="M17 3l-3.3 3.3"/><path d="M12 12l-1.7-1.7"/><path d="m3 21 18-18"/><path d="M7 3l3.3 3.3"/>
              </svg>
              <span className="font-bold text-primary hidden sm:inline-block">FuelFlex</span>
            </Link>
            <nav className="flex items-center space-x-4 lg:space-x-6 ml-auto">
              <Link href="/" passHref>
                <Button variant="ghost" className="text-sm font-medium">
                  <Home className="mr-1 h-4 w-4" /> Home
                </Button>
              </Link>
              <Link href="/login" passHref>
                <Button variant="ghost" className="text-sm font-medium">
                  <LogIn className="mr-1 h-4 w-4" /> Login
                </Button>
              </Link>
               <Link href="/signup" passHref>
                <Button variant="ghost" className="text-sm font-medium">
                   <UserPlus className="mr-1 h-4 w-4" /> Sign Up
                 </Button>
              </Link>
              {/* TODO: Protect this route with authentication */}
              <Link href="/owner/dashboard" passHref>
                <Button variant="ghost" className="text-sm font-medium">
                  <LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard
                </Button>
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-grow">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
