// src/app/(aux)/contact/page.tsx
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, Loader2, Mail, Phone, MapPin, Building, MessageSquareQuestion } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/components/ui/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").max(100, "Email is too long"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(150, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message is too long (max 1000 characters)"),
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    setLoading(true);
    // Simulate API call (replace with actual logic, e.g., send to backend or email service)
    console.log("Contact form submission data:", data);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    // For demonstration, assume success:
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you as soon as possible.",
      variant: "default", // Or 'success' if you have such a variant
    });
    reset(); // Clear form fields
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <Link href="/" legacyBehavior>
        <Button variant="outline" className="mb-10 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Button>
      </Link>
      
      <div className="text-center mb-12">
        <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-lg text-muted-foreground mt-2">We're here to help. Reach out with any questions or feedback.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Contact Form Section (takes 2 columns on lg) */}
        <Card className="shadow-xl lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Send Us a Message</CardTitle>
            <CardDescription>Fill out the form and we'll respond shortly.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register('name')} placeholder="John Doe" aria-invalid={!!errors.name} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="you@example.com" aria-invalid={!!errors.email} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...register('subject')} placeholder="Regarding my booking..." aria-invalid={!!errors.subject} />
                {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <Label htmlFor="message">Your Message</Label>
                <Textarea id="message" {...register('message')} placeholder="Please describe your query in detail..." rows={6} aria-invalid={!!errors.message} />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full py-3 text-base" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information Section (takes 1 column on lg) */}
        <div className="space-y-8">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Our Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start">
                <Mail className="h-7 w-7 text-primary mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg">Email Us</h3>
                  <a href="mailto:support@fuelflex.example.com" className="text-muted-foreground hover:text-primary transition-colors">support@fuelflex.example.com</a>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-7 w-7 text-primary mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg">Call Us</h3>
                  <p className="text-muted-foreground">+91-123-456-7890</p>
                  <p className="text-xs text-muted-foreground">(Mon-Fri, 9 AM - 6 PM IST)</p>
                </div>
              </div>
              <div className="flex items-start">
                <Building className="h-7 w-7 text-primary mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg">Our Office</h3>
                  <p className="text-muted-foreground">FuelFlex HQ, 123 Innovation Drive, Tech Park, Bangalore, India - 560100</p>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <MessageSquareQuestion className="mr-3 h-6 w-6 text-primary"/>
                Quick Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-3">
                    Many common questions are answered on our FAQ page.
                </p>
                <Link href="/faq" passHref legacyBehavior>
                    <Button variant="outline" className="w-full">
                        Visit FAQ Page
                    </Button>
                </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```