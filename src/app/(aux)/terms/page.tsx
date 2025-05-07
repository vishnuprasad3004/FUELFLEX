// src/app/(aux)/terms/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
          <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight">Terms of Service</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-1">Please read these terms carefully.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 prose dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground">Last Updated: {lastUpdatedDate}</p>
          
          <p>Welcome to FuelFlex Transport Platform! These terms and conditions (&quot;Terms&quot;) outline the rules and regulations for the use of FuelFlex&apos;s Website and related services (collectively, the &quot;Service&quot;), operated by FuelFlex (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">1. Acceptance of Terms</h2>
          <p>By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service. Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">2. Services Provided</h2>
          <p>FuelFlex provides an online platform that connects users seeking goods transport services (&quot;Buyers&quot; or &quot;Shippers&quot;) with independent transport providers (&quot;Transport Owners&quot; or &quot;Carriers&quot;). The platform also allows users (&quot;Sellers&quot;) to list goods for sale, which can then be booked for transport by Buyers. We may also offer related services such as fuel credit facilities, subject to separate agreements and eligibility criteria.</p>
          <p>FuelFlex acts as an intermediary platform and is not a transportation carrier or a seller of goods, unless explicitly stated. We are not responsible for the actual transport services or the goods themselves, beyond facilitating the connection and booking process.</p>
          
          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">3. User Accounts and Registration</h2>
          <p>To use certain features of the Service, you must register for an account. When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
          <p>You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you, without appropriate authorization. You may not use as a username any name that is offensive, vulgar, or obscene.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">4. Goods Listing, Transport Bookings, and Payments</h2>
          <h3 className="text-xl font-semibold mt-3">For Sellers:</h3>
          <p>Sellers are responsible for the accuracy, legality, and quality of their goods listings, including descriptions, images, pricing, and pickup location details. Sellers agree to fulfill orders for goods as described in their listings.</p>
          <h3 className="text-xl font-semibold mt-3">For Buyers/Shippers:</h3>
          <p>Buyers/Shippers are responsible for providing accurate information for transport bookings, including pickup and drop-off locations, goods details (type, weight, dimensions), and preferred dates. Price estimates provided by our AI model are for guidance only and may be subject to change based on final details and Transport Owner confirmation.</p>
          <h3 className="text-xl font-semibold mt-3">For Transport Owners:</h3>
          <p>Transport Owners are independent contractors responsible for providing transport services in a professional, timely, and safe manner, in compliance with all applicable laws and regulations. They are responsible for the condition of their vehicles and appropriate licensing and insurance.</p>
          <h3 className="text-xl font-semibold mt-3">Payments:</h3>
          <p>Payment for goods (if applicable) and transport services will be processed through integrated payment gateways (e.g., UPI, Stripe - planned feature). Users agree to pay all applicable fees and charges associated with their use of the Service. FuelFlex may charge service fees for facilitating transactions on the platform.</p>


          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">5. User Conduct and Prohibited Uses</h2>
          <p>You agree not to use the Service:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>For any unlawful purpose or in violation of any local, state, national, or international law.</li>
            <li>To solicit others to perform or participate in any unlawful acts.</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others.</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability.</li>
            <li>To submit false or misleading information.</li>
            <li>To upload or transmit viruses or any other type of malicious code.</li>
            <li>To collect or track the personal information of others.</li>
            <li>For any obscene or immoral purpose.</li>
            <li>To interfere with or circumvent the security features of the Service.</li>
          </ul>
          <p>We reserve the right to terminate your use of the Service for violating any of the prohibited uses.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">6. Intellectual Property</h2>
          <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of FuelFlex and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of FuelFlex.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">7. Disclaimers and Limitation of Liability</h2>
          <p>The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. FuelFlex makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          <p>In no event shall FuelFlex, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
          <p>We do not guarantee the accuracy, completeness, or usefulness of any information on the Service and neither adopt nor endorse nor are responsible for the accuracy or reliability of any opinion, advice, or statement made by parties other than us.</p>
          
          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">8. Indemnification</h2>
          <p>You agree to defend, indemnify and hold harmless FuelFlex and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney&apos;s fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password, or b) a breach of these Terms.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">9. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">10. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
          <p>By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.</p>

          <h2 className="text-2xl font-semibold pt-4 border-t mt-6">11. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>By email: <a href="mailto:legal@fuelflex.example.com" className="text-primary hover:underline">legal@fuelflex.example.com</a></li>
             <li>By visiting our contact page: <Link href="/contact" className="text-primary hover:underline">fuelflex.example.com/contact</Link></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
```