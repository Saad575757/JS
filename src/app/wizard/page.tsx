// // app/wizard/page.tsx
// 'use client';

// import { useState } from 'react';
// import { Card, Col, Container, Row, Form, Alert, Button, Badge, ProgressBar } from 'react-bootstrap';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// type TeacherData = {
//   name: string;
//   email: string;
//   phone: string;
// };

// type CompanyData = {
//   name: string;
//   email: string;
//   phone: string;
// };

// const steps = [
//   { id: 1, name: 'Teacher Info' },
//   { id: 2, name: 'Company Info' },
//   { id: 3, name: 'Review' }
// ];

// export default function WizardPage() {
//   const router = useRouter();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [teacherData, setTeacherData] = useState<TeacherData>({
//     name: '',
//     email: '',
//     phone: ''
//   });
//   const [companyData, setCompanyData] = useState<CompanyData>({
//     name: '',
//     email: '',
//     phone: ''
//   });

//   const handleNextTeacher = (data: TeacherData) => {
//     setTeacherData(data);
//     setCurrentStep(2);
//   };

//   const handleNextCompany = (data: CompanyData) => {
//     setCompanyData(data);
//     setCurrentStep(3);
//   };

//   const handleBack = () => {
//     setCurrentStep(prev => prev - 1);
//   };

//   const handleSkip = () => {
//     router.push('/dashboard');
//   };

//   const handleComplete = () => {
//     const allData = {
//       teacher: teacherData,
//       company: companyData
//     };
//     console.log('Wizard completed with data:', allData);
//     router.push('/dashboard');
//   };

//   return (
//     <Container className="my-5">
//       {/* Progress Indicator */}
//       <div className="mb-5">
//         <div className="d-flex justify-content-between mb-3">
//           {steps.map((step) => (
//             <div 
//               key={step.id}
//               className={`text-center ${step.id <= currentStep ? 'text-primary' : 'text-muted'}`}
//               style={{ width: `${100/steps.length}%` }}
//             >
//               <div className={`rounded-circle mx-auto mb-2 ${step.id <= currentStep ? 'bg-primary text-white' : 'bg-light'} d-flex align-items-center justify-content-center`} 
//                    style={{ width: '40px', height: '40px' }}>
//                 {step.id}
//               </div>
//               <h4>{step.name}</h4>
//             </div>
//           ))}
//         </div>
//         <ProgressBar now={(currentStep / steps.length) * 100} style={{ height: '4px' }} />
//       </div>

//       {/* Step 1 - Teacher Info */}
//       {currentStep === 1 && (
//         <TeacherInfoStep
//           onNext={handleNextTeacher}
//           onSkip={handleSkip}
//           initialData={teacherData}
//         />
//       )}

//       {/* Step 2 - Company Info */}
//       {currentStep === 2 && (
//         <CompanyInfoStep
//           onNext={handleNextCompany}
//           onBack={handleBack}
//           onSkip={handleSkip}
//           initialData={companyData}
//         />
//       )}

//       {/* Step 3 - Review */}
//       {currentStep === 3 && (
//         <ReviewStep
//           onComplete={handleComplete}
//           onBack={handleBack}
//           teacherData={teacherData}
//           companyData={companyData}
//         />
//       )}
//     </Container>
//   );
// }

// function TeacherInfoStep({
//   onNext,
//   onSkip,
//   initialData,
// }: {
//   onNext: (data: TeacherData) => void;
//   onSkip: () => void;
//   initialData: TeacherData;
// }) {
//   const [name, setName] = useState(initialData.name);
//   const [email, setEmail] = useState(initialData.email);
//   const [phone, setPhone] = useState(initialData.phone);

//   const handleSubmit = () => {
//     onNext({
//       name,
//       email,
//       phone
//     });
//   };

//   return (
//     <Card className="shadow">
//       <Card.Body>
//         <Card.Title as="h1" className="mb-4">Teacher Information</Card.Title>
//         <Card.Text className="text-muted mb-4">
//           Please provide the teacher's details.
//         </Card.Text>

//         <Form>
//           <Row className="mb-3">
//             <Form.Group as={Col} controlId="formTeacherName">
//               <Form.Label>Teacher Name:</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter teacher's full name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//               />
//             </Form.Group>
//           </Row>

