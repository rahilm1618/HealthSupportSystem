import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2F1c2FsLWJhYm9vbi0xNi5jbGVyay5hY2NvdW50cy5kZXYk';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ClerkProvider>
  </React.StrictMode>
);
