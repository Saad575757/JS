'use client';

import { currentYear } from '@/context/constants';
import { Suspense, useEffect } from 'react';
const OtherLayout = ({
  children
}) => {
  useEffect(() => {
    document.body.classList.add('authentication-bg', 'position-relative'), document.body.style.height = '100vh';
    return () => {
      document.body.classList.remove('authentication-bg', 'position-relative'), document.body.style.height = '100vh';
    };
  }, []);
  return <>
     <Suspense>{children}</Suspense> 

      <footer className="footer footer-alt fw-medium">
        <span className="text-dark-emphasis">{currentYear} © Xytek - Classroom by Xytek</span>
      </footer>
    </>;
};
export default OtherLayout;