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
import { useState } from 'react';

export const dynamic = 'force-dynamic';

const Login = () => {
  const [userRole, setUserRole] = useState('student');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const initiateGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call your API endpoint with GET method and role as query parameter
      const response = await fetch(`https://class-assistant-orpin.vercel.app/api/auth/google?role=${userRole}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Google login');
      }

      // Redirect to the Google OAuth URL
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
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
                            onChange={() => setUserRole('student')}
                          />
                          <Form.Check
                            type="radio"
                            id="teacher-role"
                            label="Teacher"
                            name="userRole"
                            checked={userRole === 'teacher'}
                            onChange={() => setUserRole('teacher')}
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
                            Continue with Google as {userRole}
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