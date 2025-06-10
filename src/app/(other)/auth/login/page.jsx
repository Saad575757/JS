// import { Card, Col, Container, Row } from 'react-bootstrap';
// import Image from 'next/image';
// import Link from 'next/link';
// import AuthLogo from '@/components/AuthLogo';
// import LoginForm from './components/LoginForm';
// import authImg from '@/assets/images/auth-img.jpg';
// export const metadata = {
//   title: 'Login'
// };
// const Login = () => {
//   return <div className="account-pages p-sm-5  position-relative">
//       <Container>
//         <Row className="justify-content-center">
//           <Col xxl={9} lg={11}>
//             <Card className="overflow-hidden">
//               <Row className="g-0">
//                 <Col lg={6}>
//                   <div className="d-flex flex-column h-100">
//                     <AuthLogo />
//                     <div className="p-4 my-auto text-center">
//                       <h4 className="fs-20">Sign In</h4>
//                       <p className="text-muted mb-4">
//                         Enter your email address and password to <br /> access account.
//                       </p>
//                       <LoginForm />
//                     </div>
//                   </div>
//                 </Col>
//                 <Col lg={6} className="d-none d-lg-block">
//                   <Image src={authImg} alt="image" className="img-fluid rounded h-100" />
//                 </Col>
//               </Row>
//             </Card>
//           </Col>
//         </Row>
//         <Row>
//           <Col xs={12} className="text-center">
//             <p className="text-dark-emphasis">
//               Don&apos;t have an account?
//               <Link href="/auth/register" className="text-dark fw-bold ms-1 link-offset-3 text-decoration-underline">
//                 <b>Sign up</b>
//               </Link>
//             </p>
//           </Col>
//         </Row>
//       </Container>
//     </div>;
// };
// export default Login;

'use client';

import { Card, Col, Container, Row, Form, Alert } from 'react-bootstrap';
import Image from 'next/image';
import AuthLogo from '@/components/AuthLogo';
import authImg from '@/assets/images/ai-classroom.webp';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

const Login = () => {
  const [userRole, setUserRole] = useState('student');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check for successful authentication on component mount
  useEffect(() => {
    console.log('[Login] Component mounted - checking for auth data in URL');
    const urlParams = new URLSearchParams(window.location.search);
    const authData = urlParams.get('authData');
    
    if (authData) {
      console.log('[Login] Found authData in URL:', authData);
      try {
        const userData = JSON.parse(decodeURIComponent(authData));
        console.log('[Login] Parsed user data:', userData);
        saveUserData(userData);
        console.log('[Login] Redirecting to dashboard...');
      } catch (err) {
        console.error('[Login] Error parsing auth data:', err);
        setError('Failed to process authentication data');
      }
    } else {
      console.log('[Login] No authData found in URL');
    }

    // Check existing localStorage data
    const existingData = localStorage.getItem('userData');
    if (existingData) {
      console.log('[Login] Found existing user data in localStorage:', JSON.parse(existingData));
    } else {
      console.log('[Login] No user data found in localStorage');
    }
  }, [router]);

  const saveUserData = (data) => {
    console.log('[saveUserData] Saving user data:', data);
    try {
      const userData = {
        role: userRole,
        ...data, // This should include name, email, picture, etc.
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('[saveUserData] Successfully saved to localStorage:', userData);
    } catch (error) {
      console.error('[saveUserData] Error saving user data:', error);
    }
  };

  const initiateGoogleLogin = async () => {
    console.log('[initiateGoogleLogin] Starting Google login for role:', userRole);
    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google?role=${encodeURIComponent(userRole)}`;
      console.log("process.env.NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log('[initiateGoogleLogin] Calling API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        redirect: 'manual',
      });

      console.log('[initiateGoogleLogin] API response status:', response.status);

      if (response.status === 302 || response.status === 301) {
        const redirectUrl = response.headers.get('Location');
        console.log('[initiateGoogleLogin] Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
        return;
      }

      const data = await response.json();
      console.log('[initiateGoogleLogin] API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Google login');
      }
      
      console.log('[initiateGoogleLogin] Redirecting to Google OAuth:', data.url);
      window.location.href = data.url;
    } catch (err) {
      console.error('[initiateGoogleLogin] Error:', err);
      setError(err.message || 'An unknown error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="account-pages p-sm-5 position-relative">
      <Container>
        <Row className="justify-content-center">
          <Col xxl={9} lg={11}>
            <Card className="overflow-hidden">
              <Row className="g-0">
                <Col lg={6}>
                  <div className="d-flex flex-column h-100">
                    <AuthLogo />
                    <div className="p-4 text-center" style={{ marginTop: '1rem' }}>
                      <h4 className="fs-20">Sign In</h4>
                      <p className="text-muted mb-4">
                        Continue with your Google account to access Our Classroom Assistant.
                      </p>

                      {error && <Alert variant="danger">{error}</Alert>}

                      <Form.Group className="mb-4">
                        <Form.Label>I am a:</Form.Label>
                        <div className="d-flex justify-content-center gap-3">
                          <Form.Check
                            type="radio"
                            id="student-role"
                            label="Student"
                            name="userRole"
                            checked={userRole === 'student'}
                            onChange={() => {
                              console.log('[Role Change] Selected student role');
                              setUserRole('student');
                            }}
                          />
                          <Form.Check
                            type="radio"
                            id="teacher-role"
                            label="Teacher"
                            name="userRole"
                            checked={userRole === 'teacher'}
                            onChange={() => {
                              console.log('[Role Change] Selected teacher role');
                              setUserRole('teacher');
                            }}
                          />
                        </div>
                      </Form.Group>

                      <button
                        onClick={initiateGoogleLogin}
                        disabled={loading}
                        className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 w-100"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Loading...
                          </>
                        ) : (
                          <>
                            <i className="fab fa-google"></i>
                            Sign in as {userRole}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Col>

                <Col lg={6} className="d-none d-lg-block">
                  <Image 
                    src={authImg} 
                    alt="Auth Image" 
                    className="img-fluid rounded h-100" 
                    priority
                    style={{ objectFit: 'cover' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;