// import { Col, Row } from 'react-bootstrap';
// import Stats from './components/Stats';
// import MerchantList from './components/MerchantList';
// import { merchantListData } from './data';
// import RevenueChart from './components/RevenueChart';
// import OrderStatus from './components/OrderStatus';
// import RecentOrders from './components/RecentOrders';
// import PageTitle from '@/components/PageTitle';
// const Dashboard = () => {
//   return <>
//       <PageTitle title="Dashboard" />
//       <Stats />
//       <Row>
//         <Col lg={4} className="order-2 order-lg-1">
//           <MerchantList merchants={merchantListData} />
//         </Col>
//         <Col lg={8} className="order-1 order-lg-2">
//           <RevenueChart />
//         </Col>
//       </Row>
//       <Row>
//         <Col xxl={4} className="order-1 order-lg-2">
//           <OrderStatus />
//         </Col>
//         <Col xxl={8} className="order-2 order-lg-1">
//           <RecentOrders />
//         </Col>
//       </Row>
//     </>;
// };
// export default Dashboard;
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  CardBody, 
  Button, 
  Form, 
  Spinner,
  Alert,
  InputGroup,
  OverlayTrigger, 
  Tooltip,
  Dropdown,
  Badge,
  ListGroup,
  Modal,
  ProgressBar
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import FormattedMessage from '@/components/FormattedMessage';
import './chat-responsive.css';
import { uploadFile, createAssignment } from '@/lib/api/courses';
import { v4 as uuidv4 } from 'uuid'; // install with: npm install uuid
import { getToken } from '@/lib/auth/tokenManager';
// Prompt Suggestions Component (defined in the same file)
function PromptSuggestions({ onPromptSelect, isLoading, role }) {
  // Role-specific prompt lists
  const teacherItems = [
    "Create a new class",
    "Add a student to my class",
    "Post an announcement to my class",
    "Share a classroom join link",
    "Create an assignment for the Class, due next Monday",
    "Show submission status for today’s assignment",
    "Who has not submitted their assignment?"
  ];

  const studentItems = [
    "List all my subjects.",
    "Explain what SQL is.",
    "List my pending assignments by course.",
    "How do I submit an assignment?",
    "I can't upload my homework. Help!",
    "How many assignments did I complete this month?"
  ];

  const defaultPromptCategories = [
    {
      title: "Course Management",
      prompts: [
        {
          level: "Basic",
          items: [
            "Create a new class.",
            "Add a student to my class.",
            "Share a classroom join link."
          ]
        },
        {
          level: "Intermediate",
          items: [
            "Create an assignment for the Grade SQL Class, due next Monday."
          ]
        },
        {
          level: "Advanced",
          items: [
            "Export assignment data to a spreadsheet.",
            "Grade this multiple-choice SQL quiz."
          ]
        }
      ]
    },
    {
      title: "Assignments & Quizzes",
      prompts: [
        {
          level: "Basic",
          items: [
            "Post an announcement to my Grade SQL class."
          ]
        },
        {
          level: "Intermediate",
          items: [
            "Show submission status for today's assignment.",
            "Who has not submitted their assignment?",
            "Send a reminder to all students for tomorrow's quiz."
          ]
        },
        {
          level: "Advanced",
          items: [
            "Highlight students with missing work across multiple classes."
          ]
        }
      ]
    },
    {
      title: "Feedback & Communication",
      prompts: [
        {
          level: "Intermediate",
          items: [
            "Draft a feedback message for a student who did well."
          ]
        }
      ]
    },
    {
      title: "Grades & Performance",
      prompts: [
        {
          level: "Advanced",
          items: [
            "Generate a performance report for all students in SQL Class."
          ]
        }
      ]
    }
  ];

  let promptCategories;
  if (role === 'teacher') {
    promptCategories = [
      {
        title: 'Teacher Module',
        prompts: [
          { level: 'Common', items: teacherItems }
        ]
      }
    ];
  } else if (role === 'student') {
    promptCategories = [
      {
        title: 'Student Module',
        prompts: [
          { level: 'Common', items: studentItems }
        ]
      }
    ];
  } else {
    promptCategories = defaultPromptCategories;
  }

  return (
    <div className="mb-3">
      <h6 className="mb-2">Prompt Suggestions</h6>
      <div className="d-flex flex-wrap gap-2">
        {promptCategories.map((category, catIndex) => (
          <Dropdown key={catIndex} className="me-2 rounded-3" >
            <Dropdown.Toggle variant="outline-primary" size="sm" disabled={isLoading} className="rounded-3">
              {category.title}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 rounded-3" style={{ minWidth: '300px' }}>
              <div className="px-2 py-1">
                {category.prompts.map((levelGroup, levelIndex) => (
                  <div key={levelIndex} className="mb-2">
                    <small className="text-muted fw-bold">{levelGroup.level}</small>
                    {levelGroup.items.map((prompt, promptIndex) => {
                      const tooltip = (
                        <Tooltip id={`tooltip-${catIndex}-${levelIndex}-${promptIndex}`}>
                          {prompt}
                        </Tooltip>
                      );

                      return (
                        <OverlayTrigger
                          key={`${catIndex}-${levelIndex}-${promptIndex}`}
                          placement="right"
                          overlay={tooltip}
                          delay={{ show: 250, hide: 400 }}
                        >
                          <Dropdown.Item 
                            onClick={() => onPromptSelect(prompt)}
                            className="small py-1 border-5 rounded-3"
                            style={{ cursor: 'pointer' }}
                          >
                            {prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt}
                          </Dropdown.Item>
                        </OverlayTrigger>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Dropdown.Menu>
          </Dropdown>
        ))}
      </div>
    </div>
  );
}

export default function ChatInput() {
  // Extract token, role, name, email, picture from URL and save to localStorage if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      const token = params.get('token');
      const role = params.get('role');
      const name = params.get('name');
      const email = params.get('email');
      const picture = params.get('picture');
      if (token) localStorage.setItem('token', token);
      if (role) localStorage.setItem('role', role);
      if (name) localStorage.setItem('name', name);
      if (email) localStorage.setItem('email', email);
      if (picture) localStorage.setItem('picture', picture);
      // Console log the values for debugging
      console.log('Dashboard extracted values:', {
        token: token || getToken(),
        role: role || localStorage.getItem('role'),
        name: name || localStorage.getItem('name'),
        email: email || localStorage.getItem('email'),
        picture: picture || localStorage.getItem('picture'),
      });
    }
  }, []);

  // Derived flag: detect Super Admin in several possible formats
  // NOTE: `isSuperAdmin` is declared after `role` state to avoid TDZ errors.

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi, I am Classroom Assistant.", time: new Date() },
    { sender: 'bot', text: "How can I help you today?", time: new Date() }
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [voiceModeStatus, setVoiceModeStatus] = useState('idle'); // idle | recording | processing | playing
  const [voiceModeError, setVoiceModeError] = useState(null);
  const [voiceModeTranscript, setVoiceModeTranscript] = useState('');
  const [recognitionLang, setRecognitionLang] = useState('en-US'); // New: language for speech recognition
  const [userNames, setUserNames] = useState({}); // userId -> name
  const [role, setRole] = useState(null);
  const [pendingAttachment, setPendingAttachment] = useState(null); // {assignmentData, file}
  const [uploadingFile, setUploadingFile] = useState(false);
  // Derived flag: detect Super Admin in several possible formats
  const isSuperAdmin = !!(role && role.toString().toLowerCase().replace(/[_-\s]/g, '') === 'superadmin');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceModeTimeoutRef = useRef(null);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    // Speech Synthesis (TTS)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const availableVoices = synthRef.current.getVoices();
        setVoices(availableVoices);
        const defaultVoice = availableVoices.find(v => 
          v.lang.includes('en') && v.name.includes('Female')
        ) || availableVoices[0];
        setVoice(defaultVoice);
      };
      
      synthRef.current.onvoiceschanged = loadVoices;
      loadVoices();
    } else {
      console.warn('Text-to-speech not supported in this browser');
    }

    // Speech Recognition (STT)
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = recognitionLang; // Use selected language

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
    
    return () => {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, recognitionLang]);

  // Load role from localStorage so PromptSuggestions can use it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('role');
      if (stored) setRole(stored);
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Speech functions
  const speak = (text) => {
    if (!synthRef.current || !voice) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('SpeechSynthesis error:', event);
      setIsSpeaking(false);
    };
    
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSpeech = (text) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    recognitionRef.current.lang = recognitionLang; // Set language before starting
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setMessage(''); // Clear the input when starting new recording
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Load conversationId from localStorage on mount
useEffect(() => {
  const storedId = localStorage.getItem('conversationId');
  if (storedId) {
    setConversationId(storedId);
  }
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!message.trim()) return;
  
  setIsLoading(true);
  setError(null);
  
  const userMessage = { sender: 'user', text: message, time: new Date() };
  setMessages(prev => [...prev, userMessage]);
  const currentMessage = message;
  setMessage('');
  
  try {
    const token = getToken();

    // ✅ Generate or reuse conversationId
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      currentConversationId = uuidv4(); // generate random id
      setConversationId(currentConversationId);
      localStorage.setItem('conversationId', currentConversationId);
      console.log('[AI DEBUG] Generated new conversationId:', currentConversationId);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/message`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: currentMessage,
        conversationId: currentConversationId
      })
    });

    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    
    const data = await res.json();
    console.log('[AI DEBUG] API response data:', data);

    // Process the response data to remove asterisks
    if (data.message) {
      data.message = removeAsterisks(data.message);
    }
    if (data.response?.message) {
      data.response.message = removeAsterisks(data.response.message);
    }
    if (data.response?.nextSteps) {
      data.response.nextSteps = removeAsterisks(data.response.nextSteps);
    }

    const botResponse = {
      sender: 'bot',
      data: data,
      time: new Date(),
      type: 'structured'
    };
    setMessages(prev => [...prev, botResponse]);

    if (data.response?.message) {
      speak(data.response.message);
    } else if (data.response) {
      speak("Here is the information you requested.");
    }

    if (data.response?.nextSteps) {
      setTimeout(() => {
        const nextStepsMessage = {
          sender: 'bot',
          text: data.response.nextSteps,
          time: new Date(),
          type: 'nextSteps'
        };
        setMessages(prev => [...prev, nextStepsMessage]);
        speak(data.response.nextSteps);
      }, 1000);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    setError(error.message || 'Failed to send message');
    setMessages(prev => [...prev, { 
      sender: 'bot', 
      text: "I encountered an error. Please try again.", 
      time: new Date(),
      type: 'text'
    }]);
    speak("Sorry, I encountered an error. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  const handlePromptSelect = (promptText) => {
    setMessage(promptText);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSubmit(fakeEvent);
    }, 50);
  };

  // Reset conversation: call external reset API, clear UI state and localStorage, and log responses
  const handleReset = async () => {
    setIsResetting(true);
    try {
      const token = getToken();
      console.log('[AI DEBUG] Resetting conversationId:', conversationId);

      const res = await fetch('https://class.xytek.ai/api/ai/reset', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversationId: conversationId || undefined })
      });

      let data = null;
      try { data = await res.json(); } catch (e) { data = await res.text().catch(() => null); }
      console.log('[AI DEBUG] Reset API status:', res.status, 'response:', data);

      // Clear conversation state in UI
      setConversationId('');
      localStorage.removeItem('conversationId');
      setMessages([
        { sender: 'bot', text: "Hi, I am Classroom Assistant.", time: new Date() },
        { sender: 'bot', text: "How can I help you today?", time: new Date() }
      ]);
    } catch (err) {
      console.error('[AI DEBUG] Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Helper function to remove asterisks from text
  const removeAsterisks = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\*/g, '');
  };

  // Helper to fetch user name from Google Classroom API
  const fetchUserName = useCallback(async (userId, token) => {
    if (!userId || userNames[userId]) return;
    try {
      const res = await fetch(`https://classroom.googleapis.com/v1/userProfiles/${userId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch user profile');
      const data = await res.json();
      const name = data.name ? `${data.name.givenName || ''} ${data.name.familyName || ''}`.trim() : userId;
      setUserNames(prev => ({ ...prev, [userId]: name || userId }));
    } catch {
      setUserNames(prev => ({ ...prev, [userId]: userId }));
    }
  }, [userNames]);

  // Fetch user names for all userIds in submissions
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.type === 'structured' && lastMsg.data && lastMsg.data.submissions) {
      const token = getToken();
      const userIds = lastMsg.data.submissions.map(s => s.userId).filter(Boolean);
      userIds.forEach(userId => {
        if (!userNames[userId]) fetchUserName(userId, token);
      });
    }
  }, [messages, fetchUserName, userNames]);

  const renderBotResponse = (msg) => {
    // PRIORITY 1: Check for file upload requirement FIRST (before simple message rendering)
    if (msg.data && typeof msg.data === 'object' && msg.data.awaitingFileUpload === true) {
      const response = msg.data;
      const params = response.assignmentData || {};
      
      console.log('[UPLOAD UI] Rendering file upload UI!', { response, params });
      
      return (
        <div>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <Badge bg="warning" className="me-2">Attachment Required</Badge>
              <strong>Upload File</strong>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => toggleSpeech(response.message || 'Please upload your file')}
              className="p-0 ms-2"
              title={isSpeaking ? 'Stop speech' : 'Read aloud'}
            >
              <IconifyIcon
                icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
                width={16}
              />
            </Button>
          </div>

          <Card className="mb-3 shadow-sm border-warning">
            <Card.Body>
              <Alert variant="info" className="mb-3">
                <IconifyIcon icon="ri:information-line" className="me-2" />
                Please upload a file to attach to this assignment.
              </Alert>
              
              <div className="mb-3">
                <strong>Assignment Details:</strong>
                <ul className="mt-2">
                  {params.courseName && <li><strong>Course:</strong> {params.courseName}</li>}
                  {params.title && <li><strong>Title:</strong> {params.title}</li>}
                  {params.description && <li><strong>Description:</strong> {params.description}</li>}
                  {params.dueDate && <li><strong>Due Date:</strong> {new Date(params.dueDate).toLocaleString()}</li>}
                  {params.maxPoints && <li><strong>Max Points:</strong> {params.maxPoints}</li>}
                </ul>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <IconifyIcon icon="ri:attachment-2" className="me-2" />
                  Select File to Attach
                </Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      console.log('[FILE SELECTED]', file.name, file.size);
                      setPendingAttachment({ 
                        assignmentData: params, 
                        file,
                        conversationId: response.conversationId 
                      });
                    }
                  }}
                  disabled={uploadingFile}
                />
                <Form.Text className="text-muted">
                  Supported formats: PDF, Word, Excel, PowerPoint, Images, Text files (Max 50MB)
                </Form.Text>
              </Form.Group>

              {pendingAttachment && pendingAttachment.file && (
                <div className="mb-3">
                  <Alert variant="success">
                    <IconifyIcon icon="ri:file-check-line" className="me-2" />
                    <strong>File selected:</strong> {pendingAttachment.file.name} 
                    ({(pendingAttachment.file.size / 1024 / 1024).toFixed(2)} MB)
                  </Alert>
                </div>
              )}

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={async () => {
                    if (!pendingAttachment || !pendingAttachment.file) {
                      alert('Please select a file first');
                      return;
                    }
                    
                    setUploadingFile(true);
                    try {
                      console.log('[UPLOAD START] Uploading file:', pendingAttachment.file.name);
                      console.log('[UPLOAD START] File size:', pendingAttachment.file.size, 'bytes');
                      console.log('[UPLOAD START] File type:', pendingAttachment.file.type);
                      
                      // 1. Upload file using API utility
                      let uploadResponse;
                      try {
                        uploadResponse = await uploadFile(pendingAttachment.file);
                        console.log('[UPLOAD SUCCESS] Full response:', JSON.stringify(uploadResponse, null, 2));
                      } catch (uploadError) {
                        console.error('[UPLOAD FAILED]', uploadError);
                        throw new Error(`File upload failed: ${uploadError.message}`);
                      }
                      
                      // Check if we got a valid response
                      if (!uploadResponse) {
                        console.error('[UPLOAD FAILED] Response is undefined or null');
                        throw new Error('Upload returned no data. Please check your backend /api/upload endpoint.');
                      }
                      
                      // Extract file info from response
                      // Response format: { success: true, file: { originalName, filename, url, fullUrl } }
                      const fileInfo = uploadResponse.file || uploadResponse;
                      console.log('[FILE INFO] Extracted:', fileInfo);
                      
                      if (!fileInfo) {
                        console.error('[FILE INFO] No file info in response:', uploadResponse);
                        throw new Error('No file information in upload response');
                      }
                      
                      const fileUrl = fileInfo.fullUrl || fileInfo.url;
                      
                      if (!fileUrl) {
                        console.error('[FILE URL] Missing in response. fileInfo:', fileInfo);
                        throw new Error('No file URL in upload response. Check backend response format.');
                      }
                      
                      console.log('[FILE URL]', fileUrl);
                      
                      // 2. Prepare attachment data for assignment creation
                      const attachmentData = {
                        originalName: fileInfo.originalName || pendingAttachment.file.name,
                        filename: fileInfo.filename || fileInfo.originalName,
                        url: fileInfo.url || fileUrl
                      };
                      
                      console.log('[ATTACHMENT DATA]', attachmentData);
                      
                      // 3. Tell AI that file is uploaded and ready
                      const token = getToken();
                      const fileMessage = `yes`;  // Respond "yes" to the attachment question
                      
                      setMessage('');
                      setMessages(prev => [...prev, { 
                        sender: 'user', 
                        text: fileMessage, 
                        time: new Date() 
                      }]);
                      
                      // 4. Send confirmation to AI with attachment info
                      const aiRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/message`, {
                        method: 'POST',
                        headers: {
                          'Authorization': token ? `Bearer ${token}` : '',
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          message: fileMessage,
                          conversationId: pendingAttachment.conversationId || conversationId,
                          attachmentUrl: fileUrl,
                          attachmentData: attachmentData
                        })
                      });
                      
                      if (!aiRes.ok) {
                        const errorData = await aiRes.json().catch(() => ({}));
                        throw new Error(errorData.message || 'AI request failed');
                      }
                      
                      const aiData = await aiRes.json();
                      console.log('[AI RESPONSE]', aiData);
                      
                      // 5. Add bot response
                      const botResponse = {
                        sender: 'bot',
                        data: aiData,
                        time: new Date(),
                        type: 'structured'
                      };
                      setMessages(prev => [...prev, botResponse]);
                      
                      // 6. Clear pending attachment
                      setPendingAttachment(null);
                      
                      // 7. Show success message
                      if (aiData.message) {
                        speak(aiData.message);
                      }
                      
                      console.log('[UPLOAD COMPLETE] Assignment created successfully!');
                      
                    } catch (error) {
                      console.error('[UPLOAD ERROR]', error);
                      alert('Failed to upload file: ' + error.message);
                      setMessages(prev => [...prev, { 
                        sender: 'bot', 
                        text: `Sorry, there was an error uploading the file: ${error.message}. Please try again.`, 
                        time: new Date(),
                        type: 'text'
                      }]);
                    } finally {
                      setUploadingFile(false);
                    }
                  }}
                  disabled={!pendingAttachment || !pendingAttachment.file || uploadingFile}
                >
                  {uploadingFile ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="ri:upload-cloud-2-line" className="me-2" />
                      Upload & Create Assignment
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setPendingAttachment(null);
                    setMessages(prev => [...prev, { 
                      sender: 'bot', 
                      text: 'Assignment creation cancelled. Let me know if you need help with anything else!', 
                      time: new Date(),
                      type: 'text'
                    }]);
                  }}
                  disabled={uploadingFile}
                >
                  Cancel
                </Button>
              </div>
            </Card.Body>
          </Card>

          {response.conversationId && (
            <div className="mt-2 small text-muted">
              Conversation ID: {response.conversationId}
            </div>
          )}
        </div>
      );
    }
    
    // Show any {message: ...} response from backend as a bot message (no input field)
    if (msg.data && typeof msg.data === 'object' && msg.data.message && !msg.data.response) {
      return (
        <div className="d-flex justify-content-between align-items-start w-100">
          <div className="flex-grow-1">
            <FormattedMessage text={removeAsterisks(msg.data.message)} />
          </div>
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => toggleSpeech(msg.data.message)}
            className="p-0 ms-2 flex-shrink-0"
            title={isSpeaking ? 'Stop speech' : 'Read aloud'}
          >
            <IconifyIcon 
              icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'} 
              width={16} 
            />
          </Button>
        </div>
      );
    }
    if (msg.type === 'text' || !msg.type) {
      return (
        <div className="d-flex justify-content-between align-items-start w-100">
          <div className="flex-grow-1">
            <FormattedMessage text={removeAsterisks(msg.text)} />
          </div>
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => toggleSpeech(msg.text)}
            className="p-0 ms-2 flex-shrink-0"
            title={isSpeaking ? 'Stop speech' : 'Read aloud'}
          >
            <IconifyIcon 
              icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'} 
              width={16} 
            />
          </Button>
        </div>
      );
    }

    if (msg.type === 'nextSteps') {
      return (
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Badge bg="info" className="me-2">Next Steps</Badge>
            {msg.text}
          </div>
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => toggleSpeech(msg.text)}
            className="p-0 ms-2"
            title={isSpeaking ? 'Stop speech' : 'Read aloud'}
          >
            <IconifyIcon 
              icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'} 
              width={16} 
            />
          </Button>
        </div>
      );
    }

    if (msg.type === 'structured' && msg.data) {
      const response = msg.data;
      
      // Debug logging for attachment detection
      if (response.ongoingAction && response.ongoingAction.action === 'CREATE_ASSIGNMENT') {
        console.log('[ATTACHMENT DEBUG] ongoingAction detected:', {
          action: response.ongoingAction.action,
          collectedParameters: response.ongoingAction.collectedParameters,
          hasAttachment: response.ongoingAction.collectedParameters?.hasAttachment
        });
      }
      
      // Debug logging for awaitingFileUpload
      if (response.awaitingFileUpload) {
        console.log('[ATTACHMENT DEBUG] awaitingFileUpload detected:', {
          awaitingFileUpload: response.awaitingFileUpload,
          assignmentData: response.assignmentData
        });
      }
      
      // Custom: Handle file attachment request via awaitingFileUpload (NEW FORMAT)
      if (response.awaitingFileUpload === true && response.assignmentData) {
        const params = response.assignmentData;
        
        return (
          <div>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Badge bg="warning" className="me-2">Attachment Required</Badge>
                <strong>Upload File</strong>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => toggleSpeech(response.message || 'Please upload your file')}
                className="p-0 ms-2"
                title={isSpeaking ? 'Stop speech' : 'Read aloud'}
              >
                <IconifyIcon
                  icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
                  width={16}
                />
              </Button>
            </div>

            <Card className="mb-3 shadow-sm border-warning">
              <Card.Body>
                <Alert variant="info" className="mb-3">
                  <IconifyIcon icon="ri:information-line" className="me-2" />
                  Please upload a file to attach to this assignment.
                </Alert>
                
                <div className="mb-3">
                  <strong>Assignment Details:</strong>
                  <ul className="mt-2">
                    {params.courseName && <li><strong>Course:</strong> {params.courseName}</li>}
                    {params.title && <li><strong>Title:</strong> {params.title}</li>}
                    {params.description && <li><strong>Description:</strong> {params.description}</li>}
                    {params.dueDate && <li><strong>Due Date:</strong> {new Date(params.dueDate).toLocaleString()}</li>}
                    {params.maxPoints && <li><strong>Max Points:</strong> {params.maxPoints}</li>}
                  </ul>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <IconifyIcon icon="ri:attachment-2" className="me-2" />
                    Select File to Attach
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPendingAttachment({ 
                          assignmentData: params, 
                          file,
                          conversationId: response.conversationId 
                        });
                      }
                    }}
                    disabled={uploadingFile}
                  />
                  <Form.Text className="text-muted">
                    Supported formats: PDF, Word, Excel, PowerPoint, Images, Text files (Max 50MB)
                  </Form.Text>
                </Form.Group>

                {pendingAttachment && pendingAttachment.file && (
                  <div className="mb-3">
                    <Alert variant="success">
                      <IconifyIcon icon="ri:file-check-line" className="me-2" />
                      <strong>File selected:</strong> {pendingAttachment.file.name} 
                      ({(pendingAttachment.file.size / 1024 / 1024).toFixed(2)} MB)
                    </Alert>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (!pendingAttachment || !pendingAttachment.file) {
                        alert('Please select a file first');
                        return;
                      }
                      
                      setUploadingFile(true);
                      try {
                        // Create FormData for file upload
                        const formData = new FormData();
                        formData.append('file', pendingAttachment.file);
                        
                        // Upload file to your backend
                        const token = getToken();
                        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload`, {
                          method: 'POST',
                          headers: {
                            'Authorization': token ? `Bearer ${token}` : ''
                          },
                          body: formData
                        });
                        
                        if (!uploadRes.ok) throw new Error('File upload failed');
                        
                        const uploadData = await uploadRes.json();
                        const fileUrl = uploadData.url || uploadData.fileUrl;
                        
                        // Tell AI we have the file URL via chat message
                        const fileMessage = `File uploaded: ${fileUrl}`;
                        setMessage('');
                        setMessages(prev => [...prev, { 
                          sender: 'user', 
                          text: fileMessage, 
                          time: new Date() 
                        }]);
                        
                        // Send message to AI with file URL
                        const aiRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/message`, {
                          method: 'POST',
                          headers: {
                            'Authorization': token ? `Bearer ${token}` : '',
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            message: fileMessage,
                            conversationId: pendingAttachment.conversationId || conversationId,
                            fileUrl: fileUrl
                          })
                        });
                        
                        if (!aiRes.ok) throw new Error('AI request failed');
                        
                        const aiData = await aiRes.json();
                        
                        // Add bot response
                        const botResponse = {
                          sender: 'bot',
                          data: aiData,
                          time: new Date(),
                          type: 'structured'
                        };
                        setMessages(prev => [...prev, botResponse]);
                        
                        // Clear pending attachment
                        setPendingAttachment(null);
                        
                        // Show success message
                        if (aiData.message) {
                          speak(aiData.message);
                        }
                        
                      } catch (error) {
                        console.error('Error uploading file:', error);
                        alert('Failed to upload file: ' + error.message);
                        setMessages(prev => [...prev, { 
                          sender: 'bot', 
                          text: 'Sorry, there was an error uploading the file. Please try again.', 
                          time: new Date(),
                          type: 'text'
                        }]);
                      } finally {
                        setUploadingFile(false);
                      }
                    }}
                    disabled={!pendingAttachment || !pendingAttachment.file || uploadingFile}
                  >
                    {uploadingFile ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="ri:upload-cloud-2-line" className="me-2" />
                        Upload & Create Assignment
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setPendingAttachment(null);
                      setMessages(prev => [...prev, { 
                        sender: 'bot', 
                        text: 'Assignment creation cancelled. Let me know if you need help with anything else!', 
                        time: new Date(),
                        type: 'text'
                      }]);
                    }}
                    disabled={uploadingFile}
                  >
                    Cancel
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {response.conversationId && (
              <div className="mt-2 small text-muted">
                Conversation ID: {response.conversationId}
              </div>
            )}
          </div>
        );
      }
      
      // Custom: Handle file attachment request via ongoingAction (OLD FORMAT)
      if (response.ongoingAction && 
          response.ongoingAction.action === 'CREATE_ASSIGNMENT' && 
          response.ongoingAction.collectedParameters &&
          response.ongoingAction.collectedParameters.hasAttachment === true) {
        
        const params = response.ongoingAction.collectedParameters;
        
        return (
          <div>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Badge bg="warning" className="me-2">Attachment Required</Badge>
                <strong>Upload File</strong>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => toggleSpeech(response.message || 'Please upload your file')}
                className="p-0 ms-2"
                title={isSpeaking ? 'Stop speech' : 'Read aloud'}
              >
                <IconifyIcon
                  icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
                  width={16}
                />
              </Button>
            </div>

            <Card className="mb-3 shadow-sm border-warning">
              <Card.Body>
                <Alert variant="info" className="mb-3">
                  <IconifyIcon icon="ri:information-line" className="me-2" />
                  Please upload a file to attach to this assignment.
                </Alert>
                
                <div className="mb-3">
                  <strong>Assignment Details:</strong>
                  <ul className="mt-2">
                    {params.courseName && <li><strong>Course:</strong> {params.courseName}</li>}
                    {params.title && <li><strong>Title:</strong> {params.title}</li>}
                    {params.description && <li><strong>Description:</strong> {params.description}</li>}
                    {params.dueDate && <li><strong>Due Date:</strong> {new Date(params.dueDate).toLocaleString()}</li>}
                    {params.maxPoints && <li><strong>Max Points:</strong> {params.maxPoints}</li>}
                  </ul>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <IconifyIcon icon="ri:attachment-2" className="me-2" />
                    Select File to Attach
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPendingAttachment({ 
                          assignmentData: params, 
                          file,
                          conversationId: response.conversationId 
                        });
                      }
                    }}
                    disabled={uploadingFile}
                  />
                  <Form.Text className="text-muted">
                    Supported formats: PDF, Word, Excel, PowerPoint, Images, Text files (Max 50MB)
                  </Form.Text>
                </Form.Group>

                {pendingAttachment && pendingAttachment.file && (
                  <div className="mb-3">
                    <Alert variant="success">
                      <IconifyIcon icon="ri:file-check-line" className="me-2" />
                      <strong>File selected:</strong> {pendingAttachment.file.name} 
                      ({(pendingAttachment.file.size / 1024 / 1024).toFixed(2)} MB)
                    </Alert>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (!pendingAttachment || !pendingAttachment.file) {
                        alert('Please select a file first');
                        return;
                      }
                      
                      setUploadingFile(true);
                      try {
                        // Create FormData for file upload
                        const formData = new FormData();
                        formData.append('file', pendingAttachment.file);
                        
                        // Upload file to your backend
                        const token = getToken();
                        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload`, {
                          method: 'POST',
                          headers: {
                            'Authorization': token ? `Bearer ${token}` : ''
                          },
                          body: formData
                        });
                        
                        if (!uploadRes.ok) throw new Error('File upload failed');
                        
                        const uploadData = await uploadRes.json();
                        const fileUrl = uploadData.url || uploadData.fileUrl;
                        
                        // Tell AI we have the file URL via chat message
                        const fileMessage = `File uploaded: ${fileUrl}`;
                        setMessage('');
                        setMessages(prev => [...prev, { 
                          sender: 'user', 
                          text: fileMessage, 
                          time: new Date() 
                        }]);
                        
                        // Send message to AI with file URL
                        const aiRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/message`, {
                          method: 'POST',
                          headers: {
                            'Authorization': token ? `Bearer ${token}` : '',
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            message: fileMessage,
                            conversationId: pendingAttachment.conversationId || conversationId,
                            fileUrl: fileUrl
                          })
                        });
                        
                        if (!aiRes.ok) throw new Error('AI request failed');
                        
                        const aiData = await aiRes.json();
                        
                        // Add bot response
                        const botResponse = {
                          sender: 'bot',
                          data: aiData,
                          time: new Date(),
                          type: 'structured'
                        };
                        setMessages(prev => [...prev, botResponse]);
                        
                        // Clear pending attachment
                        setPendingAttachment(null);
                        
                        // Show success message
                        if (aiData.message) {
                          speak(aiData.message);
                        }
                        
                      } catch (error) {
                        console.error('Error uploading file:', error);
                        alert('Failed to upload file: ' + error.message);
                        setMessages(prev => [...prev, { 
                          sender: 'bot', 
                          text: 'Sorry, there was an error uploading the file. Please try again.', 
                          time: new Date(),
                          type: 'text'
                        }]);
                      } finally {
                        setUploadingFile(false);
                      }
                    }}
                    disabled={!pendingAttachment || !pendingAttachment.file || uploadingFile}
                  >
                    {uploadingFile ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="ri:upload-cloud-2-line" className="me-2" />
                        Upload & Create Assignment
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setPendingAttachment(null);
                      setMessages(prev => [...prev, { 
                        sender: 'bot', 
                        text: 'Assignment creation cancelled. Let me know if you need help with anything else!', 
                        time: new Date(),
                        type: 'text'
                      }]);
                    }}
                    disabled={uploadingFile}
                  >
                    Cancel
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {response.conversationId && (
              <div className="mt-2 small text-muted">
                Conversation ID: {response.conversationId}
              </div>
            )}
          </div>
        );
      }
      
      // Custom: Render grade update message
      if (msg.data && msg.data.message && /Grade updated for (.+?) on ".+?"\./.test(msg.data.message)) {
        // Extract student name and assignment name
        const match = msg.data.message.match(/Grade updated for (.+?) on \"(.+?)\"\./);
        const studentName = match ? match[1] : '';
        const assignmentName = match ? match[2] : '';
        return (
          <div>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Badge bg="primary" className="me-2">Grades</Badge>
                <strong>Grade</strong>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => toggleSpeech(msg.data.message)}
                className="p-0 ms-2"
                title={isSpeaking ? 'Stop speech' : 'Read aloud'}
              >
                <IconifyIcon
                  icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
                  width={16}
                />
              </Button>
            </div>
            <Card className="mb-3 shadow-sm border-primary">
              <Card.Body>
                <div className="fw-bold mb-2">
                  Grade updated for <span className="text-success">{studentName}</span> on <span className="text-info">&quot;{assignmentName}&quot;</span>.
                </div>
              </Card.Body>
            </Card>
            {msg.data.conversationId && (
              <div className="mt-2 small text-muted">
                Conversation ID: {msg.data.conversationId}
              </div>
            )}
          </div>
        );
      }
      // Custom: Render assignment submissions summary
      if (response.submissions && Array.isArray(response.submissions) && response.submissions.length > 0) {
        // Try to extract assignment name from message
        let assignmentName = '';
        const match = response.message && response.message.match(/Submissions for \"(.+?)\"/);
        if (match) assignmentName = match[1];
        // Count submitted
        const submittedCount = response.submissions.length;
        return (
          <div>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Badge bg="success" className="me-2">Submissions</Badge>
                <strong>{assignmentName ? `Submissions for "${assignmentName}"` : 'Assignment Submissions'}</strong>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => toggleSpeech(response.message)}
                className="p-0 ms-2"
                title={isSpeaking ? 'Stop speech' : 'Read aloud'}
              >
                <IconifyIcon
                  icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
                  width={16}
                />
              </Button>
            </div>
            <Card className="mb-3 shadow-sm border-success">
              <Card.Body>
                <div className="mb-2 fw-bold">
                  Submitted ({submittedCount}):
                </div>
                <ListGroup className="mb-3">
                  {response.submissions.map((sub, idx) => {
                    const displayName = (sub.userName || (userNames && userNames[sub.userId]) || sub.userId);
                    return (
                      <ListGroup.Item key={sub.id || idx} className="mb-2">
                        <div className="fw-bold">
                          Syed Aman <span className="badge bg-success ms-2">{sub.state}</span>
                        </div>
                        {/* Show grade info if available */}
                        {(typeof sub.assignedGrade !== 'undefined' || typeof sub.draftGrade !== 'undefined') && (
                          <div className="small text-secondary mb-1">
                            {typeof sub.assignedGrade !== 'undefined' && (
                              <span>Assigned Grade: <span className="fw-bold text-primary">{sub.assignedGrade}</span></span>
                            )}
                            {typeof sub.draftGrade !== 'undefined' && sub.draftGrade !== sub.assignedGrade && (
                              <span className="ms-2">Draft Grade: <span className="fw-bold text-warning">{sub.draftGrade}</span></span>
                            )}
                          </div>
                        )}
                        {/* Submission History */}
                        {Array.isArray(sub.submissionHistory) && sub.submissionHistory.length > 0 && (
                          <div className="mt-1">
                            <details>
                              <summary className="small text-info" style={{ cursor: 'pointer' }}>Show Grade/State History</summary>
                              <ul className="mb-1 ps-3 small">
                                {sub.submissionHistory.map((hist, hidx) => {
                                  if (hist.gradeHistory) {
                                    const gh = hist.gradeHistory;
                                    return (
                                      <li key={hidx}>
                                        <span className="text-primary">Grade</span>: {gh.pointsEarned} / {gh.maxPoints} &nbsp;
                                        <span className="text-muted">({gh.gradeChangeType?.replace(/_/g, ' ')})</span>
                                        <span className="ms-2 text-secondary">{new Date(gh.gradeTimestamp).toLocaleString()}</span>
                                      </li>
                                    );
                                  }
                                  if (hist.stateHistory) {
                                    const sh = hist.stateHistory;
                                    return (
                                      <li key={hidx}>
                                        <span className="text-success">State</span>: {sh.state}
                                        <span className="ms-2 text-secondary">{new Date(sh.stateTimestamp).toLocaleString()}</span>
                                      </li>
                                    );
                                  }
                                  return null;
                                })}
                              </ul>
                            </details>
                          </div>
                        )}
                        {sub.assignmentSubmission && sub.assignmentSubmission.attachments && sub.assignmentSubmission.attachments.length > 0 && (
                          <div className="mt-1">
                            {sub.assignmentSubmission.attachments.map((att, i) => (
                              att.driveFile ? (
                                <div key={att.driveFile.id || i} className="d-flex align-items-center mb-1">
                                  {/* Use Google Docs icon instead of thumbnail */}
                                  <span className="me-2 fw-bold text-primary" >📄</span>
                                  <a href={att.driveFile.alternateLink} target="_blank" rel="noopener noreferrer">{att.driveFile.title}</a>
                                </div>
                              ) : null
                            ))}
                          </div>
                        )}
                        {sub.alternateLink && (
                          <div className="mt-1">
                            <a href={sub.alternateLink} target="_blank" rel="noopener noreferrer" className="small text-muted">View Submission in Classroom</a>
                          </div>
                        )}
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
                {/* Not Submitted section can be added if needed */}
              </Card.Body>
            </Card>
            {response.conversationId && (
              <div className="mt-2 small text-muted">
                Conversation ID: {response.conversationId}
              </div>
            )}
          </div>
        );
      }
      // Custom: Render course announcements
if (response.announcements && Array.isArray(response.announcements) && response.announcements.length > 0) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <Badge bg="secondary" className="me-2">Announcements</Badge>
          <strong>Course Announcements</strong>
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={() => toggleSpeech(response.message)}
          className="p-0 ms-2"
          title={isSpeaking ? 'Stop speech' : 'Read aloud'}
        >
          <IconifyIcon
            icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
            width={16}
          />
        </Button>
      </div>

      <Card className="mb-3 shadow-sm border-secondary">
        <Card.Body>
          <ListGroup>
            {response.announcements.map((ann, idx) => (
              <ListGroup.Item key={ann.id || idx} className="mb-2">
                <div className="fw-bold mb-1">
                  {ann.text}
                  <span className="badge bg-success ms-2">{ann.state}</span>
                </div>
                <div className="small text-muted mb-1">
                  📅 {new Date(ann.creationTime).toLocaleDateString()}
                </div>
                {ann.alternateLink && (
                  <div>
                    <a
                      href={ann.alternateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="small text-primary"
                    >
                      View in Google Classroom
                    </a>
                  </div>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      {response.conversationId && (
        <div className="mt-2 small text-muted">
          Conversation ID: {response.conversationId}
        </div>
      )}
    </div>
  );
}
// Custom: Render assignment creation details
if (response.assignment && typeof response.assignment === 'object') {
  const a = response.assignment;
  
  // Check if assignment has pending attachment
  if (a.hasAttachment && a.attachmentUrl === 'pending') {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Badge bg="warning" className="me-2">Attachment Required</Badge>
            <strong>{a.title}</strong>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={() => toggleSpeech(response.message)}
            className="p-0 ms-2"
            title={isSpeaking ? 'Stop speech' : 'Read aloud'}
          >
            <IconifyIcon
              icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
              width={16}
            />
          </Button>
        </div>

        <Card className="mb-3 shadow-sm border-warning">
          <Card.Body>
            <Alert variant="info" className="mb-3">
              <IconifyIcon icon="ri:information-line" className="me-2" />
              Please upload a file to attach to this assignment.
            </Alert>
            
            <div className="mb-3">
              <strong>Assignment Details:</strong>
              <ul className="mt-2">
                <li><strong>Course:</strong> {a.courseName || 'N/A'}</li>
                <li><strong>Title:</strong> {a.title}</li>
                <li><strong>Description:</strong> {a.description || 'N/A'}</li>
                <li><strong>Due Date:</strong> {a.dueDate ? new Date(a.dueDate).toLocaleString() : 'N/A'}</li>
                <li><strong>Max Points:</strong> {a.maxPoints || 100}</li>
              </ul>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                <IconifyIcon icon="ri:attachment-2" className="me-2" />
                Select File to Attach
              </Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setPendingAttachment({ assignmentData: a, file });
                  }
                }}
                disabled={uploadingFile}
              />
              <Form.Text className="text-muted">
                Supported formats: PDF, Word, Excel, PowerPoint, Images, Text files (Max 50MB)
              </Form.Text>
            </Form.Group>

            {pendingAttachment && pendingAttachment.file && (
              <div className="mb-3">
                <Alert variant="success">
                  <IconifyIcon icon="ri:file-check-line" className="me-2" />
                  <strong>File selected:</strong> {pendingAttachment.file.name} 
                  ({(pendingAttachment.file.size / 1024 / 1024).toFixed(2)} MB)
                </Alert>
              </div>
            )}

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={async () => {
                  if (!pendingAttachment || !pendingAttachment.file) {
                    alert('Please select a file first');
                    return;
                  }
                  
                  setUploadingFile(true);
                  try {
                    // Create FormData for file upload
                    const formData = new FormData();
                    formData.append('file', pendingAttachment.file);
                    
                    // Upload file to your backend
                    const token = getToken();
                    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload`, {
                      method: 'POST',
                      headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                      },
                      body: formData
                    });
                    
                    if (!uploadRes.ok) throw new Error('File upload failed');
                    
                    const uploadData = await uploadRes.json();
                    const fileUrl = uploadData.url || uploadData.fileUrl;
                    
                    // Now send assignment creation with file URL
                    const assignmentPayload = {
                      ...pendingAttachment.assignmentData,
                      hasAttachment: true,
                      attachmentUrl: fileUrl
                    };
                    
                    // Send to backend to create assignment
                    const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assignments`, {
                      method: 'POST',
                      headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(assignmentPayload)
                    });
                    
                    if (!createRes.ok) throw new Error('Assignment creation failed');
                    
                    const result = await createRes.json();
                    
                    // Show success message
                    setMessages(prev => [...prev, { 
                      sender: 'bot', 
                      text: `✅ Assignment "${a.title}" created successfully with attachment!`, 
                      time: new Date(),
                      type: 'text'
                    }]);
                    
                    // Clear pending attachment
                    setPendingAttachment(null);
                    
                  } catch (error) {
                    console.error('Error uploading file or creating assignment:', error);
                    alert('Failed to upload file or create assignment: ' + error.message);
                  } finally {
                    setUploadingFile(false);
                  }
                }}
                disabled={!pendingAttachment || !pendingAttachment.file || uploadingFile}
              >
                {uploadingFile ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="ri:upload-cloud-2-line" className="me-2" />
                    Upload & Create Assignment
                  </>
                )}
              </Button>
              
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setPendingAttachment(null);
                  setMessages(prev => [...prev, { 
                    sender: 'bot', 
                    text: 'Assignment creation cancelled. Let me know if you need help with anything else!', 
                    time: new Date(),
                    type: 'text'
                  }]);
                }}
                disabled={uploadingFile}
              >
                Cancel
              </Button>
            </div>
          </Card.Body>
        </Card>

        {response.conversationId && (
          <div className="mt-2 small text-muted">
            Conversation ID: {response.conversationId}
          </div>
        )}
      </div>
    );
  }
  
  // Regular assignment display (already created)
  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <Badge bg="primary" className="me-2">Assignment</Badge>
          <strong>{a.title}</strong>
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={() => toggleSpeech(response.message)}
          className="p-0 ms-2"
          title={isSpeaking ? 'Stop speech' : 'Read aloud'}
        >
          <IconifyIcon
            icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
            width={16}
          />
        </Button>
      </div>

      <Card className="mb-3 shadow-sm border-primary">
        <Card.Body>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <strong>State:</strong> <Badge bg="success">{a.state}</Badge>
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Work Type:</strong> {a.workType}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Max Points:</strong> {a.maxPoints}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Created:</strong> {new Date(a.creationTime).toLocaleString()}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Last Updated:</strong> {new Date(a.updateTime).toLocaleString()}
            </ListGroup.Item>
            {a.hasAttachment && a.attachmentUrl && a.attachmentUrl !== 'pending' && (
              <ListGroup.Item>
                <strong>Attachment:</strong>{" "}
                <a
                  href={a.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  <IconifyIcon icon="ri:attachment-2" className="me-1" />
                  View Attached File
                </a>
              </ListGroup.Item>
            )}
            {a.assignment?.studentWorkFolder?.id && (
              <ListGroup.Item>
                <strong>Student Work Folder:</strong>{" "}
                <a
                  href={`https://drive.google.com/drive/folders/${a.assignment.studentWorkFolder.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Drive
                </a>
              </ListGroup.Item>
            )}
            {a.alternateLink && (
              <ListGroup.Item>
                <a
                  href={a.alternateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  View in Google Classroom
                </a>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      {response.conversationId && (
        <div className="mt-2 small text-muted">
          Conversation ID: {response.conversationId}
        </div>
      )}
    </div>
  );
}


      // Custom: Render confirm email send response
      if (response.type === 'CONFIRM_EMAIL_SEND' && response.context && response.context.pendingEmail) {
        const email = response.context.pendingEmail;
        return (
          <div>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Badge bg="info" className="me-2">Email</Badge>
                <strong>Confirm Email Send</strong>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => toggleSpeech(response.message)}
                className="p-0 ms-2"
                title={isSpeaking ? 'Stop speech' : 'Read aloud'}
              >
                <IconifyIcon
                  icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
                  width={16}
                />
              </Button>
            </div>
            <Card className="mb-3 shadow-sm border-info">
              <Card.Body>
                <div className="mb-2"><span className="fw-bold">To:</span> {email.recipient}</div>
                <div className="mb-2"><span className="fw-bold">Subject:</span> {email.subject}</div>
                <div className="mb-2"><span className="fw-bold">Body:</span><br /><span style={{ whiteSpace: 'pre-line' }}>{email.body}</span></div>
                <div className="alert alert-info p-2 mt-3 mb-0">
                  <strong>Reply &quot;yes&quot; to send or &quot;edit&quot; to change it.</strong>
                </div>
              </Card.Body>
            </Card>
            {response.conversationId && (
              <div className="mt-2 small text-muted">
                Conversation ID: {response.conversationId}
              </div>
            )}
          </div>
        );
      }
      // Custom: Render emails from Shakil Ahmed
      if (response.emails && Array.isArray(response.emails) && response.emails.length > 0) {
        return (
          <div>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Badge bg="info" className="me-2">Emails</Badge>
                <strong>Recent emails from Shakil Ahmed (last 14 days)</strong>
              </div>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => toggleSpeech(response.message)}
                className="p-0 ms-2"
                title={isSpeaking ? 'Stop speech' : 'Read aloud'}
              >
                <IconifyIcon 
                  icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'} 
                  width={16} 
                />
              </Button>
            </div>
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <ListGroup>
                  {response.emails.map((email, idx) => (
                    <ListGroup.Item key={email.id || idx} className="mb-2">
                      <div className="fw-bold mb-1">{email.subject}</div>
                      <div style={{ whiteSpace: 'pre-line' }}>{email.message}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
            {response.conversationId && (
              <div className="mt-2 small text-muted">
                Conversation ID: {response.conversationId}
              </div>
            )}
          </div>
        );
      }

      // Custom: Render meeting cancelled response
      if (response.type === 'MEETING_CANCELLED') {
        return (
          <div>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Badge bg="danger" className="me-2">Calendar</Badge>
                <strong>Meeting Cancelled</strong>
              </div>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => toggleSpeech(response.message)}
                className="p-0 ms-2"
                title={isSpeaking ? 'Stop speech' : 'Read aloud'}
              >
                <IconifyIcon 
                  icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
                  width={16} 
                />
              </Button>
            </div>
            <Card className="mb-3 shadow-sm border-danger">
              <Card.Body>
                <div className="fw-bold mb-2 text-danger">{response.message}</div>
              </Card.Body>
            </Card>
            {response.conversationId && (
              <div className="mt-2 small text-muted">
                Conversation ID: {response.conversationId}
              </div>
            )}
          </div>
        );
      }

      // Custom: Render meeting creation/summary (rich format)
      if (response.meeting && typeof response.meeting === 'object') {
        const meeting = response.meeting;
        const formatDateTime = (dt) => {
          if (!dt) return '';
          const d = new Date(dt);
          if (!isNaN(d)) {
            return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
          }
          return dt;
        };
        return (
          <div>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Badge bg="warning" className="me-2">Meeting</Badge>
                <strong>{meeting.summary || 'Meeting Created'}</strong>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => toggleSpeech(response.message)}
                className="p-0 ms-2"
                title={isSpeaking ? 'Stop speech' : 'Read aloud'}
              >
                <IconifyIcon
                  icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
                  width={16}
                />
              </Button>
            </div>
            <Card className="mb-3 shadow-sm border-warning">
              <Card.Body>
                {response.message && (
                  <div className="mb-3" style={{ whiteSpace: 'pre-line' }}>
                    <span dangerouslySetInnerHTML={{ __html: response.message.replace(/\n/g, '<br/>') }} />
                  </div>
                )}
                <table className="table table-bordered table-sm mb-0">
                  <tbody>
                    <tr>
                      <td><span className="badge bg-info text-dark">Event ID</span></td>
                      <td>{meeting.id}</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-info text-dark">Status</span></td>
                      <td>{meeting.status}</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-info text-dark">Date</span></td>
                      <td>{meeting.start?.dateTime ? formatDateTime(meeting.start.dateTime) : ''}</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-info text-dark">Duration</span></td>
                      <td>{meeting.start?.dateTime && meeting.end?.dateTime ? `${((new Date(meeting.end.dateTime) - new Date(meeting.start.dateTime)) / 60000)} min` : ''}</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-info text-dark">Attendees</span></td>
                      <td>{meeting.attendees && meeting.attendees.length > 0 ? meeting.attendees.map(a => a.email).join(', ') : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-info text-dark">Calendar Link</span></td>
                      <td>{meeting.htmlLink ? <a href={meeting.htmlLink} target="_blank" rel="noopener noreferrer">View in Google Calendar</a> : 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
            {response.conversationId && (
              <div className="mt-2 small text-muted">
                Conversation ID: {response.conversationId}
              </div>
            )}
          </div>
        );
      }

      // Custom: Render calendar events
      if (response.events && Array.isArray(response.events) && response.events.length > 0) {
        // Helper to format date/time
        const formatDateTime = (dt) => {
          if (!dt) return '';
          // Try to parse as ISO string
          const d = new Date(dt);
          if (!isNaN(d)) {
            return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
          }
          return dt;
        };
        return (
          <div>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <Badge bg="primary" className="me-2">Calendar</Badge>
                <strong>Today&apos;s Meetings & Events</strong>
              </div>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => toggleSpeech(response.message)}
                className="p-0 ms-2"
                title={isSpeaking ? 'Stop speech' : 'Read aloud'}
              >
                <IconifyIcon 
                  icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'}
                  width={16} 
                />
              </Button>
            </div>
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <ListGroup>
                  {response.events.map((event, idx) => (
                    <ListGroup.Item key={event.id || idx} className="mb-2">
                      <div className="fw-bold mb-1">{event.summary || 'Untitled Event'}</div>
                      <div className="mb-1">
                        <span className="me-2">
                          <IconifyIcon icon="mdi:calendar" width={16} className="me-1 text-primary" />
                          {event.start?.dateTime ? formatDateTime(event.start.dateTime) : (event.start?.date ? formatDateTime(event.start.date) : 'No start')}
                        </span>
                        {event.hangoutLink && (
                          <span className="ms-2">
                            <IconifyIcon icon="mdi:video" width={16} className="me-1 text-success" />
                            <a href={event.hangoutLink} target="_blank" rel="noopener noreferrer">Join Meet</a>
                          </span>
                        )}
                      </div>
                      {event.htmlLink && (
                        <div>
                          <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="small text-muted">
                            View in Google Calendar
                          </a>
                        </div>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="mt-1">
                          <span className="fw-bold small">Attendees:</span>
                          <ul className="mb-0 ps-3 small">
                            {event.attendees.map((a, i) => (
                              <li key={a.email || i}>
                                {a.displayName ? `${a.displayName} ` : ''}
                                {a.email}
                                {a.responseStatus && (
                                  <span className="ms-1 text-secondary">({a.responseStatus})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
            {response.conversationId && (
              <div className="mt-2 small text-muted">
                Conversation ID: {response.conversationId}
              </div>
            )}
          </div>
        );
      }

      // If no custom renderer matched, show all fields in the response object for debugging/visibility
      const textToSpeak = response.message || "Here's the information you requested.";
      // Render all fields in a table with tags for each key
      return (
        <div className="alert alert-secondary">
          <div className="fw-bold mb-2">Full Response (Raw Data):</div>
          <table className="table table-bordered table-sm mb-0">
            <tbody>
              {Object.entries(response).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ width: '1%', whiteSpace: 'nowrap' }}>
                    <span className="badge bg-info text-dark" style={{ fontSize: 12 }}>{key}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {typeof value === 'object' && value !== null
                      ? <pre style={{ margin: 0, background: 'none', border: 'none', padding: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(value, null, 2)}</pre>
                      : String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <div>Unknown response format</div>;
  };

  // Voice Mode: Start listening with SpeechRecognition
  const startVoiceListening = () => {
    setVoiceModeError(null);
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setVoiceModeError('Speech recognition not supported in this browser');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = recognitionLang; // Use selected language
    setVoiceModeStatus('recording');
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceModeStatus('processing');
      setMessage(transcript); // Show in input for debug
      setVoiceModeTranscript(transcript);
      // Add user message to chat history
      setMessages(prev => [...prev, { sender: 'user', text: transcript, time: new Date() }]);
      try {
        const token = getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/message`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: transcript,
            conversationId: conversationId || undefined
          })
        });
        let data;
        try {
          data = await res.json();
        } catch {
          data = await res.text();
        }
        let text = '';
        if (typeof data === 'string') {
          text = data;
        } else if (data && data.response && data.response.message) {
          text = data.response.message;
        } else if (data && data.message) {
          text = data.message;
        } else {
          text = 'Sorry, I could not understand the response.';
        }
        // Add bot response to chat history
        setMessages(prev => [...prev, { sender: 'bot', text, time: new Date() }]);
        setVoiceModeStatus('playing');
        // Ensure overlay stays open until TTS finishes
        if (synthRef.current && voice && text) {
          const utterance = new window.SpeechSynthesisUtterance(text);
          utterance.voice = voice;
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.onend = () => {
            setVoiceModeStatus('idle');
            setShowVoiceMode(false);
            setVoiceModeTranscript('');
          };
          utterance.onerror = () => {
            setVoiceModeStatus('idle');
            setShowVoiceMode(false);
            setVoiceModeTranscript('');
          };
          synthRef.current.cancel(); // Stop any previous speech
          synthRef.current.speak(utterance);
        } else {
          setVoiceModeStatus('idle');
          setShowVoiceMode(false);
          setVoiceModeTranscript('');
        }
      } catch (err) {
        setVoiceModeError('Failed to process voice.');
        setVoiceModeStatus('idle');
        setVoiceModeTranscript('');
      }
    };
    recognition.onerror = (event) => {
      setVoiceModeError('Speech recognition error: ' + event.error);
      setVoiceModeStatus('idle');
    };
    recognition.onend = () => {
      // Do nothing, handled in onresult
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  // Voice Mode: open overlay and start listening
  const openVoiceMode = () => {
    setShowVoiceMode(true);
    setVoiceModeTranscript('');
    setTimeout(() => startVoiceListening(), 300);
  };
  // Voice Mode: close overlay and stop everything
  const closeVoiceMode = () => {
    setShowVoiceMode(false);
    setVoiceModeStatus('idle');
    setVoiceModeError(null);
    setVoiceModeTranscript('');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
  };

  return (
    <Card className="border-0 bg-body chat-responsive-card">
      <CardBody className="p-0 d-flex flex-column chat-responsive-body">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">AI Classroom Chat</h5>
            {conversationId && (
              <small className="text-muted">Conversation ID: {conversationId}</small>
            )}
          </div>

          <div className="d-flex align-items-center">
            {/* Language selector for speech recognition */}
            <div className="me-2">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  {recognitionLang === 'en-US' ? 'English' : 'Urdu'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item active={recognitionLang === 'en-US'} onClick={() => setRecognitionLang('en-US')}>
                    English
                  </Dropdown.Item>
                  <Dropdown.Item active={recognitionLang === 'ur-PK'} onClick={() => setRecognitionLang('ur-PK')}>
                    Urdu
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {voices.length > 0 && (
              <Dropdown className="me-2">
                <Dropdown.Toggle variant="light" size="sm">
                  <IconifyIcon icon="mdi:account-voice" width={16} className="me-1" />
                  {voice?.name || 'Select Voice'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {voices.map((v, index) => (
                    <Dropdown.Item 
                      key={index} 
                      active={voice === v}
                      onClick={() => setVoice(v)}
                    >
                      {v.name} ({v.lang})
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}

            {/* Reset conversation button */}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleReset}
              disabled={isResetting || isLoading}
              title="Reset conversation and history"
            >
              {isResetting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                  Resetting...
                </>
              ) : (
                'Reset'
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex-grow-1 p-3 overflow-auto chat-messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`rounded-3 p-3 chat-message-bubble ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white chat-message-user'
                    : msg.type === 'nextSteps'
                      ? 'bg-info bg-opacity-10 border-start border-info border-3 chat-message-nextsteps'
                      : 'bg border chat-message-bot'
                }`}
              >
                {msg.sender === 'bot' ? renderBotResponse(msg) : <div>{msg.text}</div>}
                <div
                  className={`small mt-1 ${msg.sender === 'user' ? 'text-white-50' : 'text-muted'}`}
                  style={{ textAlign: 'right' }}
                >
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-3 d-flex justify-content-start">
              <div className="border rounded-3 p-3">
                <div className="d-flex align-items-center">
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  <span>AI Classroom Search</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="p-3 border-top">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Form.Control
                ref={textareaRef}
                as="textarea"
                rows={1}
                style={{
                  resize: 'none',
                  overflowY: 'hidden',
                  minHeight: 'calc(1.5em + 0.75rem + 2px)'
                }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message To AI Classroom"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading}
              />
              <Button 
                variant={isListening ? 'danger' : 'outline-secondary'} 
                onClick={toggleListening}
                disabled={isLoading}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <IconifyIcon icon={isListening ? 'mdi:microphone-off' : 'mdi:microphone'} width={20} />
              </Button>
              {/* Voice Mode Button */}
              <Button
                variant="outline-success"
                onClick={openVoiceMode}
                disabled={isLoading || showVoiceMode}
                title="Voice Mode (ChatGPT style)"
              >
                <IconifyIcon icon="mdi:waveform" width={22} />
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={!message.trim() || isLoading}
              >
                <IconifyIcon icon="mdi:send" width={20} />
              </Button>
            </InputGroup>

            {isListening && (
              <div className="text-center small text-info mt-1">
                <IconifyIcon icon="mdi:microphone" className="me-1" /> Listening...
              </div>
            )}
            
            <div className="d-flex justify-content-between mt-2">
              <small className="text-muted">
                AI Classroom Search
              </small>
              <small className="text-muted">
                Press Enter to send
              </small>
            </div>
          </Form>
        </div>
        {/* Voice Mode Fullscreen Overlay */}
        {showVoiceMode && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.99)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transition: 'all 0.3s',
          }}>
            <button
              onClick={closeVoiceMode}
              style={{ position: 'absolute', top: 24, right: 32, background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer' }}
              aria-label="Close Voice Mode"
            >
              <IconifyIcon icon="mdi:close" width={36} />
            </button>
            <div className="mb-4">
              <IconifyIcon icon="mdi:waveform" width={64} className="mb-3 text-success" />
              <h2 style={{ fontWeight: 700 }}>Voice Mode</h2>
            </div>
            <div className="mb-4">
              <div className="rounded-circle p-5 shadow-lg bg-dark bg-opacity-25" style={{ fontSize: 48, border: '4px solid #28a745' }}>
                <IconifyIcon icon="mdi:microphone" width={56} className="text-success animate__animated animate__pulse animate__infinite" />
              </div>
            </div>
            <div className="mb-3" style={{ minHeight: 40 }}>
              {voiceModeStatus === 'idle' && <span className="text-light">Preparing...</span>}
              {voiceModeStatus === 'recording' && <span className="text-success">Listening...</span>}
              {voiceModeStatus === 'processing' && <span className="text-warning">Processing...</span>}
              {voiceModeStatus === 'playing' && <span className="text-info">Playing response...</span>}
              {voiceModeError && <span className="text-danger">{voiceModeError}</span>}
            </div>
            {voiceModeTranscript && (
              <div className="mb-2 px-4 py-2 bg-light text-dark rounded-3 shadow" style={{ maxWidth: 500 }}>
                <strong>You said:</strong> {voiceModeTranscript}
              </div>
            )}
            <audio ref={audioPlayerRef} style={{ display: 'none' }} />
          </div>
        )}
        {/* Prompt suggestions - hide for Super Admin users */}
        <div className="p-3">
          {!isSuperAdmin && (
            <PromptSuggestions 
              onPromptSelect={handlePromptSelect} 
              isLoading={isLoading} 
              role={role}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

