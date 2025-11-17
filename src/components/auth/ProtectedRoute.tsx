'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: UserRole | UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = '/auth/login',
  fallback
}) => {
  const { user, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  // Run redirects in effects to avoid updating Router during render
  React.useEffect(() => {
    if (loading) return; // wait until auth state is resolved

    if (requireAuth && !isAuthenticated) {
      setIsRedirecting(true);
      router.replace(redirectTo);
      return;
    }

    if (requireRole && user) {
      const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
      const isAdminEmail = (user.email || '').toLowerCase() === 'admin@ecobusinessbd.com';
      const effectiveRole = (isAdminEmail ? 'admin' : user.role) as UserRole;
      if (!allowedRoles.includes(effectiveRole)) {
        const roleRedirects: Record<UserRole, string> = {
          admin: '/admin/dashboard',
          employee: '/admin/dashboard',
          client: '/user/dashboard'
        };
        setIsRedirecting(true);
        router.replace(roleRedirects[effectiveRole] || '/');
      }
    }
  }, [requireAuth, isAuthenticated, redirectTo, requireRole, user, router, loading]);

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    );
  }

  if (isRedirecting) {
    return null;
  }

  return <>{children}</>;
};

// Specific role-based wrappers
export const RequireAuth: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <ProtectedRoute requireAuth={true} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const RequireAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <ProtectedRoute requireRole="admin" fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const RequireEmployee: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <ProtectedRoute requireRole={['admin', 'employee']} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const RequireClient: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <ProtectedRoute requireRole="client" fallback={fallback}>
    {children}
  </ProtectedRoute>
);

// Guest only route (redirect if authenticated)
export const GuestOnly: React.FC<{ children: React.ReactNode; redirectTo?: string }> = ({ 
  children, 
  redirectTo 
}) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      const isAdminEmail = (user.email || '').toLowerCase() === 'admin@ecobusinessbd.com';
      const effectiveRole = (isAdminEmail ? 'admin' : user.role) as UserRole;
      const roleRedirects: Record<UserRole, string> = {
        admin: '/admin/dashboard',
        employee: '/admin/dashboard',
        client: '/user/dashboard'
      };
      const destination = redirectTo || roleRedirects[effectiveRole] || '/';
      setIsRedirecting(true);
      router.replace(destination);
    }
  }, [user, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isRedirecting) {
    return null;
  }

  return <>{children}</>;
};