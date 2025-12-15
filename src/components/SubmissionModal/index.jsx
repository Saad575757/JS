'use client';
import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { submitAssignment } from '@/lib/api/submissions';
import { uploadFile } from '@/lib/api/courses';

export default function SubmissionModal({ 
  show, 
  onHide, 
  assignment,
  onSubmitSuccess 
}) {
  const [submissionText, setSubmissionText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        console.log('[SUBMISSION] Uploading file:', file.name);
        const response = await uploadFile(file);
        console.log('[SUBMISSION] File uploaded:', response);
        
        return {
          originalName: response.file?.originalName || file.name,
          filename: response.file?.filename || file.name,
          url: response.file?.url || response.url,
          fullUrl: response.file?.fullUrl || response.fullUrl,
          size: response.file?.size || file.size,
          mimetype: response.file?.mimetype || file.type
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedFiles]);
      console.log('[SUBMISSION] All files uploaded:', uploadedFiles);
    } catch (err) {
      console.error('[SUBMISSION] Upload error:', err);
      setError(`Failed to upload files: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submissionText.trim() && attachments.length === 0) {
      setError('Please provide submission text or attach files');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('[SUBMISSION] Submitting assignment:', {
        assignmentId: assignment.id,
        submissionText,
        attachments
      });

      const response = await submitAssignment({
        assignmentId: assignment.id,
        submissionText: submissionText.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      });

      console.log('[SUBMISSION] Submission successful:', response);
      setSuccess('Assignment submitted successfully!');
      
      // Call success callback after a brief delay
      setTimeout(() => {
        onSubmitSuccess?.(response);
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('[SUBMISSION] Submit error:', err);
      setError(`Failed to submit assignment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmissionText('');
    setAttachments([]);
    setError(null);
    setSuccess(null);
    onHide();
  };

  if (!assignment) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="ri:file-upload-line" className="me-2" />
          Submit Assignment
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Assignment Details */}
          <div className="mb-4 p-3 bg-light rounded">
            <h6 className="mb-2">{assignment.title}</h6>
            {assignment.description && (
              <p className="text-muted small mb-2">{assignment.description}</p>
            )}
            <div className="d-flex gap-3 small">
              {assignment.due_date && (
                <span>
                  <IconifyIcon icon="ri:calendar-line" className="me-1" />
                  Due: {new Date(assignment.due_date).toLocaleString()}
                </span>
              )}
              {assignment.max_points && (
                <span>
                  <IconifyIcon icon="ri:star-line" className="me-1" />
                  Points: {assignment.max_points}
                </span>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <IconifyIcon icon="ri:error-warning-line" className="me-2" />
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert variant="success">
              <IconifyIcon icon="ri:checkbox-circle-line" className="me-2" />
              {success}
            </Alert>
          )}

          {/* Submission Text */}
          <Form.Group className="mb-3">
            <Form.Label>
              <IconifyIcon icon="ri:file-text-line" className="me-2" />
              Submission Text
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Enter your submission text here... (optional if you're uploading files)"
              disabled={submitting}
            />
            <Form.Text className="text-muted">
              You can provide text, attach files, or both.
            </Form.Text>
          </Form.Group>

          {/* File Attachments */}
          <Form.Group className="mb-3">
            <Form.Label>
              <IconifyIcon icon="ri:attachment-2" className="me-2" />
              Attachments
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.zip"
              onChange={handleFileSelect}
              disabled={uploading || submitting}
            />
            <Form.Text className="text-muted">
              Supported formats: PDF, Word, Excel, PowerPoint, Images, Text, ZIP (Max 50MB each)
            </Form.Text>
          </Form.Group>

          {/* Uploading Indicator */}
          {uploading && (
            <Alert variant="info" className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              Uploading files...
            </Alert>
          )}

          {/* Attached Files List */}
          {attachments.length > 0 && (
            <div className="mb-3">
              <strong className="d-block mb-2">
                Attached Files ({attachments.length})
              </strong>
              <div className="border rounded p-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center justify-content-between p-2 border-bottom"
                  >
                    <div className="d-flex align-items-center flex-grow-1">
                      <IconifyIcon 
                        icon="ri:file-line" 
                        className="me-2 text-primary" 
                        style={{ fontSize: '1.5rem' }}
                      />
                      <div>
                        <div className="fw-bold small">{file.originalName}</div>
                        <small className="text-muted">
                          {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                          {file.mimetype && ` • ${file.mimetype.split('/').pop()}`}
                        </small>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger"
                      onClick={() => removeAttachment(index)}
                      disabled={submitting}
                    >
                      <IconifyIcon icon="ri:delete-bin-line" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={submitting || uploading || (!submissionText.trim() && attachments.length === 0)}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:send-plane-fill" className="me-2" />
                Submit Assignment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

