'use client';
import { Container, Row, Col } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import MySubmissions from '@/components/MySubmissions';

export default function MySubmissionsPage() {
  return (
    <>
      <PageTitle title="My Submissions" />
      <Container fluid>
        <Row>
          <Col>
            <MySubmissions />
          </Col>
        </Row>
      </Container>
    </>
  );
}

