'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  Spinner,
  Dropdown,
  Modal,
  Form,
  Tab,
  Nav,
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import PageTitle from '@/components/PageTitle';
import {
  getAgents,
  createAgent,
  deleteAgent,
  toggleAgentStatus,
  getGmailAuthUrl,
  getAgentWorkflows,
  getAgentStats,
} from '@/lib/api/automation';
import WorkflowBuilder from './components/WorkflowBuilder';
import ExecutionHistory from './components/ExecutionHistory';
import AIConfigModal from './components/AIConfigModal';

export default function AutomationPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIConfigModal, setShowAIConfigModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeTab, setActiveTab] = useState('agents');
  
  // Create agent form
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentType, setAgentType] = useState('email_inbound');
  const [pollingInterval, setPollingInterval] = useState(60);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAgents();
      console.log('Raw API Response:', data);
      
      // Handle different API response structures
      let agentsList = [];
      if (Array.isArray(data)) {
        // API returns array directly
        agentsList = data;
      } else if (data.agents && Array.isArray(data.agents)) {
        // API returns {agents: [...]}
        agentsList = data.agents;
      } else if (data.data && Array.isArray(data.data)) {
        // API returns {data: [...]}
        agentsList = data.data;
      }
      
      console.log('Parsed agents:', agentsList);
      setAgents(agentsList);
    } catch (err) {
      console.error('Error loading agents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await createAgent({
        name: agentName,
        description: agentDescription,
        type: agentType,
        config: {
          pollingInterval: parseInt(pollingInterval),
        },
      });
      
      setShowCreateModal(false);
      resetForm();
      
      // For email agents, immediately prompt for Gmail authorization
      if (agentType === 'email_inbound' || agentType === 'email_outbound') {
        const agentId = response.agent?.id || response.id;
        if (agentId) {
          setSuccess('Agent created! Now authorize Gmail to complete setup...');
          // Wait a moment for success message to be visible
          setTimeout(async () => {
            try {
              const authData = await getGmailAuthUrl(agentId);
              if (authData.authUrl) {
                window.open(authData.authUrl, '_blank', 'width=600,height=700');
              }
            } catch (err) {
              setError('Agent created but Gmail authorization failed. Please authorize manually.');
            }
          }, 1000);
        }
      } else {
        setSuccess('Agent created successfully!');
      }
      
      loadAgents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      setError(null);
      await deleteAgent(agentId);
      setSuccess('Agent deleted successfully!');
      loadAgents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (agentId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      setError(null);
      await toggleAgentStatus(agentId, newStatus);
      setSuccess(`Agent ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      loadAgents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAuthorizeGmail = async (agentId) => {
    try {
      setError(null);
      const data = await getGmailAuthUrl(agentId);
      if (data.authUrl) {
        window.open(data.authUrl, '_blank');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setAgentName('');
    setAgentDescription('');
    setAgentType('email_inbound');
    setPollingInterval(60);
  };

  return (
    <>
      <PageTitle title="Automation" />
      <Container fluid>
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

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Card>
            <CardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <CardTitle className="mb-0">
                  <IconifyIcon icon="ri:robot-2-line" className="me-2" />
                  Email Automation
                </CardTitle>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowAIConfigModal(true)}
                  >
                    <IconifyIcon icon="ri:sparkling-line" className="me-1" />
                    AI Settings
                  </Button>
                  {activeTab === 'agents' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      Create Agent
                    </Button>
                  )}
                </div>
              </div>
              <Nav variant="tabs" className="mt-3">
                <Nav.Item>
                  <Nav.Link eventKey="agents">
                    <IconifyIcon icon="ri:robot-line" className="me-1" />
                    Agents
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="workflows" disabled={!selectedAgent}>
                    <IconifyIcon icon="ri:flow-chart" className="me-1" />
                    Workflows
                    {selectedAgent && (
                      <Badge bg="primary" className="ms-2">
                        {selectedAgent.name}
                      </Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="history" disabled={!selectedAgent}>
                    <IconifyIcon icon="ri:history-line" className="me-1" />
                    Execution History
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </CardHeader>

            <CardBody>
              <Tab.Content>
                <Tab.Pane eventKey="agents">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" />
                      <p className="mt-2">Loading agents...</p>
                    </div>
                  ) : agents.length === 0 ? (
                    <div className="text-center py-5">
                      <IconifyIcon
                        icon="ri:robot-2-line"
                        style={{ fontSize: '4rem', opacity: 0.3 }}
                      />
                      <h5 className="mt-3">No agents yet</h5>
                      <p className="text-muted">
                        Create your first email automation agent to get started
                      </p>
                      <Alert variant="info" className="mb-3 mx-auto" style={{ maxWidth: '500px' }}>
                        <IconifyIcon icon="ri:lightbulb-line" className="me-2" />
                        <strong>First time? Configure AI Settings first!</strong>
                        <p className="mb-0 mt-2 small">
                          Add your OpenAI API key to enable AI-powered email responses.
                        </p>
                      </Alert>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button
                          variant="outline-primary"
                          onClick={() => setShowAIConfigModal(true)}
                        >
                          <IconifyIcon icon="ri:sparkling-line" className="me-1" />
                          Configure AI
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => setShowCreateModal(true)}
                        >
                          <IconifyIcon icon="ri:add-line" className="me-1" />
                          Create First Agent
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Row>
                      {agents.map((agent) => (
                        <Col key={agent.id} md={6} lg={4} className="mb-3">
                          <Card className="h-100">
                            <CardBody>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h5 className="mb-1">{agent.name}</h5>
                                  <small className="text-muted">
                                    {agent.description}
                                  </small>
                                </div>
                                <Dropdown align="end">
                                  <Dropdown.Toggle
                                    variant="light"
                                    size="sm"
                                    className="no-caret"
                                  >
                                    <IconifyIcon icon="ri:more-2-fill" />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      onClick={() => {
                                        setSelectedAgent(agent);
                                        setActiveTab('workflows');
                                      }}
                                    >
                                      <IconifyIcon
                                        icon="ri:flow-chart"
                                        className="me-2"
                                      />
                                      Manage Workflows
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() =>
                                        handleAuthorizeGmail(agent.id)
                                      }
                                    >
                                      <IconifyIcon
                                        icon="ri:google-fill"
                                        className="me-2"
                                      />
                                      Authorize Gmail
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() => {
                                        setSelectedAgent(agent);
                                        setActiveTab('history');
                                      }}
                                    >
                                      <IconifyIcon
                                        icon="ri:history-line"
                                        className="me-2"
                                      />
                                      View History
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item
                                      className="text-danger"
                                      onClick={() => handleDeleteAgent(agent.id)}
                                    >
                                      <IconifyIcon
                                        icon="ri:delete-bin-line"
                                        className="me-2"
                                      />
                                      Delete Agent
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>

                              <div className="mb-3">
                                <Badge
                                  bg={
                                    agent.status === 'active'
                                      ? 'success'
                                      : 'secondary'
                                  }
                                  className="me-2"
                                >
                                  {agent.status}
                                </Badge>
                                <Badge bg="info" className="me-2">{agent.type}</Badge>
                                {(agent.type === 'email_inbound' || agent.type === 'email_outbound') && (
                                  <Badge bg={agent.isGmailConnected ? 'success' : 'danger'}>
                                    <IconifyIcon 
                                      icon={agent.isGmailConnected ? 'ri:mail-check-line' : 'ri:mail-close-line'} 
                                      className="me-1" 
                                    />
                                    {agent.isGmailConnected 
                                      ? `Gmail: ${agent.connectedEmail || 'Connected'}` 
                                      : 'Gmail Not Connected'}
                                  </Badge>
                                )}
                              </div>

                              <div className="d-grid gap-2">
                                {/* Show Gmail authorization button if not configured */}
                                {(agent.type === 'email_inbound' || agent.type === 'email_outbound') && 
                                 !agent.isGmailConnected && (
                                  <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => handleAuthorizeGmail(agent.id)}
                                    className="mb-2"
                                  >
                                    <IconifyIcon
                                      icon="ri:google-fill"
                                      className="me-1"
                                    />
                                    ⚠️ Authorize Gmail Required
                                  </Button>
                                )}
                                <Button
                                  variant={
                                    agent.status === 'active'
                                      ? 'outline-warning'
                                      : 'outline-success'
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handleToggleStatus(agent.id, agent.status)
                                  }
                                  disabled={
                                    (agent.type === 'email_inbound' || agent.type === 'email_outbound') && 
                                    !agent.isGmailConnected
                                  }
                                >
                                  <IconifyIcon
                                    icon={
                                      agent.status === 'active'
                                        ? 'ri:pause-circle-line'
                                        : 'ri:play-circle-line'
                                    }
                                    className="me-1"
                                  />
                                  {agent.status === 'active'
                                    ? 'Deactivate'
                                    : 'Activate'}
                                </Button>
                              </div>

                              <div className="mt-2">
                                {agent.config?.pollingInterval && (
                                  <small className="text-muted d-block">
                                    <IconifyIcon
                                      icon="ri:time-line"
                                      className="me-1"
                                    />
                                    Checks every {agent.config.pollingInterval}s
                                  </small>
                                )}
                                {agent.isGmailConnected && agent.connectedEmail && (
                                  <small className="text-success d-block">
                                    <IconifyIcon
                                      icon="ri:mail-check-line"
                                      className="me-1"
                                    />
                                    {agent.connectedEmail}
                                  </small>
                                )}
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="workflows">
                  {selectedAgent && (
                    <WorkflowBuilder
                      agent={selectedAgent}
                      onBack={() => {
                        setSelectedAgent(null);
                        setActiveTab('agents');
                      }}
                    />
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="history">
                  {selectedAgent && (
                    <ExecutionHistory
                      agentId={selectedAgent.id}
                      onBack={() => {
                        setSelectedAgent(null);
                        setActiveTab('agents');
                      }}
                    />
                  )}
                </Tab.Pane>
              </Tab.Content>
            </CardBody>
          </Card>
        </Tab.Container>

        {/* AI Config Modal */}
        <AIConfigModal
          show={showAIConfigModal}
          onHide={() => setShowAIConfigModal(false)}
          onSaved={() => {
            setSuccess('AI configuration saved! You can now use AI-powered workflows.');
            setShowAIConfigModal(false);
          }}
        />

        {/* Create Agent Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              <IconifyIcon icon="ri:robot-2-line" className="me-2" />
              Create New Agent
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateAgent}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Agent Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Support Email Bot"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="What does this agent do?"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={agentType}
                  onChange={(e) => setAgentType(e.target.value)}
                >
                  <option value="email_inbound">Email Inbound</option>
                  <option value="email_outbound">Email Outbound</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Polling Interval (seconds)</Form.Label>
                <Form.Control
                  type="number"
                  min="30"
                  max="3600"
                  value={pollingInterval}
                  onChange={(e) => setPollingInterval(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  How often to check for new emails (30-3600 seconds)
                </Form.Text>
              </Form.Group>

              {(agentType === 'email_inbound' || agentType === 'email_outbound') && (
                <Alert variant="info" className="mb-0">
                  <IconifyIcon icon="ri:information-line" className="me-2" />
                  <strong>Gmail Authorization Required:</strong> After creating this agent, 
                  you'll be prompted to authorize Gmail access. This is required for the agent to work.
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <IconifyIcon icon="ri:add-line" className="me-1" />
                Create Agent
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
}

