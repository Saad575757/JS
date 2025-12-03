'use client';
import { useEffect, useState } from 'react';
import { Container, Card, CardBody, Alert } from 'react-bootstrap';
import { getUserRole, getUserData } from '@/lib/auth/tokenManager';

export default function RoleDebugPage() {
  const [roleInfo, setRoleInfo] = useState(null);

  useEffect(() => {
    const role = getUserRole();
    const userData = getUserData();
    const directRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    const userDataKey = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
    
    setRoleInfo({
      fromGetUserRole: role,
      fromGetUserData: userData,
      directFromLocalStorage: directRole,
      userDataKeyRaw: userDataKey
    });
  }, []);

  return (
    <Container className="py-4">
      <Card>
        <CardBody>
          <h3 className="mb-4">🔍 Role Debug Information</h3>
          
          <Alert variant="info">
            <h5>Current Role Detection:</h5>
            <pre>{JSON.stringify(roleInfo, null, 2)}</pre>
          </Alert>

          <Alert variant="warning">
            <h6>What should happen:</h6>
            <ul>
              <li>If <code>fromGetUserRole</code> is <strong>"student"</strong>, you should NOT see create/delete buttons</li>
              <li>If <code>fromGetUserRole</code> is <strong>"teacher"</strong>, you SHOULD see all buttons</li>
            </ul>
          </Alert>
        </CardBody>
      </Card>
    </Container>
  );
}

