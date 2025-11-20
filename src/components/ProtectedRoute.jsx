'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUserData } from '@/lib/auth/tokenManager';
import Spinner from './Spinner';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const userData = getUserData();

      if (!token || !userData) {
        // Not authenticated - redirect to login
        router.push('/auth/login');
        return;
      }

      // Check role if required
      if (requiredRole && userData.role !== requiredRole) {
        // User doesn't have required role - redirect to unauthorized
        router.push('/auth/login');
        return;
      }

      // User is authorized
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

