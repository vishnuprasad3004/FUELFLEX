// src/app/(aux)/privacy/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Link href="/" legacyBehavior>
        <Button variant="outline" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 prose dark:prose-invert max-w-none">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <p>FuelFlex (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;) operates the FuelFlex website and mobile application (the &quot;Service&quot;). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>

          <h2 className="text-xl font-semibold">1. Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
          <h3 className="text-lg font-medium">Types of Data Collected:</h3>
          <ul>
            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (&quot;Personal Data&quot;). This may include, but is not limited to: Email address, First name and last name, Phone number, Address, Cookies and Usage Data.</li>
            <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used (&quot;Usage Data&quot;). This Usage Data may include information such as your computer&apos;s Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
            <li><strong>Location Data:</strong> We may use and store information about your location if you give us permission to do so (&quot;Location Data&quot;). We use this data to provide features of our Service, to improve and customize our Service (e.g., for pickup/drop-off locations).</li>
          </ul>

          <h2 className="text-xl font-semibold">2. Use of Data</h2>
          <p>FuelFlex uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Data Storage and Security</h2>
          <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those from your jurisdiction. We use Firebase for backend services, including authentication, database (Firestore), and storage. Firebase has its own security measures in place. The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
          
          <h2 className="text-xl font-semibold">4. Service Providers</h2>
          <p>We may employ third-party companies and individuals to facilitate our Service (&quot;Service Providers&quot;), provide the Service on our behalf, perform Service-related services or assist us in analyzing how our Service is used. For example, we use Google Maps Platform services (e.g., Distance Matrix API) for location-based features. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>

          <h2 className="text-xl font-semibold">5. Your Data Protection Rights</h2>
          <p>You have certain data protection rights. FuelFlex aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. You can update your account information directly within your account settings section. If you are unable to change your Personal Data, please contact us to make the required changes.</p>

          <h2 className="text-xl font-semibold">6. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

          <h2 className="text-xl font-semibold">7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@fuelflex.example.com.</p>
        </CardContent>
      </Card>
    </div>
  );
}
