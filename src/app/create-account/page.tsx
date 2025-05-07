'use client';

import CreateAccountForm from '@/components/auth/create-account-form';
import AuthFormWrapper from '@/components/auth/auth-form-wrapper';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';

export default function CreateAccountPage() {
  // Redirect if already authenticated
  useAuthRedirect({ redirectIfAuthenticated: '/' });

  return (
    <AuthFormWrapper
      title="Create Your Account"
      description="Join FuelFlex to transport goods or offer transport services."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkHref="/login"
    >
      <CreateAccountForm />
    </AuthFormWrapper>
  );
}
