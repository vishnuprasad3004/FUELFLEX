import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

interface AuthFormWrapperProps {
  title: string;
  description: string;
  children: ReactNode;
  footerLinkHref: string;
  footerLinkText: string;
  footerText: string;
}

export default function AuthFormWrapper({
  title,
  description,
  children,
  footerLinkHref,
  footerLinkText,
  footerText,
}: AuthFormWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="FuelFlex Logo" width={60} height={60} data-ai-hint="logo transport" />
          </Link>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footerText}{' '}
            <Link href={footerLinkHref} className="font-medium text-primary hover:underline">
              {footerLinkText}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
