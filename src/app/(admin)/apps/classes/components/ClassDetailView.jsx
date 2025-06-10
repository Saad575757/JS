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

  // Mock data for assignments and grades
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Introduction to React',
      dueDate: '2023-11-15',
      points: 100,
      submitted: 15,
      totalStudents: 20,
      status: 'active',
      description: 'Create a simple React component that displays your name and a short bio.'
    },
    {
      id: 2,
      title: 'State Management',
      dueDate: '2023-11-22',
      points: 100,
      submitted: 8,
      totalStudents: 20,
      status: 'active',
      description: 'Implement a counter using useState and useEffect hooks.'
    },
    {
      id: 3,
      title: 'Final Project',
      dueDate: '2023-12-10',
      points: 200,
      submitted: 0,
      totalStudents: 20,
      status: 'draft',
      description: 'Build a complete React application with at least 3 components.'
    }
  ]);

  const [grades, setGrades] = useState([
    {
      studentId: 1,
      name: 'Ali Khan',
      assignments: [
        { id: 1, title: 'Introduction to React', score: 95, max: 100 },
        { id: 2, title: 'State Management', score: 88, max: 100 }
      ],
      overall: 91.5
    },
    {
      studentId: 2,
      name: 'Sara Ahmed',
      assignments: [
        { id: 1, title: 'Introduction to React', score: 100, max: 100 },
        { id: 2, title: 'State Management', score: 92, max: 100 }
      ],
      overall: 96.0
    },
    {
      studentId: 3,
      name: 'Usman Malik',
      assignments: [
        { id: 1, title: 'Introduction to React', score: 78, max: 100 },
        { id: 2, title: 'State Management', score: 85, max: 100 }
      ],
      overall: 81.5
    }
  ]);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    points: '',
    dueDate: '',
    topic: ''
  });

  // Fetch class data on component mount
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const token = localStorage.getItem('token');
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
        
        // Mock announcements data
        setAnnouncements([
          {
            id: 1,
            author: 'Saad khan',
            content: 'Welcome to our class! Please introduce yourself in the comments.',
            date: '2 days ago',
            comments: 5
          },
          {
            id: 2,
            author: 'Saad khan',
            content: 'First assignment will be posted tomorrow. Please check the Classwork tab.',
            date: '1 week ago',
            comments: 2
          }
        ]);
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
                                {announcement.author.split(' ').map(n => n[0]).join('')}
                              </div>
                            </div>
                            <div>
                              <div className="fw-bold">{announcement.author}</div>
                              <div className="text-muted small">{announcement.date}</div>
                            </div>
                          </div>
                          <p>{announcement.content}</p>
                          <div className="d-flex align-items-center">
                            <Button variant="link" className="p-0 text-decoration-none me-3">
                              <IconifyIcon icon="mdi:comment-outline" className="me-1" />
                              {announcement.comments} comments
                            </Button>
                            <Button variant="link" className="p-0 text-decoration-none">
                              <IconifyIcon icon="mdi:share-outline" className="me-1" />
                              Share
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                    
                    {/* Create Announcement */}
                    <Card className="border-0 shadow-sm">
                      <CardBody>
                        <h5>Announce something to your class</h5>
                        <p className="text-muted mb-3">
                          This is where you can talk to your class. Use the stream to share announcements, 
                          post assignments, and respond to student questions.
                        </p>
                        <Form.Group className="mb-3">
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="What would you like to announce?"
                            value={announcementText}
                            onChange={(e) => setAnnouncementText(e.target.value)}
                          />
                        </Form.Group>
                        <div className="d-flex justify-content-between align-items-center">
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={handleCreateAnnouncement}
                            disabled={!announcementText.trim()}
                          >
                            Post
                          </Button>
                          <Button variant="outline-secondary" size="sm">Stream settings</Button>
                        </div>
                      </CardBody>
                    </Card>
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
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          Filter: All topics
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item>All topics</Dropdown.Item>
                          <Dropdown.Item>React Basics</Dropdown.Item>
                          <Dropdown.Item>State Management</Dropdown.Item>
                          <Dropdown.Item>Component Lifecycle</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Due Date</th>
                          <th>Points</th>
                          <th>Status</th>
                          <th>Submissions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map(assignment => (
                          <tr key={assignment.id} onClick={() => {}} style={{cursor: 'pointer'}}>
                            <td>
                              <div className="fw-bold">{assignment.title}</div>
                              <small className="text-muted">{assignment.description.substring(0, 50)}...</small>
                            </td>
                            <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                            <td>{assignment.points}</td>
                            <td>
                              <Badge bg={assignment.status === 'draft' ? 'secondary' : 'success'}>
                                {assignment.status}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <ProgressBar 
                                  now={(assignment.submitted / assignment.totalStudents) * 100} 
                                  style={{width: '100px', height: '8px'}} 
                                  className="me-2" 
                                />
                                <small>{assignment.submitted}/{assignment.totalStudents}</small>
                              </div>
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
                    <div>
                      <Button variant="primary" size="sm" className="me-2">Add students</Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={handleInviteClick}
                      >
                        Invite students
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <InputGroup className="mb-3">
                      <FormControl
                        placeholder="Search for students"
                        aria-label="Search for students"
                      />
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" id="dropdown-filter">
                          Filter
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item>All students</Dropdown.Item>
                          <Dropdown.Item>Invited</Dropdown.Item>
                          <Dropdown.Item>Active</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </InputGroup>
                  </div>
                  
                  <Card className="border">
                    <CardBody className="text-center py-5">
                      <div className="mb-3">
                        <IconifyIcon icon="mdi:account-group" width={48} className="text-muted" />
                      </div>
                      <h5>Add students to this class</h5>
                      <p className="text-muted mb-3">You haven't added any students to this class yet</p>
                      <Button variant="primary" onClick={handleInviteClick}>Invite students</Button>
                    </CardBody>
                  </Card>
                </div>
              </Tab.Pane>
              
              {/* Grades Tab */}
              <Tab.Pane eventKey="grades" className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>Grades</h4>
                  <div>
                    <Button variant="outline-secondary" size="sm" className="me-2">
                      <IconifyIcon icon="mdi:download" className="me-1" />
                      Export
                    </Button>
                    <Button variant="primary" size="sm">
                      <IconifyIcon icon="mdi:cog" className="me-1" />
                      Settings
                    </Button>
                  </div>
                </div>
                
                <Card className="mb-4 border-0 shadow-sm">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Grade Summary</h5>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          All assignments
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {assignments.map(assignment => (
                            <Dropdown.Item key={assignment.id}>{assignment.title}</Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Student</th>
                          {assignments.filter(a => a.status !== 'draft').map(assignment => (
                            <th key={assignment.id}>{assignment.title}</th>
                          ))}
                          <th>Overall</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map(student => (
                          <tr key={student.studentId}>
                            <td className="fw-bold">{student.name}</td>
                            {assignments.filter(a => a.status !== 'draft').map(assignment => {
                              const studentAssignment = student.assignments.find(a => a.id === assignment.id);
                              return (
                                <td key={assignment.id}>
                                  {studentAssignment ? (
                                    <div>
                                      {studentAssignment.score}/{studentAssignment.max}
                                      <ProgressBar 
                                        now={(studentAssignment.score / studentAssignment.max) * 100} 
                                        variant={studentAssignment.score >= 90 ? 'success' : studentAssignment.score >= 70 ? 'warning' : 'danger'}
                                        style={{height: '5px'}} 
                                        className="mt-1" 
                                      />
                                    </div>
                                  ) : '-'}
                                </td>
                              );
                            })}
                            <td className="fw-bold">
                              {student.overall}%
                              <ProgressBar 
                                now={student.overall} 
                                variant={student.overall >= 90 ? 'success' : student.overall >= 70 ? 'warning' : 'danger'}
                                style={{height: '5px'}} 
                                className="mt-1" 
                              />
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
            </Tab.Content>
          </Tab.Container>
        </CardBody>
      </Card>
    </Container>
  );
}