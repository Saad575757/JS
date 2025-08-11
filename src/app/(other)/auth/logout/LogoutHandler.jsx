// This page will clear localStorage and sign out, then redirect to /auth/login
'use client';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function LogoutHandler() {
  useEffect(() => {
    localStorage.clear();
    // signOut is optional, if using next-auth
    if (typeof signOut === 'function') {
      signOut({ redirect: false }).then(() => {
        window.location.href = '/auth/login';
      });
    } else {
      window.location.href = '/auth/login';
    }
  }, []);
  return null;
}
