import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
