'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  Form,
  Alert,
  Badge,
  Modal,
  Row,
  Col,
  ListGroup,
  Accordion,
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  getAgentWorkflows,
  createWorkflow,
  deleteWorkflow,
  executeWorkflow,
} from '@/lib/api/automation';

export default function WorkflowBuilder({ agent, onBack }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Workflow form state
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [triggerType, setTriggerType] = useState('email_received');
  const [filterFrom, setFilterFrom] = useState('.*');
  const [filterSubject, setFilterSubject] = useState('.*');
  const [actions, setActions] = useState([]);

  useEffect(() => {
    loadWorkflows();
  }, [agent.id]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAgentWorkflows(agent.id);
      setWorkflows(data.workflows || []);
    } catch (err) {
      console.error('Error loading workflows:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await createWorkflow({
        agentId: agent.id,
        name: workflowName,
        description: workflowDescription,
        triggerConfig: {
          type: triggerType,
          filters: {
            from: filterFrom,
            subject: filterSubject,
          },
        },
        actions: actions,
        status: 'active',
      });
      setSuccess('Workflow created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadWorkflows();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      setError(null);
      await deleteWorkflow(workflowId);
      setSuccess('Workflow deleted successfully!');
      loadWorkflows();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExecuteWorkflow = async (workflowId) => {
    try {
      setError(null);
      await executeWorkflow(workflowId);
      setSuccess('Workflow executed successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const addAction = (actionType) => {
    const newAction = {
      type: actionType,
      config: getDefaultActionConfig(actionType),
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (index) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateActionConfig = (index, config) => {
    const newActions = [...actions];
    newActions[index].config = config;
    setActions(newActions);
  };

  const getDefaultActionConfig = (actionType) => {
    switch (actionType) {
      case 'reply_to_email':
        return { replyBody: 'Thank you for your email!' };
      case 'forward_email':
        return { forwardTo: '' };
      case 'add_label':
        return { label: '' };
      case 'mark_as_read':
        return {};
      case 'mark_as_unread':
        return {};
      default:
        return {};
    }
  };

  const resetForm = () => {
    setWorkflowName('');
    setWorkflowDescription('');
    setTriggerType('email_received');
    setFilterFrom('.*');
    setFilterSubject('.*');
    setActions([]);
  };

  const actionTypes = [
    { value: 'reply_to_email', label: 'Reply to Email', icon: 'ri:reply-line' },
    { value: 'forward_email', label: 'Forward Email', icon: 'ri:share-forward-line' },
    { value: 'add_label', label: 'Add Label', icon: 'ri:price-tag-3-line' },
    { value: 'mark_as_read', label: 'Mark as Read', icon: 'ri:checkbox-circle-line' },
    { value: 'mark_as_unread', label: 'Mark as Unread', icon: 'ri:mail-unread-line' },
  ];

  return (
    <div>
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="link" onClick={onBack} className="p-0 mb-2">
            <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
            Back to Agents
          </Button>
          <h4 className="mb-0">Workflows for {agent.name}</h4>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <IconifyIcon icon="ri:add-line" className="me-1" />
          Create Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <CardBody className="text-center py-5">
            <IconifyIcon
              icon="ri:flow-chart"
              style={{ fontSize: '4rem', opacity: 0.3 }}
            />
            <h5 className="mt-3">No workflows yet</h5>
            <p className="text-muted">
              Create your first workflow to automate email tasks
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Create First Workflow
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Row>
          {workflows.map((workflow) => (
            <Col key={workflow.id} md={12} className="mb-3">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5>{workflow.name}</h5>
                      <p className="text-muted mb-2">{workflow.description}</p>
                      <Badge
                        bg={workflow.status === 'active' ? 'success' : 'secondary'}
                      >
                        {workflow.status}
                      </Badge>
                    </div>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleExecuteWorkflow(workflow.id)}
                      >
                        <IconifyIcon icon="ri:play-line" className="me-1" />
                        Test
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                      >
                        <IconifyIcon icon="ri:delete-bin-line" />
                      </Button>
                    </div>
                  </div>

                  {/* Visual Workflow */}
                  <div className="workflow-visual">
                    {/* Trigger */}
                    <Card className="mb-2 bg-light">
                      <CardBody className="py-2">
                        <div className="d-flex align-items-center">
                          <IconifyIcon
                            icon="ri:mail-line"
                            className="me-2 text-primary"
                            style={{ fontSize: '1.5rem' }}
                          />
                          <div>
                            <strong>Trigger: {workflow.triggerConfig?.type}</strong>
                            {workflow.triggerConfig?.filters && (
                              <div className="small text-muted">
                                From: {workflow.triggerConfig.filters.from || 'Any'} |
                                Subject: {workflow.triggerConfig.filters.subject || 'Any'}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Flow Arrow */}
                    <div className="text-center my-2">
                      <IconifyIcon
                        icon="ri:arrow-down-line"
                        style={{ fontSize: '1.5rem', opacity: 0.5 }}
                      />
                    </div>

                    {/* Actions */}
                    {workflow.actions && workflow.actions.length > 0 ? (
                      workflow.actions.map((action, index) => (
                        <div key={index}>
                          <Card className="mb-2 border-primary">
                            <CardBody className="py-2">
                              <div className="d-flex align-items-center">
                                <IconifyIcon
                                  icon={
                                    actionTypes.find((a) => a.value === action.type)
                                      ?.icon || 'ri:settings-line'
                                  }
                                  className="me-2 text-success"
                                  style={{ fontSize: '1.5rem' }}
                                />
                                <div>
                                  <strong>
                                    {actionTypes.find((a) => a.value === action.type)
                                      ?.label || action.type}
                                  </strong>
                                  {action.config && Object.keys(action.config).length > 0 && (
                                    <div className="small text-muted">
                                      {Object.entries(action.config).map(([key, value]) => (
                                        <div key={key}>
                                          {key}: {value.toString().substring(0, 50)}
                                          {value.toString().length > 50 && '...'}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                          {index < workflow.actions.length - 1 && (
                            <div className="text-center my-2">
                              <IconifyIcon
                                icon="ri:arrow-down-line"
                                style={{ fontSize: '1.5rem', opacity: 0.5 }}
                              />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <Card className="border-secondary">
                        <CardBody className="text-center py-3 text-muted">
                          No actions configured
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create Workflow Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:flow-chart" className="me-2" />
            Create New Workflow
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateWorkflow}>
          <Modal.Body>
            <h6 className="mb-3">Basic Information</h6>
            <Form.Group className="mb-3">
              <Form.Label>Workflow Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Auto-Reply to Support Emails"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="What does this workflow do?"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                required
              />
            </Form.Group>

            <hr />

            <h6 className="mb-3">
              <IconifyIcon icon="ri:flashlight-line" className="me-2" />
              Trigger
            </h6>
            <Form.Group className="mb-3">
              <Form.Label>Trigger Type</Form.Label>
              <Form.Select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
              >
                <option value="email_received">Email Received</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>From Filter (Regex)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=".*"
                    value={filterFrom}
                    onChange={(e) => setFilterFrom(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Use .* for any sender
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject Filter (Regex)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=".*"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Use .* for any subject
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                Actions
              </h6>
            </div>

            {actions.length === 0 && (
              <Alert variant="info">
                <IconifyIcon icon="ri:information-line" className="me-2" />
                Add at least one action to your workflow
              </Alert>
            )}

            {actions.map((action, index) => (
              <Card key={index} className="mb-2">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <strong>
                      {actionTypes.find((a) => a.value === action.type)?.label ||
                        action.type}
                    </strong>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => removeAction(index)}
                    >
                      <IconifyIcon icon="ri:close-line" />
                    </Button>
                  </div>

                  {action.type === 'reply_to_email' && (
                    <Form.Group>
                      <Form.Label>Reply Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={action.config.replyBody || ''}
                        onChange={(e) =>
                          updateActionConfig(index, {
                            ...action.config,
                            replyBody: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  )}

                  {action.type === 'forward_email' && (
                    <Form.Group>
                      <Form.Label>Forward To</Form.Label>
                      <Form.Control
                        type="email"
                        value={action.config.forwardTo || ''}
                        onChange={(e) =>
                          updateActionConfig(index, {
                            ...action.config,
                            forwardTo: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  )}

                  {action.type === 'add_label' && (
                    <Form.Group>
                      <Form.Label>Label Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={action.config.label || ''}
                        onChange={(e) =>
                          updateActionConfig(index, {
                            ...action.config,
                            label: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  )}
                </CardBody>
              </Card>
            ))}

            <Accordion className="mt-3">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <IconifyIcon icon="ri:add-circle-line" className="me-2" />
                  Add Action
                </Accordion.Header>
                <Accordion.Body>
                  <ListGroup>
                    {actionTypes.map((actionType) => (
                      <ListGroup.Item
                        key={actionType.value}
                        action
                        onClick={() => addAction(actionType.value)}
                        className="d-flex align-items-center"
                      >
                        <IconifyIcon
                          icon={actionType.icon}
                          className="me-2"
                          style={{ fontSize: '1.5rem' }}
                        />
                        <div>
                          <strong>{actionType.label}</strong>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={actions.length === 0}>
              <IconifyIcon icon="ri:save-line" className="me-1" />
              Create Workflow
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