//           <Row className="mb-3">
//             <Form.Group as={Col} controlId="formTeacherEmail">
//               <Form.Label>Teacher Email:</Form.Label>
//               <Form.Control
//                 type="email"
//                 placeholder="Enter teacher's email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </Form.Group>
//           </Row>

//           <Row className="mb-3">
//             <Form.Group as={Col} controlId="formTeacherPhone">
//               <Form.Label>Teacher Phone:</Form.Label>
//               <Form.Control
//                 type="tel"
//                 placeholder="Enter teacher's phone number"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//               />
//             </Form.Group>
//           </Row>
//         </Form>

//         <div className="d-flex justify-content-between mt-4">
//           <Button variant="outline-secondary" onClick={onSkip}>
//             Skip
//           </Button>
//           <Button variant="primary" onClick={handleSubmit}>
//             Next
//           </Button>
//         </div>
//       </Card.Body>
//     </Card>
//   );
// }

// function CompanyInfoStep({
//   onNext,
//   onBack,
//   onSkip,
//   initialData,
// }: {
//   onNext: (data: CompanyData) => void;
//   onBack: () => void;
//   onSkip: () => void;
//   initialData: CompanyData;
// }) {
//   const [name, setName] = useState(initialData.name);
//   const [email, setEmail] = useState(initialData.email);
//   const [phone, setPhone] = useState(initialData.phone);

//   const handleSubmit = () => {
//     onNext({
//       name,
//       email,
//       phone
//     });
//   };

//   return (
//     <Card className="shadow">
//       <Card.Body>
//         <Card.Title as="h1" className="mb-4">Company Information</Card.Title>
//         <Card.Text className="text-muted mb-4">
//           Please provide the company's details.
//         </Card.Text>

//         <Form>
//           <Row className="mb-3">
//             <Form.Group as={Col} controlId="formCompanyName">
//               <Form.Label>Company Name:</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter company name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//               />
//             </Form.Group>
//           </Row>

//           <Row className="mb-3">
//             <Form.Group as={Col} controlId="formCompanyEmail">
//               <Form.Label>Company Email:</Form.Label>
//               <Form.Control
//                 type="email"
//                 placeholder="Enter company email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </Form.Group>
//           </Row>

//           <Row className="mb-3">
//             <Form.Group as={Col} controlId="formCompanyPhone">
//               <Form.Label>Company Phone:</Form.Label>
//               <Form.Control
//                 type="tel"
//                 placeholder="Enter company phone number"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//               />
//             </Form.Group>
//           </Row>
//         </Form>

//         <div className="d-flex justify-content-between mt-4">
//           <div>
//             <Button variant="outline-secondary" onClick={onBack} className="me-2">
//               Back
//             </Button>
//             <Button variant="outline-secondary" onClick={onSkip}>
//               Skip
//             </Button>
//           </div>
//           <Button variant="primary" onClick={handleSubmit}>
//             Next
//           </Button>
//         </div>
//       </Card.Body>
//     </Card>
//   );
// }

// function ReviewStep({
//   onComplete,
//   onBack,
//   teacherData,
//   companyData,
// }: {
//   onComplete: () => void;
//   onBack: () => void;
//   teacherData: TeacherData;
//   companyData: CompanyData;
// }) {
//   return (
//     <Card className="shadow">
//       <Card.Body>
//         <Card.Title as="h1" className="mb-4">Review Information</Card.Title>
//         <Card.Text className="text-muted mb-4">
//           Please review the information before submitting.
//         </Card.Text>

//         <Card className="mb-4">
//           <Card.Header as="h5">Teacher Information</Card.Header>
//           <Card.Body>
//             <Row>
//               <Col md={4}>
//                 <div className="text-muted">Name</div>
//                 <div>{teacherData.name || <span className="text-muted">Not provided</span>}</div>
//               </Col>
//               <Col md={4}>
//                 <div className="text-muted">Email</div>
//                 <div>{teacherData.email || <span className="text-muted">Not provided</span>}</div>
//               </Col>
//               <Col md={4}>
//                 <div className="text-muted">Phone</div>
//                 <div>{teacherData.phone || <span className="text-muted">Not provided</span>}</div>
//               </Col>
//             </Row>
//           </Card.Body>
//         </Card>

