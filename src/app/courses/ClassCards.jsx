import { useState } from 'react';
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
  FloatingLabel 
} from 'react-bootstrap';

const ClassCards = () => {
  const [showForm, setShowForm] = useState(false);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    subject: 'SQL', // Default as shown in your example
    room: '',
    teacherName: 'Hannan Naqvi',
    time: 'AM'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.className) return;
    
    const newClass = {
      id: Date.now(),
      ...formData
    };
    
    setClasses(prev => [...prev, newClass]);
    setFormData({
      className: '',
      section: '',
      subject: 'SQL',
      room: '',
      teacherName: 'Hannan Naqvi',
      time: 'AM'
    });
    setShowForm(false);
  };

  return (
    <div className="p-4 position-relative" style={{ minHeight: '100vh' }}>
      <Row xs={1} md={2} lg={3} className="g-4 mb-5">
        {classes.map((classItem) => (
          <Col key={classItem.id}>
            <Card className="h-100 shadow-sm">
              <CardHeader className="d-flex justify-content-between bg-white">
                <span className="fw-bold text-primary">{classItem.subject}</span>
                <span className="text-muted">{classItem.time}</span>
              </CardHeader>
              <CardBody>
                <CardTitle className="fs-4">{classItem.className}</CardTitle>
                <p className="text-muted">{classItem.teacherName}</p>
              </CardBody>
              {(classItem.section || classItem.room) && (
                <CardFooter className="d-flex justify-content-between bg-white text-muted small">
                  {classItem.section && <span>Section: {classItem.section}</span>}
                  {classItem.room && <span>Room: {classItem.room}</span>}
                </CardFooter>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Floating Action Button */}
      <Button 
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
        onClick={() => setShowForm(true)}
      >
        +
      </Button>

      {/* Form Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create class</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <FloatingLabel controlId="className" label="Class name (required)" className="mb-3">
              <Form.Control
                type="text"
                name="className"
                value={formData.className}
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
                <FloatingLabel controlId="subject" label="Subject">
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Subject"
                  />
                </FloatingLabel>
              </Col>
            </Row>

            <Row className="g-2 mb-3">
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
              <Col md>
                <FloatingLabel controlId="time" label="Time">
                  <Form.Control
                    type="text"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    placeholder="Time"
                  />
                </FloatingLabel>
              </Col>
            </Row>

            <FloatingLabel controlId="teacherName" label="Teacher Name" className="mb-3">
              <Form.Control
                type="text"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleInputChange}
                placeholder="Teacher Name"
              />
            </FloatingLabel>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassCards;