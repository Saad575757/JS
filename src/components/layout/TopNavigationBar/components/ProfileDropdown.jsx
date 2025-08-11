// components/ProfileDropdown.jsx
'use client';

import Image from 'next/image';
import { Dropdown, DropdownHeader, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import avatar1 from '@/assets/images/users/avatar-10.jpg';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

const ProfileDropdown = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    picture: '',
    token: '',
  });

  useEffect(() => {
    // Get user data from localStorage and fallback to URL-extracted values
    const storedData = localStorage.getItem('userData');
    const nameFromStorage = localStorage.getItem('name');
    const pictureFromStorage = localStorage.getItem('picture');
    const emailFromStorage = localStorage.getItem('email');
    const tokenFromStorage = localStorage.getItem('token');
    let name = '';
    let email = '';
    let picture = '';
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        name = parsedData.name || nameFromStorage || 'User';
        email = parsedData.email || emailFromStorage || '';
        picture = parsedData.picture || pictureFromStorage || '';
      } catch (error) {
        name = nameFromStorage || 'User';
        email = emailFromStorage || '';
        picture = pictureFromStorage || '';
        console.error('Error parsing user data:', error);
      }
    } else {
      name = nameFromStorage || 'User';
      email = emailFromStorage || '';
      picture = pictureFromStorage || '';
    }
    setUserData({
      name,
      email,
      picture,
      token: tokenFromStorage || '',
    });
    // Log for debug
    console.log('ProfileDropdown userData:', { name, email, picture, token: tokenFromStorage });
  }, []);

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Sign out and redirect to /auth/login
    signOut({ redirect: false }).then(() => {
      window.location.href = '/auth/login';
    });
  };

  return (
    <Dropdown>
      <DropdownToggle as="a" className="nav-link arrow-none nav-user" role="button" aria-haspopup="false" aria-expanded="false">
        <span className="account-user-avatar">
          {userData.picture ? (
            <Image 
              src={userData.picture} 
              alt="user-image" 
              width={32} 
              height={32}
              className="rounded-circle"
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                e.target.src = avatar1.src;
                e.target.onerror = null; // Prevent infinite loop if fallback also fails
              }}
            />
          ) : (
            <Image src={avatar1} alt="user-image" width={32} height={32} className="rounded-circle" />
          )}
        </span>
        <span className="d-lg-block d-none">
          <h5 className="my-0 fw-normal">
            {userData.name}
            <IconifyIcon icon="ri:arrow-down-s-line" className="fs-22 d-none d-sm-inline-block align-middle" />
          </h5>
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end dropdown-menu-animated profile-dropdown">
        <DropdownHeader className="noti-title">
          <h6 className="text-overflow m-0">Welcome {userData.name}!</h6>
          {userData.email && <small className="text-muted">{userData.email}</small>}
        </DropdownHeader>
        <Link href="/pages/profile" className="dropdown-item">
          <IconifyIcon icon="ri:account-pin-circle-line" className="fs-16 align-middle me-1" />
          <span>My Account</span>
        </Link>
        <Link href="/pages/profile" className="dropdown-item">
          <IconifyIcon icon="ri:settings-4-line" className="fs-16 align-middle me-1" />
          <span>Settings</span>
        </Link>
        <Link href="/pages/faq" className="dropdown-item">
          <IconifyIcon icon="ri:customer-service-2-line" className="fs-16 align-middle me-1" />
          <span>Support</span>
        </Link>
        <Link href="/auth/lock-screen" className="dropdown-item">
          <IconifyIcon icon="ri:lock-line" className="fs-16 align-middle me-1" />
          <span>Lock Screen</span>
        </Link>
        <Link href="/auth/logout" onClick={handleLogout} className="dropdown-item">
          <IconifyIcon icon="ri:logout-circle-r-line" className="align-middle me-1" />
          <span>Logout</span>
        </Link>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;