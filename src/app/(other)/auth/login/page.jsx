'use client';

import { Card, Col, Container, Row } from 'react-bootstrap';
import Image from 'next/image';
import AuthLogo from '@/components/AuthLogo';
import LoginForm from './components/LoginForm';
import authImg from '@/assets/images/auth-img.jpg';

const Login = () => {
  return (
    <div className="account-pages p-sm-5 position-relative">
      <Container>
        <Row className="justify-content-center">
          <Col xxl={9} lg={11}>
            <Card className="overflow-hidden shadow-lg">
              <Row className="g-0">
                <Col lg={6}>
                  <div className="d-flex flex-column h-100">
                    <AuthLogo />
                    <div className="p-4 my-auto text-center">
                      <h4 className="fs-20 fw-bold mb-2">Welcome Back!</h4>
                      <p className="text-muted mb-4">
                        Sign in to continue to your classroom assistant
                      </p>
                      <LoginForm />
                    </div>
                  </div>
                </Col>
                <Col lg={6} className="d-none d-lg-block">
                  <div className="position-relative h-100">
                    <Image
                      src={authImg}
                      alt="Login background"
                      className="img-fluid rounded-end h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
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
