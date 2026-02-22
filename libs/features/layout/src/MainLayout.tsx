import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toaster } from '@ticketing/ui';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