//         <Card className="mb-4">
//           <Card.Header as="h5">Company Information</Card.Header>
//           <Card.Body>
//             <Row>
//               <Col md={4}>
//                 <div className="text-muted">Name</div>
//                 <div>{companyData.name || <span className="text-muted">Not provided</span>}</div>
//               </Col>
//               <Col md={4}>
//                 <div className="text-muted">Email</div>
//                 <div>{companyData.email || <span className="text-muted">Not provided</span>}</div>
//               </Col>
//               <Col md={4}>
//                 <div className="text-muted">Phone</div>
//                 <div>{companyData.phone || <span className="text-muted">Not provided</span>}</div>
//               </Col>
//             </Row>
//           </Card.Body>
//         </Card>

//         <div className="d-flex justify-content-between mt-4">
//           <Button variant="outline-secondary" onClick={onBack}>
//             Back
//           </Button>
//           <Button variant="primary" onClick={onComplete}>
//             Submit
//           </Button>
//         </div>
//       </Card.Body>
//     </Card>
//   );
// }

// app/wizard/page.tsx
// app/wizard/page.tsx
// app/wizard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Col, Container, Row, Form, Alert, Button, ProgressBar } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

type TeacherData = {
  name: string;
  email: string;
  phone: string;
};

type CompanyData = {
  name: string;
  email: string;
  phone: string;
};

