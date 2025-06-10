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

import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardBody, 
  Button, 
  Form, 
  Spinner,
  Alert,
  InputGroup,
  ListGroup,
  Badge,
  Dropdown
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi, I'm Classroom Assistant.", time: new Date() },
    { sender: 'bot', text: "How can I help you today?", time: new Date() }
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
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
    
    return () => {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

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
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      
      // Speak the main message first
      if (data.response?.message) {
        speak(data.response.message);
      } else if (data.response) {
        speak("Here's the information you requested.");
      }
      
      // Add next steps as a separate message after a delay
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

  const renderBotResponse = (msg) => {
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

    if (msg.type === 'structured' && msg.data?.response) {
      const response = msg.data.response;
      const textToSpeak = response.message || "Here's the information you requested.";
      
      return (
        <div>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <Badge bg="info" className="me-2">
                {response.type}
              </Badge>
              <strong>{response.message}</strong>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => toggleSpeech(textToSpeak)}
              className="p-0 ms-2"
              title={isSpeaking ? 'Stop speech' : 'Read aloud'}
            >
              <IconifyIcon 
                icon={isSpeaking ? 'mdi:volume-high' : 'mdi:volume-off'} 
                width={16} 
              />
            </Button>
          </div>

          {response.missingFields && (
            <div className="mb-3">
              <h6>Missing Information:</h6>
              <ListGroup>
                {response.missingFields.map((field, index) => (
                  <ListGroup.Item key={index}>
                    <strong>{field.field}:</strong> {field.description}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {response.currentData && (
            <div className="mb-3">
              <h6>Current Data:</h6>
              <pre className="p-2 bg-light rounded">
                {JSON.stringify(response.currentData, null, 2)}
              </pre>
            </div>
          )}

          {msg.data.intent && (
            <div className="mt-3 p-2 bg-light rounded">
              <h6>Detected Intent:</h6>
              <div>
                <Badge bg="success" className="me-2">
                  {msg.data.intent.intent} ({msg.data.intent.confidence.toFixed(2)})
                </Badge>
                {msg.data.intent.parameters && (
                  <pre className="mt-2 mb-0">
                    {JSON.stringify(msg.data.intent.parameters, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return <div>Unknown response format</div>;
  };

  return (
    <Card className="shadow-sm border-0" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <CardBody className="p-0 d-flex flex-column" style={{ height: '600px' }}>
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">AI Classroom Chat</h5>
            {conversationId && (
              <small className="text-muted">Conversation ID: {conversationId}</small>
            )}
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
                className={`rounded p-3 ${
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
              <div className="border rounded p-3">
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
        
        <div className="p-3 border-top">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Form.Control
                as="textarea"
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message To AI Classroom"
                style={{ resize: 'none' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading}
              />
              <Button 
                variant="primary" 
                type="submit" 
                disabled={!message.trim() || isLoading}
              >
                <IconifyIcon icon="mdi:send" width={20} />
              </Button>
            </InputGroup>
            
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
      </CardBody>
    </Card>
  );
}