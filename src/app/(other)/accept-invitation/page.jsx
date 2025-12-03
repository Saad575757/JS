'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Card, CardBody, Spinner, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

export default function AcceptInvitationQueryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuthAndAccept = async () => {
      const userToken = localStorage.getItem('token');
      
      if (!userToken) {
        // Not logged in - redirect to login with returnTo parameter
        const returnUrl = `/accept-invitation?token=${token}`;
        router.push(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
        return;
      }

      // User is logged in, proceed with accepting invitation
      if (!token) {
        setError('Invalid invitation link. No token provided.');
        setLoading(false);
        return;
      }

      await acceptInvitation();
    };

    if (token) {
      checkAuthAndAccept();
    } else {
      setError('Invalid invitation link. No token provided.');
      setLoading(false);
    }
  }, [token, router]);

  const acceptInvitation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call your API to accept the invitation
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept invitation');
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

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container>
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <Card>
              <CardBody className="p-4 text-center">
                {loading && (
                  <>
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <h4>Accepting Invitation...</h4>
                    <p className="text-muted">Please wait while we process your invitation.</p>
                  </>
                )}

                {!loading && error && (
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
                    <button 
                      className="btn btn-primary mt-3"
                      onClick={() => router.push('/apps/classes')}
                    >
                      Go to Classes
                    </button>
                  </>
                )}

                {!loading && success && (
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