const steps = [
  { id: 1, name: 'Teacher Info' },
  { id: 2, name: 'Company Info' },
  { id: 3, name: 'Review' }
];

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/company`;

export default function WizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [teacherData, setTeacherData] = useState<TeacherData>({
    name: '',
    email: '',
    phone: ''
  });
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [checkingCompany, setCheckingCompany] = useState(false);

  useEffect(() => {
    // Extract all parameters from URL
    const urlToken = searchParams.get('token');
    const urlTeacherId = searchParams.get('sub');
    const urlName = searchParams.get('name');
    const urlEmail = searchParams.get('email');
    const urlRole = searchParams.get('role');
    const urlPicture = searchParams.get('picture');

    // Save role, picture, name, and email in localStorage for header/profile usage
    if (urlRole) {
      localStorage.setItem('role', urlRole);
    }
    if (urlPicture) {
      localStorage.setItem('picture', urlPicture);
    }
    if (urlName) {
      localStorage.setItem('name', decodeURIComponent(urlName));
    }
    if (urlEmail) {
      localStorage.setItem('email', decodeURIComponent(urlEmail));
    }

    // Only allow teachers to use wizard, others redirect to dashboard
    if (urlRole && urlRole !== 'teacher') {
      setError('Only teachers can access this page');
      router.push('/dashboard');
      return;
    }

    // If teacher, extract and save wizard URL data
    if (urlRole === 'teacher') {
      if (urlToken) {
        setToken(urlToken);
        localStorage.setItem('token', urlToken);
      }
      if (urlTeacherId) {
        setTeacherId(urlTeacherId);
        localStorage.setItem('teacherId', urlTeacherId);
      }
      // Set teacher data from URL params
      const newTeacherData = {
        name: urlName ? decodeURIComponent(urlName) : '',
        email: urlEmail ? decodeURIComponent(urlEmail) : '',
        phone: ''
      };
      setTeacherData(newTeacherData);
      localStorage.setItem('teacherData', JSON.stringify(newTeacherData));
    }
  }, [searchParams, router]);

  // When we have a token, verify if company exists / user already completed setup.
  useEffect(() => {
    const checkCompany = async () => {
      const localToken = token || localStorage.getItem('token');
      console.log('checkCompany: token from state/localStorage ->', localToken);
      if (!localToken) return;

      setCheckingCompany(true);

      try {
        const myHeaders = new Headers();
        myHeaders.append('Authorization', `Bearer ${localToken}`);

        const requestOptions: RequestInit = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };

        console.log('checkCompany: sending request to', `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/company/get`, requestOptions);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/company/get`, requestOptions);
        console.log('checkCompany: response status', res.status, res.statusText);
        const text = await res.text();
        let data: any = undefined;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          // not JSON
          console.warn('checkCompany: response not JSON, raw text:', text);
        }
        console.log('checkCompany: parsed data ->', data);

        // If API indicates success, navigate to dashboard
        if (data && data.success === true) {
          console.log('checkCompany: success true, navigating to /dashboard');
          router.push('/dashboard');
        } else {
          console.log('checkCompany: success !== true, remain on wizard');
        }
      } catch (err) {
        // log and stay on wizard
        console.error('Company check failed', err);
      } finally {
        setCheckingCompany(false);
      }
    };

    checkCompany();
  }, [token, router]);

  const handleNextTeacher = (data: TeacherData) => {
    setTeacherData(data);
    localStorage.setItem('teacherData', JSON.stringify(data));
    setCurrentStep(2);
  };

  const handleNextCompany = (data: CompanyData) => {
    setCompanyData(data);
    localStorage.setItem('companyData', JSON.stringify(data));
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleComplete = async () => {
    if (!token) {
      setError('Authentication token is missing');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const requestData = {
        teacher_id: teacherId,
        company_name: companyData.name,
        company_email: companyData.email,
        company_phone: companyData.phone,
        teacher_name: teacherData.name,
        teacher_email: teacherData.email,
        teacher_phone: teacherData.phone
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit data');
      }

      // Clear local storage after successful submission
      localStorage.removeItem('teacherData');
      localStorage.removeItem('companyData');
      
      router.push('/dashboard');
    } catch (err) {
      console.error('Submission error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to submit data. Please try again.');
      } else {
        setError('Failed to submit data. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="my-5">
      {checkingCompany && (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
          <Card className="shadow text-center p-4" style={{ width: 360 }}>
            <Card.Body>
              <div className="mb-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              <Card.Title>Checking account...</Card.Title>
              <Card.Text className="text-muted">Please wait while we verify your account status.</Card.Text>
            </Card.Body>
          </Card>
        </div>
      )}
      {/* Progress Indicator */}
      <div className="mb-5">
        <div className="d-flex justify-content-between mb-3">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`text-center ${step.id <= currentStep ? 'text-primary' : 'text-muted'}`}
              style={{ width: `${100/steps.length}%` }}
            >
              <div className={`rounded-circle mx-auto mb-2 ${step.id <= currentStep ? 'bg-primary text-white' : 'bg-light'} d-flex align-items-center justify-content-center`} 
                   style={{ width: '40px', height: '40px' }}>
                {step.id}
              </div>
              <h4>{step.name}</h4>
            </div>
          ))}
        </div>
        <ProgressBar now={(currentStep / steps.length) * 100} style={{ height: '4px' }} />
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Step Components */}
      {currentStep === 1 && (
        <TeacherInfoStep
          onNext={handleNextTeacher}
          onSkip={handleSkip}
          initialData={teacherData}
        />
      )}

      {currentStep === 2 && (
        <CompanyInfoStep
          onNext={handleNextCompany}
          onBack={handleBack}
          onSkip={handleSkip}
          initialData={companyData}
        />
      )}

      {currentStep === 3 && (
        <ReviewStep
          onComplete={handleComplete}
          onBack={handleBack}
          teacherData={teacherData}
          companyData={companyData}
          isSubmitting={isSubmitting}
        />
      )}
    </Container>
  );
}

