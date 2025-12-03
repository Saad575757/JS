'use client';
import { 
  Button, Card, CardBody, CardHeader, CardTitle,
  Badge, Nav, Tab, Container, Alert, ListGroup,
  ListGroupItem, Modal, Form, Col, Row, Table, Spinner
} from 'react-bootstrap';
import { useState, useEffect } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { 
  getCourse, getCourseStudents,
  getAssignmentsByCourse, createAssignment, deleteAssignment,
  getAnnouncementsByCourse, createAnnouncement, deleteAnnouncement
} from '@/lib/api/courses';

export default function ClassDetailView_New({ classId, onBack }) {
  // State management
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('stream');
  const [isTeacher, setIsTeacher] = useState(false);

  // Modals state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  
  // Form states
  const [announcementData, setAnnouncementData] = useState({ title: '', content: '' });
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100
  });

  // Load all data
  const loadClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load course data
      const courseRes = await getCourse(classId);
      setClassData(courseRes.success ? courseRes.course : courseRes);
      
      // Load students
      const studentsRes = await getCourseStudents(classId);
      setStudents(studentsRes.success ? studentsRes.students : studentsRes);
      
      // Load assignments
      const assignmentsRes = await getAssignmentsByCourse(classId);
      setAssignments(assignmentsRes.success ? assignmentsRes.assignments : assignmentsRes);
      
      // Load announcements
      const announcementsRes = await getAnnouncementsByCourse(classId);
      setAnnouncements(announcementsRes.success ? announcementsRes.announcements : announcementsRes);
      
    } catch (err) {
      setError(err.message || 'Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check user role
    const userRole = localStorage.getItem('role');
    setIsTeacher(userRole === 'teacher');
    
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  // Create announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        courseId: classId,
        title: announcementData.title,
        content: announcementData.content
      });
      setSuccess('Announcement created successfully!');
      setAnnouncementData({ title: '', content: '' });
      setShowAnnouncementModal(false);
      loadClassData();
    } catch (err) {
      setError(err.message || 'Failed to create announcement');
    }
  };

  // Create assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await createAssignment({
        courseId: classId,
        title: assignmentData.title,
        description: assignmentData.description,
        dueDate: assignmentData.dueDate,
        maxPoints: parseInt(assignmentData.maxPoints)
      });
      setSuccess('Assignment created successfully!');
      setAssignmentData({ title: '', description: '', dueDate: '', maxPoints: 100 });
      setShowAssignmentModal(false);
      loadClassData();
    } catch (err) {
      setError(err.message || 'Failed to create assignment');
    }
  };

  // Delete announcement
  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(announcementId);
      setSuccess('Announcement deleted successfully!');
      loadClassData();
    } catch (err) {
      setError(err.message || 'Failed to delete announcement');
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await deleteAssignment(assignmentId);
      setSuccess('Assignment deleted successfully!');
      loadClassData();
    } catch (err) {
      setError(err.message || 'Failed to delete assignment');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-4 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <h5 className="text-primary mt-3">Loading course details...</h5>
        </div>
      </Container>
    );
  }
  
  // Error state
  if (error && !classData) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={onBack}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-2" />
          Back to Courses
        </Button>
      </Container>
    );
  }

  // No class data state
  if (!classData) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Course not found</Alert>
        <Button variant="primary" onClick={onBack}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-2" />
          Back to Courses
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Back Button */}
      <Button variant="outline-primary" onClick={onBack} className="mb-3">
        <IconifyIcon icon="ri:arrow-left-line" className="me-2" />
        Back to Courses
      </Button>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Main Course Card */}
      <Card className="mb-4 border-0 shadow">
        <CardHeader className="bg-gradient-primary text-white border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Row>
            <Col md={8}>
              <CardTitle className="fs-2 mb-2">{classData.name}</CardTitle>
              <div className="d-flex align-items-center gap-3">
                {classData.section && (
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    <IconifyIcon icon="ri:folder-line" className="me-1" />
                    {classData.section}
                  </Badge>
                )}
                {classData.room && (
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    <IconifyIcon icon="ri:door-line" className="me-1" />
                    {classData.room}
                  </Badge>
                )}
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="text-white-50 small">Teacher</div>
              <div className="fw-bold fs-5">{classData.teacher_name}</div>
              <div className="text-white-50 small">{classData.teacher_email}</div>
            </Col>
          </Row>
        </CardHeader>
        
        {/* Tabs */}
        <CardBody className="p-0">
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="tabs" className="px-3 pt-2 border-bottom">
              <Nav.Item>
                <Nav.Link eventKey="stream">
                  <IconifyIcon icon="ri:home-line" className="me-2" />
                  Stream
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="assignments">
                  <IconifyIcon icon="ri:file-list-3-line" className="me-2" />
                  Assignments
                  <Badge bg="primary" className="ms-2">{assignments.length}</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="people">
                  <IconifyIcon icon="ri:group-line" className="me-2" />
                  People
                  <Badge bg="success" className="ms-2">{students.length}</Badge>
                </Nav.Link>
              </Nav.Item>
            </Nav>
            
            <Tab.Content className="p-4">
              {/* Stream Tab - Announcements */}
              <Tab.Pane eventKey="stream">
                <Row>
                  <Col lg={8}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4>
                        <IconifyIcon icon="ri:megaphone-line" className="me-2" />
                        Announcements
                      </h4>
                      {isTeacher && (
                        <Button variant="primary" onClick={() => setShowAnnouncementModal(true)}>
                          <IconifyIcon icon="ri:add-line" className="me-2" />
                          Post Announcement
                        </Button>
                      )}
                    </div>

                    {announcements.length === 0 ? (
                      <Card className="text-center py-5 border-0 bg-light">
                        <CardBody>
                          <IconifyIcon icon="ri:megaphone-line" style={{ fontSize: '4rem', color: '#dee2e6' }} />
                          <h5 className="mt-3 text-muted">No announcements yet</h5>
                          <p className="text-muted">
                            {isTeacher 
                              ? 'Create your first announcement to keep students informed' 
                              : 'Your teacher hasn\'t posted any announcements yet'}
                          </p>
                          {isTeacher && (
                            <Button variant="primary" onClick={() => setShowAnnouncementModal(true)}>
                              <IconifyIcon icon="ri:add-line" className="me-2" />
                              Create Announcement
                            </Button>
                          )}
                        </CardBody>
                      </Card>
                    ) : (
                      announcements.map(announcement => (
                        <Card key={announcement.id} className="mb-3 border-0 shadow-sm">
                          <CardBody>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style={{ width: '48px', height: '48px' }}>
                                  <IconifyIcon icon="ri:user-line" style={{ fontSize: '1.5rem' }} />
                                </div>
                                <div>
                                  <h6 className="mb-0">{announcement.teacher_name || 'Teacher'}</h6>
                                  <small className="text-muted">
                                    {new Date(announcement.created_at).toLocaleString()}
                                  </small>
                                </div>
                              </div>
                              {isTeacher && (
                                <Button 
                                  variant="link" 
                                  className="text-danger p-0"
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                >
                                  <IconifyIcon icon="ri:delete-bin-line" />
                                </Button>
                              )}
                            </div>
                            <h5>{announcement.title}</h5>
                            <p className="mb-0">{announcement.content}</p>
                          </CardBody>
                        </Card>
                      ))
                    )}
                  </Col>
                  
                  <Col lg={4}>
                    <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                      <CardHeader className="bg-light border-0">
                        <h6 className="mb-0">
                          <IconifyIcon icon="ri:information-line" className="me-2" />
                          Course Info
                        </h6>
                      </CardHeader>
                      <CardBody>
                        <div className="mb-3">
                          <small className="text-muted">Description</small>
                          <p>{classData.description || 'No description'}</p>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted">Total Students</small>
                          <p className="fw-bold">{classData.student_count || 0}</p>
                        </div>
                        <div>
                          <small className="text-muted">Created</small>
                          <p>{new Date(classData.created_at).toLocaleDateString()}</p>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>
              
              {/* Assignments Tab */}
              <Tab.Pane eventKey="assignments">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>
                    <IconifyIcon icon="ri:file-list-3-line" className="me-2" />
                    Assignments
                  </h4>
                  {isTeacher && (
                    <Button variant="primary" onClick={() => setShowAssignmentModal(true)}>
                      <IconifyIcon icon="ri:add-line" className="me-2" />
                      Create Assignment
                    </Button>
                  )}
                </div>

                {assignments.length === 0 ? (
                  <Card className="text-center py-5 border-0 bg-light">
                    <CardBody>
                      <IconifyIcon icon="ri:file-list-3-line" style={{ fontSize: '4rem', color: '#dee2e6' }} />
                      <h5 className="mt-3 text-muted">No assignments yet</h5>
                      <p className="text-muted">
                        {isTeacher 
                          ? 'Create your first assignment for students' 
                          : 'Your teacher hasn\'t posted any assignments yet'}
                      </p>
                      {isTeacher && (
                        <Button variant="primary" onClick={() => setShowAssignmentModal(true)}>
                          <IconifyIcon icon="ri:add-line" className="me-2" />
                          Create Assignment
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Due Date</th>
                        <th>Max Points</th>
                        <th>Teacher</th>
                        {isTeacher && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(assignment => (
                        <tr key={assignment.id}>
                          <td>
                            <div className="fw-bold">{assignment.title}</div>
                            <small className="text-muted">{assignment.description}</small>
                          </td>
                          <td>{new Date(assignment.due_date).toLocaleDateString()}</td>
                          <td>
                            <Badge bg="primary">{assignment.max_points}</Badge>
                          </td>
                          <td>{assignment.teacher_name}</td>
                          {isTeacher && (
                            <td>
                              <Button 
                                variant="link" 
                                className="text-danger p-0"
                                onClick={() => handleDeleteAssignment(assignment.id)}
                              >
                                <IconifyIcon icon="ri:delete-bin-line" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab.Pane>
              
              {/* People Tab */}
              <Tab.Pane eventKey="people">
                <h4 className="mb-4">
                  <IconifyIcon icon="ri:group-line" className="me-2" />
                  Students ({students.length})
                </h4>

                {students.length === 0 ? (
                  <Card className="text-center py-5 border-0 bg-light">
                    <CardBody>
                      <IconifyIcon icon="ri:group-line" style={{ fontSize: '4rem', color: '#dee2e6' }} />
                      <h5 className="mt-3 text-muted">No students enrolled yet</h5>
                      <p className="text-muted">Students will appear here when they join the course</p>
                    </CardBody>
                  </Card>
                ) : (
                  <Row>
                    {students.map((student) => (
                      <Col key={student.id} md={6} lg={4} className="mb-3">
                        <Card className="border-0 shadow-sm">
                          <CardBody>
                            <div className="d-flex align-items-center">
                              <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                   style={{ width: '48px', height: '48px' }}>
                                <IconifyIcon icon="ri:user-line" style={{ fontSize: '1.5rem' }} />
                              </div>
                              <div>
                                <h6 className="mb-0">{student.name}</h6>
                                <small className="text-muted">{student.email}</small>
                                {student.enrolled_at && (
                                  <div>
                                    <small className="text-muted">
                                      Enrolled: {new Date(student.enrolled_at).toLocaleDateString()}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </CardBody>
      </Card>

      {/* Create Announcement Modal */}
      <Modal show={showAnnouncementModal} onHide={() => setShowAnnouncementModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <IconifyIcon icon="ri:megaphone-line" className="me-2" />
            Create Announcement
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateAnnouncement}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Title</Form.Label>
              <Form.Control
                type="text"
                value={announcementData.title}
                onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                placeholder="Announcement title..."
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={announcementData.content}
                onChange={(e) => setAnnouncementData({ ...announcementData, content: e.target.value })}
                placeholder="Write your announcement..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAnnouncementModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <IconifyIcon icon="ri:send-plane-fill" className="me-2" />
              Post Announcement
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Create Assignment Modal */}
      <Modal show={showAssignmentModal} onHide={() => setShowAssignmentModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <IconifyIcon icon="ri:file-list-3-line" className="me-2" />
            Create Assignment
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateAssignment}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Title</Form.Label>
              <Form.Control
                type="text"
                value={assignmentData.title}
                onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                placeholder="Assignment title..."
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={assignmentData.description}
                onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                placeholder="Assignment instructions..."
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Due Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={assignmentData.dueDate}
                    onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Max Points</Form.Label>
                  <Form.Control
                    type="number"
                    value={assignmentData.maxPoints}
                    onChange={(e) => setAssignmentData({ ...assignmentData, maxPoints: e.target.value })}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAssignmentModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <IconifyIcon icon="ri:add-line" className="me-2" />
              Create Assignment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
