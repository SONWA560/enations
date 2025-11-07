"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface UseProtectedRouteOptions {
  requiredRole?: 'admin' | 'representative';
  redirectTo?: string;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { requiredRole, redirectTo = '/login' } = options;

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Check role requirement
    if (requiredRole && userData?.role !== requiredRole) {
      // Redirect based on actual role
      if (userData?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (userData?.role === 'representative') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, userData, loading, requiredRole, redirectTo, router]);

  return { user, userData, loading, isAuthorized: !loading && !!user };
}

export function useAdminRoute() {
  return useProtectedRoute({ requiredRole: 'admin' });
}

export function useRepresentativeRoute() {
  return useProtectedRoute({ requiredRole: 'representative' });
}
