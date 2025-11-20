'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthData } from '@/lib/auth/tokenManager';
import Spinner from '@/components/Spinner';

const LogoutHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = () => {
      // Clear all authentication data
      clearAuthData();
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/auth/login');
      }, 500);
    };

    handleLogout();
  }, [router]);

  return (
    <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '100vh' }}>
      <Spinner />
      <p className="mt-3 text-muted">Logging out...</p>
    </div>
  );
};

export default LogoutHandler;

