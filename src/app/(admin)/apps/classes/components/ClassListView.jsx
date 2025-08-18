'use client';
import { 
  Card, CardBody, CardFooter, CardHeader, CardTitle,
  Button, Modal, Form, Row, Col, FloatingLabel,
  Alert, Dropdown, Badge, Pagination 
} from 'react-bootstrap';
import { useState, useEffect } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

export default function ClassListView({ classes, refreshClasses, onClassClick }) {
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setIsStudent(userRole === 'student');
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    descriptionHeading: 'Welcome',
    description: '',
    room: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      section: '',
      descriptionHeading: 'Welcome',
      description: '',
      room: ''
    });
    setIsEditing(false);
    setCurrentClassId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classroom/${currentClassId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classroom/`;
      
      const method = isEditing ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isEditing ? 'Failed to update classroom' : 'Failed to create classroom'));
      }

      await response.json();
      setSuccess(isEditing ? 'Classroom updated successfully!' : 'Classroom created successfully!');
      refreshClasses();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classItem) => {
    setCurrentClassId(classItem.id || classItem._id);
    setIsEditing(true);
    setFormData({
      name: classItem.name,
      section: classItem.section || '',
      descriptionHeading: classItem.descriptionHeading || 'Welcome',
      description: classItem.description || '',
      room: classItem.room || ''
    });
    setShowForm(true);
  };

  const handleArchive = async (classItem) => {
    if (!window.confirm('Are you sure you want to archive this class?')) return;
    
    setArchiveLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const classId = classItem.id || classItem._id;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classroom/${classId}/archive`, 
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to archive classroom');
      }

      refreshClasses();
      setSuccess('Classroom archived successfully!');
    } catch (err) {
      setError(err.message || 'Failed to archive classroom');
    } finally {
      setArchiveLoading(false);
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

  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9;

  // Calculate pagination
  const filteredClasses = classes.filter(classItem => classItem.courseState !== "ARCHIVED");
  const totalPages = Math.ceil(filteredClasses.length / cardsPerPage);
  const currentClasses = filteredClasses.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Render pagination items
  const renderPaginationItems = () => {
    let items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
        disabled={currentPage === 1}
      />
    );

    // Page numbers
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  return (

    <div className="p-4 position-relative" style={{ minHeight: '100vh' }}>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      {currentClasses.length === 0 ? (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
          <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="#0d6efd" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" stroke="#0d6efd" strokeWidth="1.5" fill="#e9f5ff" />
            <path d="M8 12h8M8 16h5" stroke="#0d6efd" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h4 className="mt-3 text-primary">No class found</h4>
          <p className="text-muted">You don&apos;t have any classes yet.</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4 mb-5">
          {currentClasses.map((classItem) => {
            const classId = classItem.id || classItem._id;
            return (
              <Col key={classId}>
                <Card 
                  className="h-100 shadow-sm transition-all hover-shadow"
                  onClick={() => onClassClick(classId)}
                  style={{ cursor: 'pointer' }}
                >
                  <CardHeader className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-primary">{classItem.descriptionHeading || 'Class'}</span>
                    {!isStudent && (
                      <Dropdown onClick={(e) => e.stopPropagation()}>
                        <Dropdown.Toggle 
                          variant="link" 
                          id={`dropdown-${classId}`}
                          className="text-dark p-0 shadow-none"
                        >
                          {/* Dropdown icon is rendered by default */}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleEdit(classItem)}>
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => copyClassLink(classId)}>
                            Copy Invitation Link
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            className="text-danger" 
                            onClick={() => handleArchive(classItem)}
                            disabled={archiveLoading}
                          >
                            {archiveLoading ? 'Archiving...' : 'Archive'}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </CardHeader>
                  <CardBody>
                    <CardTitle className="fs-4">{classItem.name}</CardTitle>
                    <p className="text-muted">{classItem.description || 'No description provided'}</p>
                    {/* Add Google Drive icon/link if teacherFolder exists */}
                    {classItem.teacherFolder?.alternateLink && (
                      <a 
                        href={classItem.teacherFolder.alternateLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="d-flex align-items-center gap-2 text-decoration-none mt-2"
                      >
                       <IconifyIcon icon="mdi:folder" width={30} />
                        {/* <span>Google Drive</span> */}
                      </a>
                    )}
                  </CardBody>
                  {(classItem.section || classItem.room) && (
                    <CardFooter className="d-flex justify-content-between text-muted small">
                      {classItem.section && <span>Section: {classItem.section}</span>}
                      {classItem.room && <span>
                        Room: {classItem.room}</span>}
                    </CardFooter>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            {renderPaginationItems()}
          </Pagination>
        </div>
      )}

      {!isStudent && (
        <Button 
          variant="primary" 
          className="position-fixed rounded-circle p-0 d-flex align-items-center justify-content-center" 
          style={{
            width: '60px',
            height: '60px',
            bottom: '30px',
            right: '30px',
            fontSize: '2rem',
            lineHeight: '1'
          }}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          +
        </Button>
      )}

      <Modal show={showForm} onHide={() => {
        resetForm();
        setShowForm(false);
      }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Class' : 'Create Class'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <FloatingLabel controlId="name" label="Class name (required)" className="mb-3">
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Class name"
                required
              />
            </FloatingLabel>

            <Row className="g-2 mb-3">
              <Col md>
                <FloatingLabel controlId="section" label="Section">
                  <Form.Control
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    placeholder="Section"
                  />
                </FloatingLabel>
              </Col>
              <Col md>
                <FloatingLabel controlId="room" label="Room">
                  <Form.Control
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    placeholder="Room"
                  />
                </FloatingLabel>
              </Col>
            </Row>

            <FloatingLabel controlId="descriptionHeading" label="Description Heading" className="mb-3">
              <Form.Control
                type="text"
                name="descriptionHeading"
                value={formData.descriptionHeading}
                onChange={handleInputChange}
                placeholder="Description Heading"
              />
            </FloatingLabel>

            <FloatingLabel controlId="description" label="Description" className="mb-3">
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description"
                style={{ height: '100px' }}
              />
            </FloatingLabel>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              resetForm();
              setShowForm(false);
            }} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update' : 'Create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}