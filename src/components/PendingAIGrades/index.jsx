'use client';
import { useState, useEffect } from 'react';
import { 
  Modal, Button, Table, Badge, Spinner, Alert, 
  Card, Accordion, ButtonGroup 
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  getPendingAIGrades,
  approveAIGrade,
  rejectAIGrade
} from '@/lib/api/aiGrading';

export default function PendingAIGrades({ 
  show, 
  onHide,
  onGradesProcessed 
}) {
  const [loading, setLoading] = useState(false);
  const [pendingGrades, setPendingGrades] = useState([]);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      loadPendingGrades();
    }
  }, [show]);

  const loadPendingGrades = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[PENDING AI] Loading pending grades...');
      const data = await getPendingAIGrades();
      console.log('[PENDING AI] Data received:', data);
      
      setPendingGrades(data.pendingGrades || []);
    } catch (err) {
      console.error('[PENDING AI] Load error:', err);
      setError(`Failed to load pending grades: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (grade) => {
    setProcessing(prev => ({ ...prev, [grade.id]: 'approving' }));
    
    try {
      await approveAIGrade(grade.id, grade.approval_token);
      console.log('[PENDING AI] Approved grade:', grade.id);
      
      // Remove from pending list
      setPendingGrades(prev => prev.filter(g => g.id !== grade.id));
      onGradesProcessed?.();
    } catch (err) {
      console.error('[PENDING AI] Approve error:', err);
      alert(`Failed to approve: ${err.message}`);
    } finally {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[grade.id];
        return newState;
      });
    }
  };

  const handleReject = async (grade, reason = '') => {
    setProcessing(prev => ({ ...prev, [grade.id]: 'rejecting' }));
    
    try {
      await rejectAIGrade(grade.id, grade.approval_token, reason);
      console.log('[PENDING AI] Rejected grade:', grade.id);
      
      // Remove from pending list
      setPendingGrades(prev => prev.filter(g => g.id !== grade.id));
      onGradesProcessed?.();
    } catch (err) {
      console.error('[PENDING AI] Reject error:', err);
      alert(`Failed to reject: ${err.message}`);
    } finally {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[grade.id];
        return newState;
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <IconifyIcon icon="ri:robot-2-line" className="me-2" />
          Pending AI Grades
          {pendingGrades.length > 0 && (
            <Badge bg="warning" className="ms-2">{pendingGrades.length}</Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
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
            <p className="mt-3 text-muted">Loading pending grades...</p>
          </div>
        ) : pendingGrades.length === 0 ? (
          <Alert variant="info">
            <IconifyIcon icon="ri:information-line" className="me-2" />
            No pending AI grades to review. All submissions have been processed!
          </Alert>
        ) : (
          <Accordion>
            {pendingGrades.map((grade, index) => (
              <Accordion.Item key={grade.id} eventKey={index.toString()}>
                <Accordion.Header>
                  <div className="d-flex align-items-center justify-content-between w-100 me-3">
                    <div>
                      <strong>{grade.student_name}</strong>
                      <div className="small text-muted">{grade.assignment_title}</div>
                    </div>
                    <div className="text-end">
                      <Badge bg="primary" style={{ fontSize: '1rem' }}>
                        {grade.proposed_grade} / 100
                      </Badge>
                    </div>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Card className="mb-3 border-0 bg-light">
                    <Card.Body>
                      {/* Student & Assignment Info */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>Student:</strong> {grade.student_name}
                            {grade.student_email && (
                              <div className="small text-muted">{grade.student_email}</div>
                            )}
                          </div>
                          <div className="text-end">
                            <strong>Assignment:</strong> {grade.assignment_title}
                          </div>
                        </div>
                      </div>

                      {/* Proposed Grade */}
                      <div className="mb-3 p-3 border rounded bg-white">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="mb-0">
                            <IconifyIcon icon="ri:star-line" className="me-2" />
                            AI Proposed Grade
                          </h6>
                          <h4 className="mb-0 text-primary">{grade.proposed_grade} / 100</h4>
                        </div>
                        
                        {/* Feedback */}
                        <div className="mt-3">
                          <strong className="d-block mb-2">Feedback:</strong>
                          <div className="p-2 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                            {grade.proposed_feedback}
                          </div>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      {grade.ai_analysis && (
                        <div className="mb-3">
                          <strong className="d-block mb-2">
                            <IconifyIcon icon="ri:brain-line" className="me-2" />
                            AI Analysis
                          </strong>
                          <Card className="border">
                            <Card.Body className="small">
                              {/* Strengths */}
                              {grade.ai_analysis.strengths && (
                                <div className="mb-2">
                                  <strong className="text-success">✓ Strengths:</strong>
                                  <ul className="mb-0 mt-1">
                                    {grade.ai_analysis.strengths.map((strength, idx) => (
                                      <li key={idx}>{strength}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Areas for Improvement */}
                              {grade.ai_analysis.improvements && (
                                <div className="mb-2">
                                  <strong className="text-warning">⚠ Areas for Improvement:</strong>
                                  <ul className="mb-0 mt-1">
                                    {grade.ai_analysis.improvements.map((improvement, idx) => (
                                      <li key={idx}>{improvement}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Criteria Breakdown */}
                              {grade.ai_analysis.criteria && (
                                <div>
                                  <strong>Criteria Breakdown:</strong>
                                  <Table size="sm" className="mt-2 mb-0">
                                    <tbody>
                                      {Object.entries(grade.ai_analysis.criteria).map(([criterion, score]) => (
                                        <tr key={criterion}>
                                          <td>{criterion}</td>
                                          <td className="text-end">
                                            <Badge bg="primary">{score}</Badge>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="d-flex gap-2 justify-content-end">
                        <Button
                          variant="outline-danger"
                          onClick={() => {
                            const reason = prompt('Reason for rejection (optional):');
                            if (reason !== null) {
                              handleReject(grade, reason);
                            }
                          }}
                          disabled={processing[grade.id]}
                        >
                          {processing[grade.id] === 'rejecting' ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <IconifyIcon icon="ri:close-circle-line" className="me-2" />
                              Reject
                            </>
                          )}
                        </Button>
                        <Button
                          variant="success"
                          onClick={() => handleApprove(grade)}
                          disabled={processing[grade.id]}
                        >
                          {processing[grade.id] === 'approving' ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <IconifyIcon icon="ri:checkbox-circle-line" className="me-2" />
                              Approve & Apply Grade
                            </>
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="text-muted small">
            {pendingGrades.length} grade{pendingGrades.length !== 1 ? 's' : ''} pending review
          </div>
          <div>
            <Button variant="secondary" className="me-2" onClick={onHide}>
              Close
            </Button>
            <Button variant="primary" onClick={loadPendingGrades}>
              <IconifyIcon icon="ri:refresh-line" className="me-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

