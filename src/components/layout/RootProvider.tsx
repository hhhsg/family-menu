'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      document.documentElement.classList.toggle('dark', mediaQuery.matches);
    };
    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  return <>{children}</>;
}

function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return null;
}

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ServiceWorkerRegister />
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          mobileOffset={16}
          toastOptions={{
            style: { borderRadius: '12px', fontSize: '14px' },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
