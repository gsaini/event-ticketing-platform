import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@ticketing/ui';
import { useAuthStore, useCurrentUser } from '@ticketing/data-access';
import type { UserRole } from '@ticketing/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading: storeLoading } = useAuthStore();
  const { data: user, isLoading: queryLoading, isError } = useCurrentUser();

  const isLoading = storeLoading || queryLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || isError) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="mt-2 text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
