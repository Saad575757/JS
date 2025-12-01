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

      <footer 
        className="footer footer-alt" 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '8px 0',
          textAlign: 'center',
          fontSize: '0.75rem',
          opacity: 0.6,
          zIndex: 1
        }}
      >
        <span className="text-muted">{currentYear} © Xytek - Classroom by Xytek</span>
      </footer>
    </>;
};
export default OtherLayout;