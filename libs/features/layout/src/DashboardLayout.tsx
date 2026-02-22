import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Home, Plus, BarChart3, Users, Settings, Activity } from 'lucide-react';
import { cn, Button, Separator, Toaster } from '@ticketing/ui';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'organizer' | 'admin';
}

const organizerNav = [
  { name: 'Dashboard', href: '/organizer', icon: Home },
  { name: 'Create Event', href: '/organizer/events/create', icon: Plus },
  { name: 'Revenue', href: '/organizer/revenue', icon: BarChart3 },
];

const adminNav = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'System Health', href: '/admin/system', icon: Activity },
];

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const location = useLocation();
  const navItems = role === 'organizer' ? organizerNav : adminNav;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 lg:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <div className="flex items-center gap-2 px-2 py-4">
              <Settings className="h-5 w-5 text-primary" />
              <span className="font-semibold">
                {role === 'organizer' ? 'Organizer' : 'Admin'} Panel
              </span>
            </div>
            <Separator />
            <nav className="flex-1 space-y-1 py-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn('w-full justify-start', isActive && 'bg-secondary')}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