function TeacherInfoStep({
  onNext,
  onSkip,
  initialData,
}: {
  onNext: (data: TeacherData) => void;
  onSkip: () => void;
  initialData: TeacherData;
}) {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone);
  const [errors, setErrors] = useState<Partial<TeacherData>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData.name) setName(initialData.name);
    if (initialData.email) setEmail(initialData.email);
  }, [initialData]);

  const validate = () => {
    const newErrors: Partial<TeacherData> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email format';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext({
        name,
        email,
        phone
      });
    }
  };

  const handleFieldClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <Card className="shadow">
      <Card.Body>
        <Card.Title as="h1" className="mb-4">Teacher Information</Card.Title>
        <Card.Text className="text-muted mb-4">
          Your information has been pre-filled. Please review and update if needed.
        </Card.Text>

        <Form>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formTeacherName">
              <Form.Label>Teacher Name:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter teacher's full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setIsEditing(true);
                }}
                onClick={handleFieldClick}
                isInvalid={!!errors.name}
                required
                readOnly={!isEditing && !!initialData.name}
                className={!isEditing && initialData.name ? 'bg-light' : ''}
              />
              {/* {!isEditing && initialData.name && (
                <Form.Text className="text-muted">
                  Click to edit
                </Form.Text>
              )} */}
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formTeacherEmail">
              <Form.Label>Teacher Email:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter teacher's email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEditing(true);
                }}
                onClick={handleFieldClick}
                isInvalid={!!errors.email}
                required
                readOnly={!isEditing && !!initialData.email}
                className={!isEditing && initialData.email ? 'bg-light' : ''}
              />
              {/* {!isEditing && initialData.email && (
                <Form.Text className="text-muted">
                  Click to edit
                </Form.Text>
              )} */}
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formTeacherPhone">
              <Form.Label>Teacher Phone:</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter teacher's phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Form.Text className="text-muted">
                Optional
              </Form.Text>
            </Form.Group>
          </Row>
        </Form>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="outline-secondary" onClick={onSkip}>
            Skip
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Next
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

function CompanyInfoStep({
  onNext,
  onBack,
  onSkip,
  initialData,
}: {
  onNext: (data: CompanyData) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData: CompanyData;
}) {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone);
  const [errors, setErrors] = useState<Partial<CompanyData>>({});

  const validate = () => {
    const newErrors: Partial<CompanyData> = {};
    if (!name.trim()) newErrors.name = 'Company name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email format';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext({
        name,
        email,
        phone
      });
    }
  };

  return (
    <Card className="shadow">
      <Card.Body>
        <Card.Title as="h1" className="mb-4">Company Information</Card.Title>
        <Card.Text className="text-muted mb-4">
          Please provide the company&apos;s details.
        </Card.Text>

        <Form>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formCompanyName">
              <Form.Label>Company Name:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter company name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formCompanyEmail">
              <Form.Label>Company Email:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter company email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!errors.email}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formCompanyPhone">
              <Form.Label>Company Phone:</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter company phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Form.Text className="text-muted">
                Optional
              </Form.Text>
            </Form.Group>
          </Row>
        </Form>

        <div className="d-flex justify-content-between mt-4">
          <div>
            <Button variant="outline-secondary" onClick={onBack} className="me-2">
              Back
            </Button>
            <Button variant="outline-secondary" onClick={onSkip}>
              Skip
            </Button>
          </div>
          <Button variant="primary" onClick={handleSubmit}>
            Next
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

function ReviewStep({
  onComplete,
  onBack,
  teacherData,
  companyData,
  isSubmitting,
}: {
  onComplete: () => void;
  onBack: () => void;
  teacherData: TeacherData;
  companyData: CompanyData;
  isSubmitting: boolean;
}) {
  return (
    <Card className="shadow">
      <Card.Body>
        <Card.Title as="h1" className="mb-4">Review Information</Card.Title>
        <Card.Text className="text-muted mb-4">
          Please review the information before submitting.
        </Card.Text>

        <Card className="mb-4">
          <Card.Header as="h5">Teacher Information</Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="text-muted">Name</div>
                <div>{teacherData.name || <span className="text-muted">Not provided</span>}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted">Email</div>
                <div>{teacherData.email || <span className="text-muted">Not provided</span>}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted">Phone</div>
                <div>{teacherData.phone || <span className="text-muted">Not provided</span>}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header as="h5">Company Information</Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="text-muted">Name</div>
                <div>{companyData.name || <span className="text-muted">Not provided</span>}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted">Email</div>
                <div>{companyData.email || <span className="text-muted">Not provided</span>}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted">Phone</div>
                <div>{companyData.phone || <span className="text-muted">Not provided</span>}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="outline-secondary" onClick={onBack}>
            Back
          </Button>
          <Button 
            variant="primary" 
            onClick={onComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : 'Submit'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}