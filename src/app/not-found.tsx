// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Corrected path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-destructive/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md text-center shadow-2xl border-destructive/50">
        <CardHeader>
          <div className="mx-auto p-3 bg-destructive/10 rounded-full w-fit">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-4xl font-bold text-destructive">404</CardTitle>
          <CardDescription className="text-xl font-semibold text-foreground">Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Oops! The page you are looking for does not exist. It might have been moved, deleted, or you might have mistyped the URL.
          </p>
          <div className="relative w-full h-48 sm:h-64">
            <Image
              src="https://picsum.photos/seed/404page-robot/600/400" // Increased size for better quality
              alt="Confused Robot Illustration"
              layout="fill"
              objectFit="contain" // Use contain to ensure the whole image is visible
              className="rounded-lg"
              data-ai-hint="confused robot 404"
            />
          </div>
          <Link href="/" passHref legacyBehavior>
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              Go Back to Homepage
            </Button>
          </Link>
        </CardContent>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground">
        If you believe this is an error, please contact support or try searching our site.
      </p>
    </div>
  );
}
