// import { Col, Row } from 'react-bootstrap';
// import Board from './Components/Board';
// import { KanbanProvider } from '@/context/useKanbanContext';
// import KanbanModal from './Components/Modal';
// import PageTitle from '@/components/PageTitle';
// export const metadata = {
//   title: 'Kanban Board'
// };
// const KanbanBoard = () => {
//   return <>
//       <PageTitle title="Kanban" />
//       <Row>
//         <Col xs={12}>
//           <KanbanProvider>
//             <Board />
//             <KanbanModal />
//           </KanbanProvider>
//         </Col>
//       </Row>
//     </>;
// };
// export default KanbanBoard;

'use client';
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  Button, 
  Modal, 
  Form, 
  Row, 
  Col,
  FloatingLabel,
  Alert,
  Dropdown
} from 'react-bootstrap';

const ClassCards = () => {
  const [showForm, setShowForm] = useState(false);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    descriptionHeading: 'Welcome',
    description: '',
    room: ''
  });

  const getClassroomData = async () => {
    try {
      const token = localStorage.getItem('token');
      const myHeaders = new Headers();
      myHeaders.append('Authorization', `Bearer ${token}`);
      myHeaders.append('Content-Type', 'application/json');
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classroom/courses/`, {
        method: 'GET',
        headers: myHeaders,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Classroom data:', result);
      setClasses(result);
    } catch (error) {
      console.error('Error fetching classroom data:', error);
      setError('Failed to fetch classroom data');
    }
  };
  
  useEffect(() => {
    getClassroomData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      let url, method;

      if (isEditing) {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classroom/${currentClassId}`;
        method = 'PATCH';
      } else {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classroom/`;
        method = 'POST';
      }

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
        throw new Error(errorData.message || 
          (isEditing ? 'Failed to update classroom' : 'Failed to create classroom'));
      }

      const result = await response.json();
      
      if (isEditing) {
        setClasses(prev => prev.map(cls => 
          cls.id === currentClassId || cls._id === currentClassId ? result : cls
        ));
        setSuccess('Classroom updated successfully!');
      } else {
        setClasses(prev => [...prev, result]);
        setSuccess('Classroom created successfully!');
      }
      
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

  const handleCopy = (classItem) => {
    console.log('Copying:', classItem.id);
    // Implement copy functionality here
  };

  const handleMove = (classItem) => {
    console.log('Moving:', classItem.id);
    // Implement move functionality here
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

      setClasses(prev => prev.filter(cls => 
        (cls.id !== classId && cls._id !== classId)
      ));
      setSuccess('Classroom archived successfully!');
    } catch (err) {
      setError(err.message || 'Failed to archive classroom');
    } finally {
      setArchiveLoading(false);
    }
  };

  return (
    <div className="p-4 position-relative" style={{ minHeight: '100vh' }}>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      <Row xs={1} md={2} lg={3} className="g-4 mb-5">
        {classes
        .filter(classItem => classItem.courseState == "ARCHIVED")
        .map((classItem) => (
          <Col key={classItem.id || classItem._id}>
            <Card className="h-100 shadow-sm">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-primary">{classItem.descriptionHeading || 'Class'}</span>
                <Dropdown>
                  <Dropdown.Toggle 
                    variant="link" 
                    id={`dropdown-${classItem.id || classItem._id}`}
                    className="text-dark p-0 shadow-none"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleEdit(classItem)}>
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleCopy(classItem)}>
                      Copy
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleMove(classItem)}>
                      Move
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
              </CardHeader>
              <CardBody>
                <CardTitle className="fs-4">{classItem.name}</CardTitle>
                <p className="text-muted">{classItem.description || 'No description provided'}</p>
              </CardBody>
              {(classItem.section || classItem.room) && (
                <CardFooter className="d-flex justify-content-between text-muted small">
                  {classItem.section && <span>Section: {classItem.section}</span>}
                  {classItem.room && <span>Room: {classItem.room}</span>}
                </CardFooter>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Floating Action Button */}
      {/* <Button 
        variant="primary" 
        className="position-fixed rounded-circle p-0" 
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
      </Button> */}

      {/* Form Modal */}
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
};

export default ClassCards;