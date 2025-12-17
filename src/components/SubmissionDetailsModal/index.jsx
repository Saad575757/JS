'use client';
import { useState, useEffect } from 'react';
import { 
  Modal, Button, Table, Badge, Spinner, Alert, 
  Accordion, Card, Form, InputGroup, Tabs, Tab
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAllSubmissionsForAssignment, gradeSubmission } from '@/lib/api/submissions';
import AIGradingButton from './AIGradingButton';

export default function SubmissionDetailsModal({ 
  show, 
  onHide, 
  assignment 
}) {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  const [grading, setGrading] = useState({});
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    if (show && assignment) {
      loadSubmissions();
    }
  }, [show, assignment]);

  const loadSubmissions = async () => {
    if (!assignment?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('[SUBMISSIONS] Loading all submissions for assignment:', assignment.id);
      const data = await getAllSubmissionsForAssignment(assignment.id);
      console.log('[SUBMISSIONS] Data received:', data);

      setSubmissions(data.submissions || []);
      setStats({
        total: data.count || 0,
        submitted: data.submittedCount || 0,
        graded: data.gradedCount || 0
      });
    } catch (err) {
      console.error('[SUBMISSIONS] Load error:', err);
      setError(`Failed to load submissions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId, grade, feedback = '') => {
    setGrading(prev => ({ ...prev, [submissionId]: true }));
    
    try {
      await gradeSubmission(submissionId, grade, feedback);
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, grade, feedback, status: 'graded' }
          : sub
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        graded: prev.graded + 1
      }));
    } catch (err) {
      console.error('[SUBMISSIONS] Grade error:', err);
      alert(`Failed to grade: ${err.message}`);
    } finally {
      setGrading(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      submitted: { bg: 'info', icon: 'ri:file-list-line', text: 'Submitted' },
      graded: { bg: 'success', icon: 'ri:checkbox-circle-line', text: 'Graded' },
      late: { bg: 'warning', icon: 'ri:time-line', text: 'Late' },
      pending: { bg: 'secondary', icon: 'ri:hourglass-line', text: 'Pending' }
    };
    
    const statusInfo = statusMap[status?.toLowerCase()] || statusMap.pending;
    return (
      <Badge bg={statusInfo.bg}>
        <IconifyIcon icon={statusInfo.icon} className="me-1" />
        {statusInfo.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!assignment) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <IconifyIcon icon="ri:file-list-3-line" className="me-2" />
          Submissions: {assignment.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Assignment Info */}
        <Card className="mb-3 bg-light">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="mb-2">{assignment.title}</h6>
                {assignment.description && (
                  <p className="text-muted small mb-0">{assignment.description}</p>
                )}
              </div>
              <div className="text-end">
                <div className="small text-muted">Due: {formatDate(assignment.due_date)}</div>
                <div className="small">Max Points: <Badge bg="primary">{assignment.max_points}</Badge></div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Stats */}
        <div className="d-flex gap-3 mb-4">
          <Card className="flex-fill border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="mb-0">{stats.total || 0}</h3>
              <small className="text-muted">Total Students</small>
            </Card.Body>
          </Card>
          <Card className="flex-fill border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="mb-0 text-info">{stats.submitted || 0}</h3>
              <small className="text-muted">Submitted</small>
            </Card.Body>
          </Card>
          <Card className="flex-fill border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="mb-0 text-success">{stats.graded || 0}</h3>
              <small className="text-muted">Graded</small>
            </Card.Body>
          </Card>
          <Card className="flex-fill border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="mb-0 text-warning">{stats.total - stats.submitted || 0}</h3>
              <small className="text-muted">Not Submitted</small>
            </Card.Body>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <IconifyIcon icon="ri:error-warning-line" className="me-2" />
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-3 text-muted">Loading submissions...</p>
          </div>
        ) : (
          <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
            {/* List View */}
            <Tab eventKey="list" title={`List View (${submissions.length})`}>
              {submissions.length === 0 ? (
                <Alert variant="info">
                  <IconifyIcon icon="ri:information-line" className="me-2" />
                  No submissions yet for this assignment.
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td>
                          <strong>{submission.student_name}</strong>
                          <div className="small text-muted">{submission.student_email}</div>
                        </td>
                        <td>
                          <small>{formatDate(submission.submitted_at)}</small>
                        </td>
                        <td>{getStatusBadge(submission.status)}</td>
                        <td>
                          {submission.grade !== null && submission.grade !== undefined ? (
                            <Badge bg="primary">
                              {submission.grade} / {assignment.max_points}
                            </Badge>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setActiveTab(`view-${submission.id}`)}
                          >
                            <IconifyIcon icon="ri:eye-line" /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>

            {/* Individual Submission Tabs */}
            {submissions.map((submission) => (
              <Tab 
                key={submission.id}
                eventKey={`view-${submission.id}`}
                title={submission.student_name}
              >
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    {/* Student Info */}
                    <div className="mb-4 p-3 bg-light rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-1">{submission.student_name}</h5>
                          <p className="text-muted small mb-0">{submission.student_email}</p>
                        </div>
                        <div className="text-end">
                          {getStatusBadge(submission.status)}
                          <div className="small text-muted mt-1">
                            Submitted: {formatDate(submission.submitted_at)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submission Text */}
                    {submission.submission_text && (
                      <div className="mb-4">
                        <h6>
                          <IconifyIcon icon="ri:file-text-line" className="me-2" />
                          Submission Text
                        </h6>
                        <Card className="bg-light">
                          <Card.Body>
                            <div style={{ whiteSpace: 'pre-wrap' }}>
                              {submission.submission_text}
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    )}

                    {/* Attachments */}
                    {submission.attachments && submission.attachments.length > 0 && (
                      <div className="mb-4">
                        <h6>
                          <IconifyIcon icon="ri:attachment-2" className="me-2" />
                          Attachments ({submission.attachments.length})
                        </h6>
                        {submission.attachments.map((file, idx) => (
                          <Card key={idx} className="mb-2">
                            <Card.Body className="p-3">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <IconifyIcon 
                                    icon="ri:file-line" 
                                    className="me-3 text-primary" 
                                    style={{ fontSize: '2rem' }}
                                  />
                                  <div>
                                    <strong>{file.originalName}</strong>
                                    <div className="small text-muted">
                                      {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''} 
                                      {file.mimetype && ` • ${file.mimetype}`}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  href={file.fullUrl || file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <IconifyIcon icon="ri:download-line" className="me-1" />
                                  Download
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Grading Section */}
                    <div className="border-top pt-4">
                      <h6 className="mb-3">
                        <IconifyIcon icon="ri:star-line" className="me-2" />
                        Grading
                      </h6>
                      <Form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const grade = parseFloat(formData.get('grade'));
                        const feedback = formData.get('feedback');
                        handleGrade(submission.id, grade, feedback);
                      }}>
                        <InputGroup className="mb-3">
                          <InputGroup.Text>Grade</InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="grade"
                            min="0"
                            max={assignment.max_points}
                            step="0.5"
                            defaultValue={submission.grade}
                            placeholder="0"
                            required
                          />
                          <InputGroup.Text>/ {assignment.max_points}</InputGroup.Text>
                        </InputGroup>

                        <Form.Group className="mb-3">
                          <Form.Label>Feedback (Optional)</Form.Label>
                          <Form.Control
                            as="textarea"
                            name="feedback"
                            rows={3}
                            defaultValue={submission.feedback}
                            placeholder="Provide feedback for the student..."
                          />
                        </Form.Group>

                        <div className="d-flex gap-2 align-items-center">
                          <Button 
                            type="submit" 
                            variant="primary"
                            disabled={grading[submission.id]}
                          >
                            {grading[submission.id] ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <IconifyIcon icon="ri:save-line" className="me-2" />
                                Save Grade
                              </>
                            )}
                          </Button>
                          
                          {/* AI Grading Button */}
                          <AIGradingButton 
                            submission={submission}
                            onGradingComplete={() => loadSubmissions()}
                          />
                        </div>
                      </Form>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>
            ))}
          </Tabs>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={loadSubmissions}>
          <IconifyIcon icon="ri:refresh-line" className="me-2" />
          Refresh
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

