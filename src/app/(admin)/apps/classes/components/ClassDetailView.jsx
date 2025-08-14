'use client';
import { 
  Button, Card, CardBody, CardHeader, CardTitle,
  Badge, Nav, Tab, Container, Alert, ListGroup,
  ListGroupItem, InputGroup, FormControl, Dropdown,
  Form, Col, Row, Modal, Table, ProgressBar
} from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

export default function ClassDetailView({ classId }) {
  // State management
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stream');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [meetLink, setMeetLink] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  // Assignments state (fetched from API)
  const [assignments, setAssignments] = useState([]);

  // Fetch assignments data
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${classId}/assignments`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Process dueDate and dueTime into a JS Date object (dueDateTime)
        const processAssignments = (arr) => arr.map(a => ({
          ...a,
          dueDateTime: a.dueDate && a.dueTime
            ? new Date(
                a.dueDate.year,
                a.dueDate.month - 1,
                a.dueDate.day,
                a.dueTime.hours,
                a.dueTime.minutes
              )
            : null
        }));
        if (Array.isArray(data)) {
          setAssignments(processAssignments(data));
        } else if (data && Array.isArray(data.assignments)) {
          setAssignments(processAssignments(data.assignments));
        } else {
          setAssignments([]);
        }
      } catch (err) {
        setAssignments([]);
        console.error('Fetch assignments error:', err);
      }
    };
    fetchAssignments();
  }, [classId]);

  const [grades, setGrades] = useState([]);

  // Fetch grades data
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classroom/${classId}/grades`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setGrades(data);
        } else if (data && Array.isArray(data.grades)) {
          setGrades(data.grades);
        } else {
          setGrades([]);
        }
      } catch (err) {
        setGrades([]);
        console.error('Fetch grades error:', err);
      }
    };
    fetchGrades();
  }, [classId]);
  const [students, setStudents] = useState([]);
  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const myHeaders = new Headers();
        myHeaders.append('Authorization', `Bearer ${token}`);

        const requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classroom/${classId}/enrolled-students`;
        console.log('Fetch students URL:', url);
        console.log('Fetch students token:', token);
        const response = await fetch(url, requestOptions);
        const text = await response.text();
        console.log('Raw students response:', text);
        try {
          const result = JSON.parse(text);
          if (Array.isArray(result)) {
            setStudents(result);
          } else if (result && Array.isArray(result.students)) {
            setStudents(result.students);
          } else {
            setStudents([]);
          }
        } catch (e) {
          setStudents([]);
        }
      } catch (err) {
        setStudents([]);
        console.error('Fetch students error:', err);
      }
    };
    fetchStudents();
  }, [classId]);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    points: '',
    dueDate: '',
    topic: ''
  });

  // Fetch class data and announcements on component mount
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch class data
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classroom/${classId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setClassData(result);

        // Fetch announcements
        const annRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classroom/${classId}/announcements`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (annRes.ok) {
          const annData = await annRes.json();
          // Support both array and object with announcements property
          if (Array.isArray(annData)) {
            setAnnouncements(annData);
          } else if (annData && Array.isArray(annData.announcements)) {
            setAnnouncements(annData.announcements);
          } else {
            setAnnouncements([]);
          }
        } else {
          setAnnouncements([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load class data');
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, [classId]);

  // Create a new announcement
  const handleCreateAnnouncement = () => {
    if (announcementText.trim()) {
      const newAnnouncement = {
        id: announcements.length + 1,
        author: 'You',
        content: announcementText,
        date: 'Just now',
        comments: 0
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      setAnnouncementText('');
    }
  };

  // Generate Google Meet link
  const generateMeetLink = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    const newLink = `https://meet.google.com/${randomId}`;
    setMeetLink(newLink);
  };

  // Open invite student modal
  const handleInviteClick = () => {
    setShowInviteModal(true);
    setEmail('');
    setEmailError('');
  };

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Send invitation via mailto
  const sendInvite = () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const classCode = classData.enrollmentCode || 'rxbevp33';
    const joinLink = `${window.location.origin}/join/${classCode}`;
    const subject = `Invitation to join ${classData.name} class`;
    const body = `Dear Student,\n\nYou have been invited to join the class "${classData.name}".\n\nPlease use this link to join: ${joinLink}\n\nClass Code: ${classCode}\n\nRegards,\n${classData.teacherName || 'Your Teacher'}`;

    // Open default email client with pre-filled email
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&cc=saad.khan@erptechnicals.com`;
    
    setShowInviteModal(false);
  };

  // Handle new assignment form changes
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new assignment
  const createAssignment = () => {
    if (newAssignment.title && newAssignment.dueDate) {
      const assignment = {
        id: assignments.length + 1,
        title: newAssignment.title,
        dueDate: newAssignment.dueDate,
        points: newAssignment.points || 100,
        submitted: 0,
        totalStudents: 20,
        status: 'active',
        description: newAssignment.description || 'No description provided.'
      };
      
      setAssignments([assignment, ...assignments]);
      setNewAssignment({
        title: '',
        description: '',
        points: '',
        dueDate: '',
        topic: ''
      });
      setShowAssignmentModal(false);
    }
  };

  // Calendar events state
  const [events, setEvents] = useState([]);

  // Fetch calendar events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        // Use calendarId from classData if available, fallback to default
        const calendarId = classData?.calendarId || 'c_classroomdf8d5062@group.calendar.google.com';
        const url = `https://class.xytek.ai/api/calendar/${calendarId}/events`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setEvents(data);
        } else if (data && Array.isArray(data.items)) {
          setEvents(data.items);
        } else {
          setEvents([]);
        }
      } catch (err) {
        setEvents([]);
        console.error('Fetch events error:', err);
      }
    };
    // Only fetch when classData is loaded
    if (classData) fetchEvents();
  }, [classData]);

  // Loading state
  if (loading) return <Container className="py-4">Loading...</Container>;
  
  // Error state
  if (error) return (
    <Container className="py-4">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  // No class data state
  if (!classData) return <Container className="py-4">Class not found</Container>;

  return (
    <Container className="py-4">
      {/* Invite Student Modal */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invite Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formStudentEmail">
            <Form.Label>Student Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter student's email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!emailError}
            />
            <Form.Control.Feedback type="invalid">
              {emailError}
            </Form.Control.Feedback>
          </Form.Group>
          <div className="mt-3">
            <small className="text-muted">
              This will open your email client to send an invitation from saad.khan@erptechnicals.com
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={sendInvite}>
            Open Email Client
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Assignment Modal */}
      <Modal show={showAssignmentModal} onHide={() => setShowAssignmentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group controlId="assignmentTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Assignment title"
                    name="title"
                    value={newAssignment.title}
                    onChange={handleAssignmentChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="assignmentPoints">
                  <Form.Label>Points</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="100"
                    name="points"
                    value={newAssignment.points}
                    onChange={handleAssignmentChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="assignmentDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Assignment description and instructions"
                name="description"
                value={newAssignment.description}
                onChange={handleAssignmentChange}
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="assignmentDueDate">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={newAssignment.dueDate}
                    onChange={handleAssignmentChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="assignmentTopic">
                  <Form.Label>Topic (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="E.g. React Hooks"
                    name="topic"
                    value={newAssignment.topic}
                    onChange={handleAssignmentChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignmentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={createAssignment}>
            Create Assignment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Class Card */}
      <Card className="mb-4 border-0 shadow-sm">
        {/* Card Header */}
        <CardHeader className="text-white rounded-top">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <CardTitle className="fs-3 mb-1">{classData.name}</CardTitle>
              <div className="text-white-50">
                {classData.section && <span>{classData.section}</span>}
                {classData.section && classData.room && <span> • </span>}
                {classData.room && <span>{classData.room}</span>}
                {classData.teacherFolder?.alternateLink && (
                  <a 
                    href={classData.teacherFolder.alternateLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="d-flex align-items-center gap-2 text-decoration-none mt-2"
                  >
                    <IconifyIcon icon="mdi:folder" width={30} />
                    <span>Google Drive</span>
                  </a>
                )}
              </div>
            </div>
            <Badge bg="light" text="dark" className="fs-6">
              Class code: {classData.enrollmentCode || 'rxbevp33'}
            </Badge>
          </div>
        </CardHeader>
        
        {/* Card Body with Tabs */}
        <CardBody className="p-0">
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            {/* Tab Navigation */}
            <Nav variant="tabs" className="px-3 pt-2">
              <Nav.Item>
                <Nav.Link eventKey="stream">Stream</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="classwork">Classwork</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="people">People</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="grades">Grades</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="calendar">Calendar</Nav.Link>
              </Nav.Item>
            </Nav>
            
            {/* Tab Content */}
            <Tab.Content className="border border-top-0 rounded-bottom">
              {/* Stream Tab */}
              <Tab.Pane eventKey="stream" className="p-4">
                <Row>
                  {/* Main Content Column */}
                  <Col lg={8}>
                    {/* Upcoming Section */}
                    <Card className="mb-4 border-0 shadow-sm">
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5>Upcoming</h5>
                          <Button 
                            variant={meetLink ? 'success' : 'outline-primary'} 
                            size="sm"
                            onClick={generateMeetLink}
                          >
                            {meetLink ? `Meet Link: ${meetLink}` : 'Generate Meet Link'}
                          </Button>
                        </div>
                        {meetLink ? (
                          <div className="mb-3">
                            <p>Next class meeting:</p>
                            <a href={meetLink} target="_blank" rel="noopener noreferrer">
                              {meetLink}
                            </a>
                          </div>
                        ) : (
                          <p className="text-muted">No work due soon</p>
                        )}
                        <Button variant="link" className="p-0 text-decoration-none">View all</Button>
                      </CardBody>
                    </Card>
                    
                    {/* Announcements List */}
                    {announcements.map(announcement => (
                      <Card key={announcement.id} className="mb-4 border-0 shadow-sm">
                        <CardBody>
                          <div className="d-flex mb-3">
                            <div className="me-3">
                              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                {announcement.creatorUserId ? announcement.creatorUserId.slice(-2).toUpperCase() : 'AN'}
                              </div>
                            </div>
                            <div>
                              <div className="fw-bold">{announcement.creatorUserId || 'Unknown'}</div>
                              <div className="text-muted small">{announcement.creationTime ? new Date(announcement.creationTime).toLocaleString() : ''}</div>
                            </div>
                          </div>
                          <p>{announcement.text}</p>
                          {/* Removed 'View in Google Classroom' button as requested */}
                        </CardBody>
                      </Card>
                    ))}

                  </Col>
                  
                  {/* Sidebar Column */}
                  <Col lg={4}>
                    {/* Class Details Card */}
                    <Card className="border-0 shadow-sm mb-4">
                      <CardBody>
                        <h6 className="mb-3">Class details</h6>
                        <div className="mb-3">
                          <div className="text-muted small">Class code</div>
                          <div className="fw-bold">{classData.enrollmentCode || 'rxbevp33'}</div>
                        </div>
                        <div className="mb-3">
                          <div className="text-muted small">Teacher</div>
                          <div className="fw-bold">Saad khan</div>
                        </div>
                        <div>
                          <div className="text-muted small">Schedule</div>
                          <div className="fw-bold">Mon, Wed, Fri • 10:00 AM</div>
                        </div>
                      </CardBody>
                    </Card>
                    
                    {/* Class Materials Card */}
                    <Card className="border-0 shadow-sm">
                      <CardBody>
                        <h6 className="mb-3">Class materials</h6>
                        <div className="d-flex align-items-center mb-2">
                          <IconifyIcon icon="mdi:file-document-outline" className="me-2" />
                          <span>Syllabus.pdf</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <IconifyIcon icon="mdi:file-pdf-box" className="me-2" />
                          <span>Reading List.pdf</span>
                        </div>
                        <Button variant="link" className="p-0 text-decoration-none">
                          View all materials
                        </Button>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>
              
              {/* Classwork Tab */}
              <Tab.Pane eventKey="classwork" className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>Classwork</h4>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAssignmentModal(true)}
                  >
                    <IconifyIcon icon="mdi:plus" className="me-1" />
                    Create
                  </Button>
                </div>
                
                <Card className="mb-4 border-0 shadow-sm">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Assignments</h5>
                    </div>
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Due Date</th>
                          <th>Max Points</th>
                          <th>Status</th>
                          <th>Materials</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map(assignment => (
                          <tr key={assignment.id} style={{cursor: 'pointer'}}>
                            <td>
                              <div className="fw-bold">{assignment.title}</div>
                              <small className="text-muted">{assignment.description ? assignment.description.substring(0, 50) + (assignment.description.length > 50 ? '...' : '') : ''}</small>
                            </td>
                            <td>
                              {assignment.dueDateTime
                                ? assignment.dueDateTime.toLocaleString()
                                : assignment.dueDate && assignment.dueDate.year
                                  ? `${assignment.dueDate.year}-${String(assignment.dueDate.month).padStart(2, '0')}-${String(assignment.dueDate.day).padStart(2, '0')}`
                                  : '—'}
                            </td>
                            <td>{assignment.maxPoints !== undefined ? assignment.maxPoints : '—'}</td>
                            <td>
                              <Badge bg={assignment.state === 'PUBLISHED' ? 'success' : 'secondary'}>
                                {assignment.state}
                              </Badge>
                            </td>
                            <td>
                              {assignment.materials && assignment.materials.length > 0 && assignment.materials[0].driveFile && assignment.materials[0].driveFile.driveFile ? (
                                <a href={assignment.materials[0].driveFile.driveFile.alternateLink} target="_blank" rel="noopener noreferrer">
                                  {assignment.materials[0].driveFile.driveFile.title}
                                </a>
                              ) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
                
                <Card className="border-0 shadow-sm">
                  <CardBody>
                    <h5 className="mb-3">Classwork Topics</h5>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge pill bg="light" text="dark" className="fs-6 p-2">
                        <IconifyIcon icon="mdi:plus" className="me-1" />
                        Add topic
                      </Badge>
                      <Badge pill bg="primary" className="fs-6 p-2">React Basics</Badge>
                      <Badge pill bg="primary" className="fs-6 p-2">State Management</Badge>
                      <Badge pill bg="primary" className="fs-6 p-2">Component Lifecycle</Badge>
                    </div>
                  </CardBody>
                </Card>
              </Tab.Pane>
              
              {/* People Tab */}
              <Tab.Pane eventKey="people" className="p-4">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Teachers</h4>
                  </div>
                  <ListGroup>
                    <ListGroupItem className="d-flex align-items-center">
                      <div className="me-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                          SK
                        </div>
                      </div>
                      <div>
                        <div className="fw-bold">Saad khan</div>
                        <div className="text-muted small">Owner</div>
                      </div>
                    </ListGroupItem>
                  </ListGroup>
                </div>

                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Students</h4>
                    
                  </div>
                  {/* No search field for students as requested */}
                  {students.length === 0 ? (
                    <Card className="border">
                      <CardBody className="text-center py-5">
                        <div className="mb-3">
                          <IconifyIcon icon="mdi:account-group" width={48} className="text-muted" />
                        </div>
                        <h5>No students found</h5>
                        <p className="text-muted mb-3">You haven&apos;t added any students to this class yet</p>
                        <Button variant="primary" onClick={handleInviteClick}>Invite students</Button>
                      </CardBody>
                    </Card>
                  ) : (
                    <ListGroup>
                      {students.map((student) => (
                        <ListGroupItem key={student.id || student.studentId} className="d-flex align-items-center">
                          <div className="me-3">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                              {student.name ? student.name.split(' ').map(n => n[0]).join('') : 'ST'}
                            </div>
                          </div>
                          <div>
                            <div className="fw-bold">{student.name || student.email}</div>
                            <div className="text-muted small">{student.email}</div>
                          </div>
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  )}
                </div>
              </Tab.Pane>
              
              {/* Grades Tab */}
              <Tab.Pane eventKey="grades" className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>Grades</h4>
                </div>
                <Card className="mb-4 border-0 shadow-sm">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Grade Summary</h5>
                    </div>
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Assignment</th>
                          <th>Grade</th>
                          <th>Max Points</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((grade, idx) => (
                          <tr key={idx}>
                            <td>{grade.studentId}</td>
                            <td>{grade.assignmentTitle}</td>
                            <td>{grade.grade !== undefined ? grade.grade : '—'}</td>
                            <td>{grade.maxPoints !== undefined ? grade.maxPoints : '—'}</td>
                            <td>
                              <Badge bg={grade.state === 'RETURNED' ? 'success' : grade.state === 'TURNED_IN' ? 'info' : 'secondary'}>
                                {grade.state}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
                
                <Card className="border-0 shadow-sm">
                  <CardBody>
                    <h5 className="mb-3">Grade Distribution</h5>
                    <div className="d-flex justify-content-between mb-3">
                      <div className="text-center">
                        <div className="fs-4 fw-bold">A</div>
                        <div className="text-muted small">90-100%</div>
                        <div className="fw-bold">5 students</div>
                      </div>
                      <div className="text-center">
                        <div className="fs-4 fw-bold">B</div>
                        <div className="text-muted small">80-89%</div>
                        <div className="fw-bold">8 students</div>
                      </div>
                      <div className="text-center">
                        <div className="fs-4 fw-bold">C</div>
                        <div className="text-muted small">70-79%</div>
                        <div className="fw-bold">4 students</div>
                      </div>
                      <div className="text-center">
                        <div className="fs-4 fw-bold">D</div>
                        <div className="text-muted small">60-69%</div>
                        <div className="fw-bold">2 students</div>
                      </div>
                      <div className="text-center">
                        <div className="fs-4 fw-bold">F</div>
                        <div className="text-muted small">Below 60%</div>
                        <div className="fw-bold">1 student</div>
                      </div>
                    </div>
                    <ProgressBar className="mb-3">
                      <ProgressBar variant="success" now={25} key={1} />
                      <ProgressBar variant="info" now={40} key={2} />
                      <ProgressBar variant="warning" now={20} key={3} />
                      <ProgressBar variant="danger" now={10} key={4} />
                      <ProgressBar variant="dark" now={5} key={5} />
                    </ProgressBar>
                  </CardBody>
                </Card>
              </Tab.Pane>

              {/* Calendar Tab */}
              <Tab.Pane eventKey="calendar">
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle as="h5" className="m-0">Calendar</CardTitle>
      </CardHeader>
      <CardBody>
        <FullCalendar
          plugins={[dayGridPlugin]} // Add more plugins as needed
          initialView="dayGridMonth" // Set the initial view (e.g., month, week, day)
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay' // Add other views
          }}
          events={events.map(event => ({
            id: event.id,
            title: event.summary || 'Untitled Event',
            start: event.start && event.start.dateTime,
            end: event.end && event.end.dateTime,
            description: event.description
          }))}
          eventContent={(arg) => {
            return (
              <div className="event-tooltip" title={arg.event.extendedProps.description}>
                <b>{arg.event.title}</b>
              </div>
            );
          }}
          // You can add more props and event handlers here
        />
      </CardBody>
    </Card>
  </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </CardBody>
      </Card>
    </Container>
  );
}