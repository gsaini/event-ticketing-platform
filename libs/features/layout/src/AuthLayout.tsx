import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Toaster } from '@ticketing/ui';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">EventTix</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      <footer className="p-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} EventTix. All rights reserved.
      </footer>
      <Toaster />
    </div>
  );
}
