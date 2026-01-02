'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Container, Card, Row, Col, Badge, Button, 
  Spinner, Alert, Modal, Form, ProgressBar 
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  getGradeByToken,
  approveGradeByToken,
  rejectGradeByToken
} from '@/lib/api/aiGradingReview';

export default function GradeReviewPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [gradeData, setGradeData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (token) {
      loadGradeData();
    }
  }, [token]);

  const loadGradeData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getGradeByToken(token);
      setGradeData(data.grade);
    } catch (err) {
      console.error('[GRADE REVIEW] Load error:', err);
      setError(`Failed to load grade: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this grade? The student will be notified.')) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await approveGradeByToken(token);
      setSuccess('Grade approved successfully! The student has been notified.');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('[GRADE REVIEW] Approve error:', err);
      setError(`Failed to approve grade: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await rejectGradeByToken(token, rejectReason);
      setSuccess('Grade rejected. You can now manually grade this submission.');
      setShowRejectModal(false);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('[GRADE REVIEW] Reject error:', err);
      setError(`Failed to reject grade: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const getGradeColor = (grade, maxPoints) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'primary';
    if (percentage >= 70) return 'info';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const getGradePercentage = (grade, maxPoints) => {
    return ((grade / maxPoints) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <h4 className="mt-3">Loading Grade Review...</h4>
        </div>
      </Container>
    );
  }

  if (error && !gradeData) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          <strong>Error:</strong> {error}
        </Alert>
        <div className="text-center mt-4">
          <Button variant="primary" onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="py-5">
        <Card className="shadow-lg border-success">
          <Card.Body className="text-center p-5">
            <div className="mb-4">
              <IconifyIcon 
                icon="ri:checkbox-circle-line" 
                className="text-success"
                style={{ fontSize: '5rem' }}
              />
            </div>
            <h2 className="text-success mb-3">
              {success.includes('approved') ? 'Grade Approved!' : 'Grade Rejected'}
            </h2>
            <p className="lead">{success}</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => router.push('/dashboard')}>
                <IconifyIcon icon="ri:dashboard-line" className="me-2" />
                Return to Dashboard
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const grade = gradeData;
  const percentage = getGradePercentage(grade.proposed_grade, grade.assignment.max_points);
  const gradeColor = getGradeColor(grade.proposed_grade, grade.assignment.max_points);

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-1">
          <IconifyIcon icon="ri:robot-2-line" className="me-2" />
          AI Grade Review
        </h2>
        <p className="text-muted">Review and approve or reject this AI-generated grade</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          {error}
        </Alert>
      )}

      <Row>
        {/* Left Column: Grade Details */}
        <Col lg={8}>
          {/* Course & Assignment Info */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <IconifyIcon icon="ri:book-open-line" className="me-2" />
                Assignment Details
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted">Course</small>
                    <div className="fw-bold">{grade.course.name}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted">Assignment</small>
                    <div className="fw-bold">{grade.assignment.title}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted">Max Points</small>
                    <div className="fw-bold">{grade.assignment.max_points} points</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted">Due Date</small>
                    <div className="fw-bold">
                      {new Date(grade.assignment.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Student Info */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <IconifyIcon icon="ri:user-line" className="me-2" />
                Student Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="mb-3">
                    <small className="text-muted">Student Name</small>
                    <div className="fw-bold">{grade.student.name}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <small className="text-muted">Email</small>
                    <div className="fw-bold">{grade.student.email}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <small className="text-muted">Submitted</small>
                    <div className="fw-bold">
                      {new Date(grade.submission.submitted_at).toLocaleString()}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Student Submission */}
          <Card className="mb-4 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <IconifyIcon icon="ri:file-text-line" className="me-2" />
                Student Submission
              </h5>
            </Card.Header>
            <Card.Body>
              {grade.submission.submission_text ? (
                <div className="mb-3">
                  <div className="p-3 bg-light rounded">
                    {grade.submission.submission_text}
                  </div>
                </div>
              ) : (
                <p className="text-muted">No text submission provided</p>
              )}

              {grade.submission.attachments && grade.submission.attachments.length > 0 && (
                <div>
                  <strong className="d-block mb-2">Attachments:</strong>
                  <div className="list-group">
                    {grade.submission.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <IconifyIcon icon="ri:file-line" className="me-2" />
                          {file.originalName}
                        </div>
                        <Badge bg="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* AI-Generated Feedback */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-warning">
              <h5 className="mb-0">
                <IconifyIcon icon="ri:chat-3-line" className="me-2" />
                AI-Generated Feedback
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                {grade.ai_feedback || 'No feedback provided'}
              </div>
            </Card.Body>
          </Card>

          {/* Grade Breakdown */}
          {grade.ai_analysis?.breakdown && grade.ai_analysis.breakdown.length > 0 && (
            <Card className="mb-4 shadow-sm">
              <Card.Header>
                <h5 className="mb-0">
                  <IconifyIcon icon="ri:bar-chart-line" className="me-2" />
                  Grade Breakdown
                </h5>
              </Card.Header>
              <Card.Body>
                {grade.ai_analysis.breakdown.map((item, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong>{item.criterion}</strong>
                      <Badge bg="primary">
                        {item.score} / {item.maxScore} points
                      </Badge>
                    </div>
                    <div className="text-muted small mb-2">{item.comment}</div>
                    <ProgressBar 
                      now={(item.score / item.maxScore) * 100} 
                      variant={getGradeColor(item.score, item.maxScore)}
                    />
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Right Column: Grade & Actions */}
        <Col lg={4}>
          {/* AI-Proposed Grade (Sticky) */}
          <div style={{ position: 'sticky', top: '20px' }}>
            <Card className={`mb-4 shadow-lg border-${gradeColor}`}>
              <Card.Header className={`bg-${gradeColor} text-white text-center`}>
                <h5 className="mb-0">
                  <IconifyIcon icon="ri:star-line" className="me-2" />
                  AI-Proposed Grade
                </h5>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="display-1 fw-bold mb-2" style={{ color: `var(--bs-${gradeColor})` }}>
                  {grade.proposed_grade}
                </div>
                <div className="h4 text-muted mb-3">
                  out of {grade.assignment.max_points} points
                </div>
                <div className="mb-3">
                  <Badge bg={gradeColor} className="p-2" style={{ fontSize: '1.2rem' }}>
                    {percentage}%
                  </Badge>
                </div>
                <ProgressBar 
                  now={percentage} 
                  variant={gradeColor}
                  className="mb-3"
                  style={{ height: '20px' }}
                />
              </Card.Body>
            </Card>

            {/* Action Buttons */}
            <Card className="mb-4 shadow-sm">
              <Card.Header>
                <h5 className="mb-0">
                  <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                  Actions
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-3">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleApprove}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="ri:checkbox-circle-line" className="me-2" />
                        Approve Grade
                      </>
                    )}
                  </Button>

                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                  >
                    <IconifyIcon icon="ri:close-circle-line" className="me-2" />
                    Reject Grade
                  </Button>

                  <Button
                    variant="outline-primary"
                    onClick={() => router.push('/dashboard')}
                  >
                    <IconifyIcon icon="ri:dashboard-line" className="me-2" />
                    Return to Dashboard
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Info Card */}
            <Alert variant="info">
              <IconifyIcon icon="ri:information-line" className="me-2" />
              <strong>Review carefully:</strong> Once approved, the student will receive this grade and feedback via email.
            </Alert>
          </div>
        </Col>
      </Row>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <IconifyIcon icon="ri:close-circle-line" className="me-2" />
            Reject AI Grade
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <IconifyIcon icon="ri:alert-line" className="me-2" />
            You&apos;re about to reject this AI-generated grade. Please provide a reason so you can remember why.
          </Alert>
          <Form.Group>
            <Form.Label>Rejection Reason <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g., AI misunderstood the requirements, grade too harsh, need to review manually..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleReject}
            disabled={processing || !rejectReason.trim()}
          >
            {processing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Rejecting...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:close-circle-line" className="me-2" />
                Reject Grade
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

