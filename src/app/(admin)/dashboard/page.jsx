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

// Prompt Suggestions Component (defined in the same file)
function PromptSuggestions({ onPromptSelect, isLoading }) {
  const promptCategories = [
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
  // Extract token from URL and save to localStorage if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const token = url.searchParams.get('token');
      if (token) {
        localStorage.setItem('token', token);
      }
    }
  }, []);

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi, I'm Classroom Assistant.", time: new Date() },
    { sender: 'bot', text: "How can I help you today?", time: new Date() }
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [voiceModeStatus, setVoiceModeStatus] = useState('idle'); // idle | recording | processing | playing
  const [voiceModeError, setVoiceModeError] = useState(null);
  const [voiceModeTranscript, setVoiceModeTranscript] = useState('');
  const [recognitionLang, setRecognitionLang] = useState('en-US'); // New: language for speech recognition
  const [userNames, setUserNames] = useState({}); // userId -> name
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

  // Message handling
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/message`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentMessage,
          conversationId: conversationId || undefined
        })
      });

      if (!res.ok) throw new Error(res.statusText || 'Request failed');
      
      const data = await res.json();
      
      const botResponse = {
        sender: 'bot',
        data: data,
        time: new Date(),
        type: 'structured'
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      if (!conversationId && data.response?.conversationId) {
        setConversationId(data.response.conversationId);
      }
      
      if (data.response?.message) {
        speak(data.response.message);
      } else if (data.response) {
        speak("Here's the information you requested.");
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
        text: "Sorry, I encountered an error. Please try again.", 
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
      const token = localStorage.getItem('token');
      const userIds = lastMsg.data.submissions.map(s => s.userId).filter(Boolean);
      userIds.forEach(userId => {
        if (!userNames[userId]) fetchUserName(userId, token);
      });
    }
  }, [messages, fetchUserName, userNames]);

  const renderBotResponse = (msg) => {
    // Show any {message: ...} response from backend as a bot message (no input field)
    if (msg.data && typeof msg.data === 'object' && msg.data.message && !msg.data.response) {
      return (
        <div className="d-flex justify-content-between align-items-start">
          <div>{msg.data.message}</div>
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
      );
    }
    if (msg.type === 'text' || !msg.type) {
      return (
        <div className="d-flex justify-content-between align-items-start">
          <div>{msg.text}</div>
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

      // Custom: Render single calendar event (e.g., reschedule)
      if (response.event && typeof response.event === 'object') {
        const event = response.event;
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
                <Badge bg="warning" className="me-2">Calendar</Badge>
                <strong>Meeting</strong>
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
                <div className="fw-bold mb-2">{event.summary || 'Untitled Event'}</div>
                <div className="mb-2">
                  <IconifyIcon icon="mdi:calendar" width={16} className="me-1 text-primary" />
                  <span className="me-2">{event.start?.dateTime ? formatDateTime(event.start.dateTime) : (event.start?.date ? formatDateTime(event.start.date) : 'No start')}</span>
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
                  <div className="mt-2">
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

      // ...existing code for assignments/courses...
      const textToSpeak = response.message || "Here's the information you requested.";
      // ...existing code...
      // (Keep the rest of the original renderBotResponse logic for other response types)
      // ...existing code...
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
        const token = localStorage.getItem('token');
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
    <Card className="border-0 bg-body" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <CardBody className="p-0 d-flex flex-column" style={{ height: '700px' }}>
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">AI Classroom Chat</h5>
            {conversationId && (
              <small className="text-muted">Conversation ID: {conversationId}</small>
            )}
          </div>
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
            <Dropdown>
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
        </div>
        
        <div className="flex-grow-1 p-3 overflow-auto">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-3 d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div 
                className={`rounded-3 p-3 ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white' 
                    : msg.type === 'nextSteps' 
                      ? 'bg-info bg-opacity-10 border-start border-info border-3' 
                      : 'bg border'
                }`}
                style={{ maxWidth: '80%' }}
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
        {/* Prompt suggestions */}
        <div className="p-3">
          <PromptSuggestions 
            onPromptSelect={handlePromptSelect} 
            isLoading={isLoading} 
          />
        </div>
      </CardBody>
    </Card>
  );
}

