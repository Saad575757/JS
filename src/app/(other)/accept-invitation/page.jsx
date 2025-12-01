'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Card, CardBody, Spinner, Alert, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getToken } from '@/lib/auth/tokenManager';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
      setLoading(false);
      return;
    }

    checkAuthAndAccept();
  }, [token]);

  const checkAuthAndAccept = async () => {
    // Check if user is authenticated
    const authToken = getToken();
    
    if (!authToken) {
      // User is not authenticated, store the invitation token and redirect to signup
      setNeedsAuth(true);
      setLoading(false);
      
      // Store the invitation token in localStorage for later use
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingInvitationToken', token);
      }
      return;
    }

    // User is authenticated, proceed with invitation acceptance
    await acceptInvitation(authToken);
  };

  const acceptInvitation = async (authToken) => {
    try {
      setLoading(true);
      setError(null);

      // Call your API to accept the invitation
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If still 401, authentication failed
        if (response.status === 401) {
          setNeedsAuth(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('pendingInvitationToken', token);
          }
          return;
        }
        throw new Error(data.message || 'Failed to accept invitation');
      }

      // Clear the pending invitation token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingInvitationToken');
      }

      setSuccess(true);
      
      // Redirect to the appropriate page after 2 seconds
      setTimeout(() => {
        if (data.redirectTo) {
          router.push(data.redirectTo);
        } else if (data.classId) {
          router.push(`/apps/classes/${data.classId}`);
        } else {
          router.push('/apps/classes');
        }
      }, 2000);

    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    // Redirect to registration page with return URL
    const returnUrl = encodeURIComponent(`/accept-invitation?token=${token}`);
    router.push(`/auth/register?returnUrl=${returnUrl}&role=student`);
  };

  const handleLogin = () => {
    // Redirect to login page with return URL
    const returnUrl = encodeURIComponent(`/accept-invitation?token=${token}`);
    router.push(`/auth/login?returnUrl=${returnUrl}`);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container>
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <Card className="shadow-lg border-0">
              <CardBody className="p-4 text-center">
                {loading && (
                  <>
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <h4>Accepting Invitation...</h4>
                    <p className="text-muted">Please wait while we process your invitation.</p>
                  </>
                )}

                {!loading && needsAuth && (
                  <>
                    <div className="mb-4">
                      <IconifyIcon 
                        icon="ri:user-add-line" 
                        style={{ fontSize: '4rem', color: '#0d6efd' }}
                      />
                    </div>
                    <h4 className="text-primary mb-3">Welcome to the Class!</h4>
                    <p className="text-muted mb-4">
                      To join this class, you need to create a student account first.
                    </p>
                    
                    <Alert variant="info" className="text-start mb-4">
                      <IconifyIcon icon="ri:information-line" className="me-2" />
                      <small>
                        <strong>New to the platform?</strong> Create a free student account to get started.
                        Already have an account? Simply log in to join.
                      </small>
                    </Alert>

                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        size="lg"
                        onClick={handleCreateAccount}
                      >
                        <IconifyIcon icon="ri:user-add-line" className="me-2" />
                        Create Student Account
                      </Button>
                      
                      <Button 
                        variant="outline-primary"
                        onClick={handleLogin}
                      >
                        <IconifyIcon icon="ri:login-box-line" className="me-2" />
                        Already have an account? Login
                      </Button>
                    </div>

                    <div className="mt-4 pt-3 border-top">
                      <small className="text-muted">
                        <IconifyIcon icon="ri:shield-check-line" className="me-1" />
                        Your invitation will be automatically applied after you sign up or log in
                      </small>
                    </div>
                  </>
                )}

                {!loading && !needsAuth && error && (
                  <>
                    <div className="mb-3">
                      <IconifyIcon 
                        icon="ri:error-warning-line" 
                        style={{ fontSize: '4rem', color: '#dc3545' }}
                      />
                    </div>
                    <h4 className="text-danger">Invitation Failed</h4>
                    <Alert variant="danger" className="mt-3 text-start">
                      {error}
                    </Alert>
                    <div className="d-grid gap-2 mt-3">
                      <Button 
                        variant="primary"
                        onClick={handleCreateAccount}
                      >
                        <IconifyIcon icon="ri:user-add-line" className="me-2" />
                        Create Account
                      </Button>
                      <Button 
                        variant="outline-secondary"
                        onClick={() => router.push('/apps/classes')}
                      >
                        Go to Classes
                      </Button>
                    </div>
                  </>
                )}

                {!loading && !needsAuth && success && (
                  <>
                    <div className="mb-3">
                      <IconifyIcon 
                        icon="ri:checkbox-circle-line" 
                        style={{ fontSize: '4rem', color: '#28a745' }}
                      />
                    </div>
                    <h4 className="text-success">Invitation Accepted!</h4>
                    <p className="text-muted mt-3">
                      You have successfully joined the class. Redirecting you now...
                    </p>
                    <Spinner animation="border" size="sm" variant="success" className="mt-2" />
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

