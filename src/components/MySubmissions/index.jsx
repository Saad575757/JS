'use client';
import { useState, useEffect } from 'react';
import { Card, CardBody, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getMySubmissions } from '@/lib/api/submissions';

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[MY SUBMISSIONS] Loading submissions...');
      const data = await getMySubmissions();
      console.log('[MY SUBMISSIONS] Data received:', data);
      
      // Handle different response formats
      const submissionsList = data.submissions || data || [];
      setSubmissions(submissionsList);
      console.log('[MY SUBMISSIONS] Total submissions:', submissionsList.length);
    } catch (err) {
      console.error('[MY SUBMISSIONS] Load error:', err);
      setError(`Failed to load submissions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      submitted: { bg: 'info', text: 'Submitted' },
      graded: { bg: 'success', text: 'Graded' },
      late: { bg: 'warning', text: 'Late' },
      pending: { bg: 'secondary', text: 'Pending' }
    };
    
    const statusInfo = statusMap[status?.toLowerCase()] || statusMap.pending;
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3 text-muted">Loading your submissions...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert variant="danger">
            <IconifyIcon icon="ri:error-warning-line" className="me-2" />
            {error}
          </Alert>
          <Button variant="primary" onClick={loadSubmissions}>
            <IconifyIcon icon="ri:refresh-line" className="me-2" />
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>
            <IconifyIcon icon="ri:file-list-line" className="me-2" />
            My Submissions
          </h4>
          <Button variant="outline-primary" size="sm" onClick={loadSubmissions}>
            <IconifyIcon icon="ri:refresh-line" className="me-2" />
            Refresh
          </Button>
        </div>

        {submissions.length === 0 ? (
          <Alert variant="info">
            <IconifyIcon icon="ri:information-line" className="me-2" />
            You haven't submitted any assignments yet.
          </Alert>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Course</th>
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
                    <strong>{submission.assignment_title || 'Untitled'}</strong>
                    {submission.submission_text && (
                      <div className="small text-muted text-truncate" style={{ maxWidth: '300px' }}>
                        {submission.submission_text.substring(0, 100)}...
                      </div>
                    )}
                  </td>
                  <td>{submission.course_name || '—'}</td>
                  <td>
                    <small>{new Date(submission.submitted_at || submission.created_at).toLocaleString()}</small>
                  </td>
                  <td>{getStatusBadge(submission.status)}</td>
                  <td>
                    {submission.grade !== null && submission.grade !== undefined ? (
                      <Badge bg="primary">
                        {submission.grade} / {submission.max_points || 100}
                      </Badge>
                    ) : (
                      <span className="text-muted">Not graded</span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0"
                      onClick={() => {
                        // View submission details
                        console.log('[MY SUBMISSIONS] View submission:', submission.id);
                      }}
                    >
                      <IconifyIcon icon="ri:eye-line" />
                    </Button>
                    {submission.attachments && submission.attachments.length > 0 && (
                      <Badge bg="secondary" className="ms-2">
                        <IconifyIcon icon="ri:attachment-2" className="me-1" />
                        {submission.attachments.length}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}

