// src/app/(aux)/terms/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Link href="/" legacyBehavior>
        <Button variant="outline" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 prose dark:prose-invert max-w-none">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <p>Welcome to FuelFlex Transport Platform! These terms and conditions outline the rules and regulations for the use of FuelFlex&apos;s Website and Services.</p>

          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>By accessing this website and/or using our services, we assume you accept these terms and conditions. Do not continue to use FuelFlex if you do not agree to take all of the terms and conditions stated on this page.</p>

          <h2 className="text-xl font-semibold">2. Services Provided</h2>
          <p>FuelFlex provides a platform for connecting users seeking goods transport services with transport providers. We also facilitate a marketplace for buying and selling goods, and may offer fuel credit services subject to separate agreements.</p>
          
          <h2 className="text-xl font-semibold">3. User Accounts</h2>
          <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>

          <h2 className="text-xl font-semibold">4. Goods Listing and Transport Bookings</h2>
          <p>Sellers are responsible for the accuracy of their goods listings. Buyers are responsible for providing accurate information for transport bookings. FuelFlex is not directly involved in the transaction between buyers and sellers, nor in the physical transport of goods, unless explicitly stated.</p>

          <h2 className="text-xl font-semibold">5. Prohibited Uses</h2>
          <p>You may not use our platform for any illegal or unauthorized purpose. You agree to comply with all local laws regarding online conduct and acceptable content.</p>

          <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of FuelFlex and its licensors.</p>

          <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
          <p>In no event shall FuelFlex, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          
          <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.</p>

          <h2 className="text-xl font-semibold">9. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at support@fuelflex.example.com.</p>
        </CardContent>
      </Card>
    </div>
  );
}
