import type { ReactNode } from 'react';
import { useCurrentUser } from '@ticketing/data-access';
import type { UserRole } from '@ticketing/types';

interface RoleGuardProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { data: user } = useCurrentUser();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
