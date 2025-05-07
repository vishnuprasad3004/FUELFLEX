// src/app/(aux)/privacy/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Link href="/" legacyBehavior>
        <Button variant="outline" className="mb-10 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Button>
      </Link>
      <Card className="shadow-xl border-primary/20">
        <CardHeader className="text-center border-b pb-6">
            <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold tracking-tight">Privacy Policy</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">Your privacy is important to us.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 prose dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground">Last Updated: {lastUpdatedDate}</p>
          
          <p>FuelFlex (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;) operates the FuelFlex website and mobile application (the &quot;Service&quot;). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
          <p>We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">1. Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
          
          <h3 className="text-xl font-semibold mt-4">Types of Data Collected:</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (&quot;Personal Data&quot;). This may include, but is not limited to:
              <ul className="list-circle space-y-1 pl-5 mt-1">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Phone number</li>
                <li>Physical address (for pickup/delivery)</li>
                <li>User profile information (role, preferences)</li>
                <li>Cookies and Usage Data</li>
              </ul>
            </li>
            <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used (&quot;Usage Data&quot;). This Usage Data may include information such as your computer&apos;s Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
            <li><strong>Location Data:</strong> We may use and store information about your location if you give us permission to do so (&quot;Location Data&quot;). We use this data to provide features of our Service, such as calculating distances, suggesting routes, and for pickup/drop-off coordination. You can enable or disable location services when you use our Service at any time through your device settings.</li>
          </ul>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">2. Use of Data</h2>
          <p>FuelFlex uses the collected data for various purposes:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer care and support</li>
            <li>To provide analysis or valuable information so that we can improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To facilitate bookings, payments, and communication between users</li>
            <li>To personalize your experience on the platform</li>
          </ul>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">3. Data Storage, Transfer, and Security</h2>
          <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those from your jurisdiction. We primarily use Firebase (a Google Cloud service) for backend services, including authentication, database (Firestore), and storage. Firebase has robust security measures in place to protect your data. For more information on Firebase's security practices, please visit their documentation.</p>
          <p>The security of your data is important to us. We strive to use commercially acceptable means to protect your Personal Data, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we aim for the highest standards, we cannot guarantee its absolute security.</p>
          
          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">4. Service Providers</h2>
          <p>We may employ third-party companies and individuals to facilitate our Service (&quot;Service Providers&quot;), to provide the Service on our behalf, to perform Service-related services (e.g., payment processing, mapping services, analytics) or to assist us in analyzing how our Service is used. For example:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Google Maps Platform:</strong> Used for location-based services like address geocoding and distance calculation (via Distance Matrix API).</li>
            <li><strong>Payment Processors (e.g., Stripe, UPI gateways - planned):</strong> To handle financial transactions securely.</li>
            <li><strong>Analytics Providers:</strong> To help us understand Service usage.</li>
          </ul>
          <p>These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose. We carefully vet our service providers to ensure they meet high data protection standards.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">5. Your Data Protection Rights</h2>
          <p>FuelFlex aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your PersonalData. Depending on your location and applicable laws, you may have the following rights:</p>
           <ul className="list-disc space-y-1 pl-5">
                <li>The right to access, update or delete the information we have on you.</li>
                <li>The right of rectification.</li>
                <li>The right to object.</li>
                <li>The right of restriction.</li>
                <li>The right to data portability.</li>
                <li>The right to withdraw consent.</li>
            </ul>
          <p>You can usually update your account information directly within your account settings section. If you are unable to perform these actions yourself or wish to exercise other rights, please contact us using the details provided below.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">6. Children's Privacy</h2>
          <p>Our Service does not address anyone under the age of 18 (&quot;Children&quot;). We do not knowingly collect personally identifiable information from children. If you are a parent or guardian and you are aware that your Child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">7. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date at the top of this Privacy Policy. We may also notify you via email or through a prominent notice on our Service, prior to the change becoming effective.</p>
          <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>By email: <a href="mailto:privacy@fuelflex.example.com" className="text-primary hover:underline">privacy@fuelflex.example.com</a></li>
            <li>By visiting this page on our website: <Link href="/contact" className="text-primary hover:underline">fuelflex.example.com/contact</Link></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
```