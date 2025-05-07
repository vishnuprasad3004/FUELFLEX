// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Corrected path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, SearchX } from 'lucide-react'; // Added ArrowLeft
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-background via-secondary/20 to-background p-4 text-center">
      <Card className="w-full max-w-lg shadow-2xl border-destructive/30 overflow-hidden">
        <CardHeader className="bg-destructive/10 p-8">
          <div className="mx-auto p-4 bg-destructive/20 rounded-full w-fit ring-4 ring-destructive/30">
            <SearchX className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="mt-6 text-5xl font-extrabold text-destructive tracking-tight">404</CardTitle>
          <CardDescription className="text-2xl font-semibold text-foreground mt-2">Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Oops! It seems the page you&apos;re looking for isn&apos;t here.
            It might have been moved, deleted, or maybe the URL was mistyped.
          </p>
          <div className="relative w-full h-56 sm:h-72 rounded-lg overflow-hidden border bg-muted">
            <Image
              src="https://picsum.photos/seed/404-lost-truck/800/500" 
              alt="Illustration of a lost delivery truck or a map with a dead end"
              layout="fill"
              objectFit="cover" 
              className="opacity-75"
              data-ai-hint="lost truck map"
            />
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <p className="text-white text-2xl font-semibold drop-shadow-md">Lost your way?</p>
            </div>
          </div>
          <Link href="/" passHref legacyBehavior>
            <Button size="lg" className="w-full sm:w-auto text-lg py-3 bg-primary hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105">
              <ArrowLeft className="mr-2 h-5 w-5"/>
              Return to Homepage
            </Button>
          </Link>
        </CardContent>
      </Card>
      <p className="mt-10 text-md text-muted-foreground">
        If you think this is an error, please <Link href="/contact" className="text-primary hover:underline font-medium">contact support</Link> or try searching our site.
      </p>
    </div>
  );
}
