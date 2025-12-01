'use client';
import { 
  Card, CardBody, CardFooter, CardHeader, CardTitle,
  Button, Modal, Form, Row, Col,
  Alert, Dropdown, Badge, Spinner
} from 'react-bootstrap';
import { useState } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { createCourse, deleteCourse } from '@/lib/api/courses';

export default function ClassListView({ classes, refreshClasses, loading, error: parentError, onClassClick }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    description: '',
    room: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      section: '',
      description: '',
      room: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createCourse(formData);
      setSuccess('Course created successfully!');
      refreshClasses();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      setError(null);
      await deleteCourse(courseId);
      setSuccess('Course deleted successfully!');
      refreshClasses();
    } catch (err) {
      setError(err.message || 'Failed to delete course');
    }
  };

  const copyClassLink = (classId) => {
    const classUrl = `${window.location.origin}/apps/classes/${classId}`;
    navigator.clipboard.writeText(classUrl)
      .then(() => {
        setSuccess('Class URL copied to clipboard!');
      })
      .catch(() => {
        setError('Failed to copy link to clipboard');
      });
  };

  return (
    <div className="p-2 p-md-4 position-relative" style={{ minHeight: '100vh' }}>
      {/* Alerts */}
      {(error || parentError) && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error || parentError}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <h5 className="text-primary mt-3">Loading courses...</h5>
        </div>
      ) : classes.length === 0 ? (
        // Empty State
        <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '60vh' }}>
          <div className="mb-4">
            <IconifyIcon icon="ri:book-line" style={{ fontSize: '5rem', color: '#0d6efd' }} />
          </div>
          <h3 className="text-primary mb-2">No Courses Yet</h3>
          <p className="text-muted mb-4">Get started by creating your first course</p>
          <Button variant="primary" size="lg" onClick={() => setShowForm(true)}>
            <IconifyIcon icon="ri:add-line" className="me-2" />
            Create Your First Course
          </Button>
        </div>
      ) : (
        // Course Grid
        <Row xs={1} md={2} lg={3} xl={4} className="g-4 mb-5">
          {classes.map((course) => (
            <Col key={course.id}>
              <Card 
                className="h-100 shadow-sm border-0 hover-lift"
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  borderLeft: '4px solid #0d6efd !important'
                }}
                onClick={() => onClassClick(course.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <CardHeader className="bg-primary text-white border-0 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <IconifyIcon icon="ri:book-open-line" className="me-2" style={{ fontSize: '1.5rem' }} />
                    <span className="fw-bold">{course.name}</span>
                  </div>
                  <Dropdown onClick={(e) => e.stopPropagation()}>
                    <Dropdown.Toggle
                      variant="link"
                      className="text-white p-0 shadow-none"
                      style={{ fontSize: '1.5rem' }}
                    >
                      <IconifyIcon icon="ri:more-2-fill" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => copyClassLink(course.id)}>
                        <IconifyIcon icon="ri:link" className="me-2" />
                        Copy Link
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item 
                        className="text-danger"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <IconifyIcon icon="ri:delete-bin-line" className="me-2" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </CardHeader>
                <CardBody>
                  <p className="text-muted mb-3" style={{ minHeight: '60px' }}>
                    {course.description || 'No description provided'}
                  </p>
                  <div className="d-flex align-items-center mb-2">
                    <IconifyIcon icon="ri:user-line" className="me-2 text-primary" />
                    <small className="text-muted">
                      <strong>{course.teacher_name || 'Teacher'}</strong>
                    </small>
                  </div>
                  <div className="d-flex align-items-center">
                    <IconifyIcon icon="ri:group-line" className="me-2 text-primary" />
                    <small className="text-muted">
                      {course.student_count || 0} students
                    </small>
                  </div>
                </CardBody>
                {(course.section || course.room) && (
                  <CardFooter className="bg-light border-0 d-flex justify-content-between text-muted small">
                    {course.section && (
                      <span>
                        <IconifyIcon icon="ri:folder-line" className="me-1" />
                        {course.section}
                      </span>
                    )}
                    {course.room && (
                      <span>
                        <IconifyIcon icon="ri:door-line" className="me-1" />
                        {course.room}
                      </span>
                    )}
                  </CardFooter>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Floating Action Button */}
      {!loading && (
        <Button
          variant="primary"
          aria-label="Add Course"
          className="position-fixed rounded-circle p-0 d-flex align-items-center justify-content-center shadow-lg"
          style={{
            width: '60px',
            height: '60px',
            bottom: '30px',
            right: '30px',
            fontSize: '2rem',
            zIndex: 1050
          }}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <IconifyIcon icon="ri:add-line" />
        </Button>
      )}

      {/* Create Course Modal */}
      <Modal show={showForm} onHide={() => {
        resetForm();
        setShowForm(false);
      }} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <IconifyIcon icon="ri:add-circle-line" className="me-2" />
            Create New Course
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                <IconifyIcon icon="ri:book-line" className="me-2 text-primary" />
                Course Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to Computer Science"
                required
                size="lg"
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <IconifyIcon icon="ri:folder-line" className="me-2 text-primary" />
                    Section
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    placeholder="e.g., A, B, Morning"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <IconifyIcon icon="ri:door-line" className="me-2 text-primary" />
                    Room
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    placeholder="e.g., Room 301, Lab 2"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                <IconifyIcon icon="ri:file-text-line" className="me-2 text-primary" />
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the course..."
                rows={4}
              />
            </Form.Group>

            <Alert variant="info" className="mb-0">
              <IconifyIcon icon="ri:information-line" className="me-2" />
              <small>
                After creating the course, you can add students, assignments, and announcements.
              </small>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                resetForm();
                setShowForm(false);
              }} 
              disabled={submitting}
            >
              <IconifyIcon icon="ri:close-line" className="me-2" />
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                <>
                  <IconifyIcon icon="ri:add-line" className="me-2" />
                  Create Course
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style jsx global>{`
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
