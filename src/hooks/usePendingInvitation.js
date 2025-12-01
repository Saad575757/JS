import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth/tokenManager';

/**
 * Hook to check and process pending invitation after user logs in or registers
 * This should be used in the login/register pages or in a layout component
 */
export const usePendingInvitation = () => {
  const router = useRouter();

  useEffect(() => {
    const processPendingInvitation = async () => {
      // Check if there's a pending invitation token
      const pendingToken = localStorage.getItem('pendingInvitationToken');
      const authToken = getToken();

      if (pendingToken && authToken) {
        console.log('Processing pending invitation...');

        try {
          const response = await fetch('/api/invitations/accept', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ token: pendingToken }),
          });

          const data = await response.json();

          if (response.ok) {
            // Clear the pending token
            localStorage.removeItem('pendingInvitationToken');
            
            // Redirect to the class or appropriate page
            if (data.classId) {
              router.push(`/apps/classes/${data.classId}`);
            } else if (data.redirectTo) {
              router.push(data.redirectTo);
            } else {
              router.push('/apps/classes');
            }
          } else {
            console.error('Failed to process invitation:', data.message);
            // Still clear the token to avoid infinite loops
            localStorage.removeItem('pendingInvitationToken');
          }
        } catch (error) {
          console.error('Error processing pending invitation:', error);
          // Clear token on error to avoid infinite loops
          localStorage.removeItem('pendingInvitationToken');
        }
      }
    };

    // Small delay to ensure auth token is properly set
    const timer = setTimeout(processPendingInvitation, 500);
    return () => clearTimeout(timer);
  }, [router]);
};

export default usePendingInvitation;

