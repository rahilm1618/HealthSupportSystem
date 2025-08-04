import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
