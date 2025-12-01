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
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
} from '@/lib/api/automation';
import {
  getRecipientLists,
  uploadRecipientList,
  deleteRecipientList,
} from '@/lib/api/recipientLists';
import OutboundWorkflowExamples from './OutboundWorkflowExamples';
import ActionSelector from './ActionSelector';

export default function WorkflowBuilder({ agent, onBack }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [executeData, setExecuteData] = useState('{}');
  const [showExamples, setShowExamples] = useState(false);

  // Workflow form state
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [triggerType, setTriggerType] = useState('email_received');
  const [filterFrom, setFilterFrom] = useState('.*');
  const [filterSubject, setFilterSubject] = useState('.*');
  const [actions, setActions] = useState([]);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState('monday');
  const [showTemplates, setShowTemplates] = useState(false);
  const [recipientLists, setRecipientLists] = useState([]);
  const [showUploadCSV, setShowUploadCSV] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvListName, setCsvListName] = useState('');
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [showActionSelector, setShowActionSelector] = useState(false);

  useEffect(() => {
    loadWorkflows();
    if (isOutbound) {
      loadRecipientLists();
    }
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

  const loadRecipientLists = async () => {
    try {
      const data = await getRecipientLists(agent.id);
      // API returns 'lists' not 'recipientLists'
      setRecipientLists(data.lists || []);
    } catch (err) {
      console.error('Error loading recipient lists:', err);
    }
  };

  const handleUploadCSV = async (e) => {
    e.preventDefault();
    if (!csvFile || !csvListName) return;

    try {
      setUploadingCSV(true);
      setError(null);
      await uploadRecipientList(agent.id, csvListName, csvFile);
      setSuccess('CSV uploaded successfully!');
      setShowUploadCSV(false);
      setCsvFile(null);
      setCsvListName('');
      loadRecipientLists();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingCSV(false);
    }
  };

  const handleDeleteRecipientList = async (listId) => {
    if (!window.confirm('Delete this recipient list? This cannot be undone.')) return;
    
    try {
      await deleteRecipientList(listId);
      setSuccess('Recipient list deleted');
      loadRecipientLists();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveWorkflow = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Build trigger config based on agent type and trigger type
      let triggerConfig = { type: triggerType };
      
      if (triggerType === 'email_received') {
        triggerConfig.filters = {
          from: filterFrom,
          subject: filterSubject,
        };
      } else if (triggerType === 'schedule') {
        triggerConfig.schedule = {
          frequency: scheduleFrequency,
          time: scheduleTime,
        };
        if (scheduleFrequency === 'weekly') {
          triggerConfig.schedule.dayOfWeek = scheduleDayOfWeek;
        }
      }
      
      const workflowData = {
        agentId: agent.id,
        name: workflowName,
        description: workflowDescription,
        triggerConfig,
        actions: actions,
        status: 'active',
      };

      if (editingWorkflow) {
        // Update existing workflow
        await updateWorkflow(editingWorkflow.id, workflowData);
        setSuccess('Workflow updated successfully!');
      } else {
        // Create new workflow
        await createWorkflow(workflowData);
        setSuccess('Workflow created successfully!');
      }
      
      setShowWorkflowModal(false);
      resetForm();
      setEditingWorkflow(null);
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

  const handleExecuteWorkflow = async (workflow) => {
    // Check if workflow has bulk email action
    const hasBulkEmail = workflow.actions?.some(action => action.type === 'send_bulk_email');
    
    // For bulk email workflows, execute immediately (CSV data is already loaded)
    if (hasBulkEmail) {
      if (!window.confirm(`Execute bulk email workflow "${workflow.name}"? This will send emails to all recipients in the list.`)) {
        return;
      }
      try {
        setError(null);
        await executeWorkflow(workflow.id);
        setSuccess('Bulk email workflow started! Emails are being sent.');
      } catch (err) {
        setError(err.message);
      }
      return;
    }
    
    // For manual workflows with variables, show execute modal
    if (workflow.triggerConfig?.type === 'manual') {
      setSelectedWorkflow(workflow);
      setShowExecuteModal(true);
      // Pre-populate with sample data based on template
      const sampleData = generateSampleData(workflow);
      setExecuteData(JSON.stringify(sampleData, null, 2));
    } else {
      // Execute immediately for other workflows
      try {
        setError(null);
        await executeWorkflow(workflow.id);
        setSuccess('Workflow executed successfully!');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleExecuteWithData = async () => {
    try {
      setError(null);
      let data = {};
      try {
        data = JSON.parse(executeData);
      } catch (parseError) {
        setError('Invalid JSON format. Please check your data.');
        return;
      }
      
      // If data is empty object, pass null to execute workflow without data
      await executeWorkflow(selectedWorkflow.id, Object.keys(data).length > 0 ? data : null);
      setSuccess('Workflow executed successfully!');
      setShowExecuteModal(false);
      setSelectedWorkflow(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const generateSampleData = (workflow) => {
    // Extract variables from workflow actions
    const variables = {};
    
    workflow.actions?.forEach(action => {
      if (action.config) {
        Object.values(action.config).forEach(value => {
          if (typeof value === 'string') {
            const matches = value.matchAll(/\{\{(\w+)\}\}/g);
            for (const match of matches) {
              const varName = match[1];
              if (!variables[varName]) {
                variables[varName] = getSampleValue(varName);
              }
            }
          }
        });
      }
    });

    return variables;
  };

  const getSampleValue = (varName) => {
    const samples = {
      recipient: 'customer@example.com',
      email: 'john@example.com',
      name: 'John',
      product_name: 'XYTEK AI Classroom',
      benefits: 'automated grading, AI teaching assistant, real-time insights',
      action_taken: 'attended our webinar on AI automation',
      date: new Date().toLocaleDateString(),
      company_goal: 'helping educators save time',
      feature_name: 'AI Content Generator',
      audience: 'marketing professionals',
      tone: 'professional and exciting',
      recipient_list: 'team@example.com',
      recipients: 'team@xytek.ai',
      topic: 'AI automation trends'
    };
    return samples[varName] || `sample_${varName}`;
  };

  const addAction = (actionType) => {
    const newAction = {
      type: actionType,
      config: getDefaultActionConfig(actionType),
    };
    setActions([...actions, newAction]);
    setShowActionSelector(false);
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
      case 'generate_ai_reply':
        return { 
          systemPrompt: 'You are a friendly and professional customer support agent. Be helpful, concise, and empathetic. Keep responses under 100 words.',
          temperature: 0.7,
          maxTokens: 300
        };
      case 'generate_ai_content':
        return {
          prompt: 'Write a personalized email for {{name}} at {{company}}. Make it engaging and friendly. Include relevant information about their {{plan}} plan. Add a call-to-action. Keep it under 150 words.',
          systemPrompt: 'You are a professional marketing copywriter. Write personalized, benefit-focused emails that engage readers.',
          temperature: 0.7,
          maxTokens: 400
        };
      case 'send_email':
        return {
          to: '',
          subject: '',
          body: '{{ai_content}}',
          isHtml: false
        };
      case 'send_bulk_email':
        return {
          recipientListId: '',
          subject: 'Hi {{name}}! Update from our team',
          body: '{{ai_content}}',
          delayBetweenEmails: 1000,
          isHtml: false
        };
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
    setTriggerType(agent.type === 'email_outbound' ? 'manual' : 'email_received');
    setFilterFrom('.*');
    setFilterSubject('.*');
    setActions([]);
    setScheduleFrequency('daily');
    setScheduleTime('08:00');
    setScheduleDayOfWeek('monday');
    setShowTemplates(false);
    setEditingWorkflow(null);
  };

  const handleEditWorkflow = (workflow) => {
    setEditingWorkflow(workflow);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description || '');
    setTriggerType(workflow.triggerConfig?.type || 'email_received');
    
    if (workflow.triggerConfig?.filters) {
      setFilterFrom(workflow.triggerConfig.filters.from || '.*');
      setFilterSubject(workflow.triggerConfig.filters.subject || '.*');
    }
    
    if (workflow.triggerConfig?.schedule) {
      setScheduleFrequency(workflow.triggerConfig.schedule.frequency || 'daily');
      setScheduleTime(workflow.triggerConfig.schedule.time || '08:00');
      setScheduleDayOfWeek(workflow.triggerConfig.schedule.dayOfWeek || 'monday');
    }
    
    setActions(workflow.actions || []);
    
    // Reload recipient lists to ensure latest data
    if (isOutbound) {
      loadRecipientLists();
    }
    
    setShowWorkflowModal(true);
  };

  const handleOpenCreateWorkflow = () => {
    // Reload recipient lists when opening create modal
    if (isOutbound) {
      loadRecipientLists();
    }
    setShowWorkflowModal(true);
  };

  const isOutbound = agent.type === 'email_outbound';

  // Workflow templates for outbound campaigns
  const workflowTemplates = [
    {
      id: 'marketing_email',
      name: 'AI Marketing Email',
      description: 'AI-generated marketing emails with product highlights',
      icon: 'ri:mail-star-line',
      triggerType: 'manual',
      actions: [
        {
          type: 'generate_ai_content',
          config: {
            prompt: 'Write a marketing email about {{product_name}}. Highlight: {{benefits}}. Include a call-to-action. Keep it under 150 words and friendly.',
            systemPrompt: 'You are a professional marketing copywriter. Write engaging, benefit-focused emails that convert.',
            temperature: 0.7,
            maxTokens: 300
          }
        },
        {
          type: 'send_email',
          config: {
            to: '{{recipient}}',
            subject: 'Discover {{product_name}} - Perfect for You!',
            body: '{{ai_content}}',
            isHtml: false
          }
        }
      ]
    },
    {
      id: 'follow_up',
      name: 'Personalized Follow-Up',
      description: 'AI-powered personalized follow-up emails',
      icon: 'ri:user-follow-line',
      triggerType: 'manual',
      actions: [
        {
          type: 'generate_ai_content',
          config: {
            prompt: 'Write a friendly follow-up email to {{name}} who {{action_taken}}. Ask for their feedback and offer help. Be warm and conversational. Under 100 words.',
            systemPrompt: 'You are a friendly and empathetic account manager.',
            temperature: 0.8,
            maxTokens: 250
          }
        },
        {
          type: 'send_email',
          config: {
            to: '{{email}}',
            subject: 'How did it go, {{name}}?',
            body: '{{ai_content}}',
            isHtml: false
          }
        }
      ]
    },
    {
      id: 'daily_newsletter',
      name: 'Daily AI Newsletter',
      description: 'Automated daily newsletters with AI-generated content',
      icon: 'ri:newspaper-line',
      triggerType: 'schedule',
      scheduleFrequency: 'daily',
      scheduleTime: '08:00',
      actions: [
        {
          type: 'generate_ai_content',
          config: {
            prompt: 'Create a brief morning newsletter for {{date}}. Include: 1) A motivational quote, 2) Today\'s tip for productivity, 3) A quick reminder about {{company_goal}}. Keep it energizing and under 150 words.',
            systemPrompt: 'You are an inspiring team leader. Write motivational, actionable content.',
            temperature: 0.7,
            maxTokens: 300
          }
        },
        {
          type: 'send_email',
          config: {
            to: '{{recipients}}',
            subject: 'Good Morning! ☀️ - {{date}}',
            body: '{{ai_content}}',
            isHtml: false
          }
        }
      ]
    },
    {
      id: 'product_launch',
      name: 'Product Launch Email',
      description: 'AI-generated product announcement emails',
      icon: 'ri:rocket-line',
      triggerType: 'manual',
      actions: [
        {
          type: 'generate_ai_content',
          config: {
            prompt: 'Write an exciting product launch email for {{feature_name}}. Target audience: {{audience}}. Key benefits: {{benefits}}. Tone: {{tone}}. Include a clear CTA. Under 200 words.',
            systemPrompt: 'You are an expert product marketer. Create excitement and urgency.',
            temperature: 0.8,
            maxTokens: 400
          }
        },
        {
          type: 'send_email',
          config: {
            to: '{{recipient_list}}',
            subject: '🚀 Introducing {{feature_name}}!',
            body: '{{ai_content}}',
            isHtml: false
          }
        }
      ]
    },
    {
      id: 'bulk_campaign',
      name: 'AI Bulk Email Campaign',
      description: 'AI-generated personalized emails to CSV recipients',
      icon: 'ri:mail-send-fill',
      triggerType: 'manual',
      actions: [
        {
          type: 'generate_ai_content',
          config: {
            prompt: 'Write a personalized marketing email for {{name}} at {{company}}. Their plan: {{plan}}. Make it friendly, highlight plan benefits, and include a call-to-action. Keep it under 150 words.',
            systemPrompt: 'You are a professional marketing copywriter. Write engaging, personalized emails that convert.',
            temperature: 0.7,
            maxTokens: 400
          }
        },
        {
          type: 'send_bulk_email',
          config: {
            recipientListId: '',
            subject: 'Hi {{name}}! Special update from {{company}}',
            body: '{{ai_content}}',
            delayBetweenEmails: 1000,
            isHtml: false
          }
        }
      ]
    }
  ];

  const applyTemplate = (template) => {
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setTriggerType(template.triggerType);
    setActions(template.actions);
    if (template.scheduleFrequency) setScheduleFrequency(template.scheduleFrequency);
    if (template.scheduleTime) setScheduleTime(template.scheduleTime);
    setShowTemplates(false);
  };
  
  const actionTypes = isOutbound ? [
    { value: 'generate_ai_content', label: '🤖 AI Content Generator', icon: 'ri:sparkling-line', category: 'ai', description: 'Generate marketing content, emails, newsletters with AI' },
    { value: 'send_email', label: '📧 Send Email', icon: 'ri:mail-send-line', category: 'outbound', description: 'Send emails to specified recipients' },
    { value: 'send_bulk_email', label: '📮 Send Bulk Email', icon: 'ri:mail-send-fill', category: 'outbound', description: 'Send to CSV recipient list with personalization' },
  ] : [
    { value: 'generate_ai_reply', label: '🤖 AI Auto-Reply', icon: 'ri:sparkling-line', category: 'ai', description: 'Generates intelligent, contextual responses' },
    { value: 'reply_to_email', label: 'Reply to Email', icon: 'ri:reply-line', category: 'basic' },
    { value: 'forward_email', label: 'Forward Email', icon: 'ri:share-forward-line', category: 'basic' },
    { value: 'add_label', label: 'Add Label', icon: 'ri:price-tag-3-line', category: 'basic' },
    { value: 'mark_as_read', label: 'Mark as Read', icon: 'ri:checkbox-circle-line', category: 'basic' },
    { value: 'mark_as_unread', label: 'Mark as Unread', icon: 'ri:mail-unread-line', category: 'basic' },
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
        <div className="d-flex gap-2">
          {isOutbound && (
            <>
              <Button variant="outline-secondary" onClick={() => setShowUploadCSV(true)}>
                <IconifyIcon icon="ri:file-upload-line" className="me-1" />
                Upload CSV
              </Button>
              <Button variant="outline-info" onClick={() => setShowExamples(true)}>
                <IconifyIcon icon="ri:book-open-line" className="me-1" />
                Examples
              </Button>
            </>
          )}
          <Button variant="primary" onClick={handleOpenCreateWorkflow}>
            <IconifyIcon icon="ri:add-line" className="me-1" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Recipient Lists Section for Outbound */}
      {isOutbound && recipientLists.length > 0 && (
        <Card className="mb-3">
          <CardBody>
            <h6 className="mb-3">
              <IconifyIcon icon="ri:contacts-line" className="me-2" />
              Recipient Lists ({recipientLists.length})
            </h6>
            <Row>
              {recipientLists.map((list) => (
                <Col key={list.id} md={6} lg={4} className="mb-2">
                  <Card className="bg-light">
                    <CardBody className="py-2">
                      <div className="d-flex justify-content-between align-items-center">
                         <div>
                           <strong>{list.name}</strong>
                           <div className="small text-muted">
                             {list.total_count || 0} recipients
                           </div>
                         </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => handleDeleteRecipientList(list.id)}
                        >
                          <IconifyIcon icon="ri:delete-bin-line" />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      )}

      {workflows.length === 0 ? (
        <Card>
          <CardBody className="text-center py-5">
            <IconifyIcon
              icon="ri:flow-chart"
              style={{ fontSize: '4rem', opacity: 0.3 }}
            />
            <h5 className="mt-3">No workflows yet</h5>
            <p className="text-muted">
              {isOutbound 
                ? 'Create AI-powered campaigns, newsletters, and outbound emails'
                : 'Create your first workflow to automate email tasks'}
            </p>
            <div className="d-flex gap-2 justify-content-center">
              {isOutbound && (
                <Button variant="outline-info" onClick={() => setShowExamples(true)}>
                  <IconifyIcon icon="ri:book-open-line" className="me-1" />
                  View Examples
                </Button>
              )}
              <Button variant="primary" onClick={handleOpenCreateWorkflow}>
                <IconifyIcon icon="ri:add-line" className="me-1" />
                Create First Workflow
              </Button>
            </div>
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
                      {(workflow.triggerConfig?.type === 'manual' || 
                        workflow.actions?.some(a => a.type === 'send_bulk_email')) && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleExecuteWorkflow(workflow)}
                        >
                          <IconifyIcon icon="ri:play-fill" className="me-1" />
                          Execute
                        </Button>
                      )}
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditWorkflow(workflow)}
                      >
                        <IconifyIcon icon="ri:edit-line" className="me-1" />
                        Edit
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
                             icon={
                               workflow.triggerConfig?.type === 'manual' ? 'ri:hand-coin-line' :
                               workflow.triggerConfig?.type === 'schedule' ? 'ri:calendar-line' :
                               'ri:mail-line'
                             }
                             className="me-2 text-primary"
                             style={{ fontSize: '1.5rem' }}
                           />
                           <div>
                             <strong>Trigger: {workflow.triggerConfig?.type || 'Not set'}</strong>
                             {workflow.triggerConfig?.filters && (
                               <div className="small text-muted">
                                 From: {workflow.triggerConfig.filters.from || 'Any'} |
                                 Subject: {workflow.triggerConfig.filters.subject || 'Any'}
                               </div>
                             )}
                             {workflow.triggerConfig?.schedule && (
                               <div className="small text-muted">
                                 {workflow.triggerConfig.schedule.frequency} at {workflow.triggerConfig.schedule.time}
                                 {workflow.triggerConfig.schedule.dayOfWeek && ` (${workflow.triggerConfig.schedule.dayOfWeek})`}
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
                      <>
                        <div className="mt-3 mb-2">
                          <small className="text-muted">
                            <IconifyIcon icon="ri:flow-chart" className="me-1" />
                            Workflow Steps ({workflow.actions.length})
                          </small>
                        </div>
                        {workflow.actions.map((action, index) => {
                          const actionDef = actionTypes.find((a) => a.value === action.type);
                          const isAI = actionDef?.category === 'ai';
                          const isOutbound = actionDef?.category === 'outbound';
                          return (
                            <div key={index}>
                              {index > 0 && (
                                <div className="text-center" style={{ margin: '4px 0' }}>
                                  <IconifyIcon 
                                    icon="ri:arrow-down-s-line" 
                                    className="text-muted"
                                    style={{ fontSize: '1.5rem' }}
                                  />
                                </div>
                              )}
                              <Card className={`mb-0 ${
                                isAI ? 'border-primary' : 
                                isOutbound ? 'border-success' : 
                                'border-secondary'
                              }`} style={{ borderWidth: '2px' }}>
                                <CardBody className="py-2">
                                  <div className="d-flex align-items-start">
                                    <div 
                                      className={`d-inline-flex align-items-center justify-content-center rounded-circle me-2 ${
                                        isAI ? 'bg-primary bg-opacity-10' :
                                        isOutbound ? 'bg-success bg-opacity-10' :
                                        'bg-secondary bg-opacity-10'
                                      }`}
                                      style={{ width: '36px', height: '36px', minWidth: '36px' }}
                                    >
                                      <IconifyIcon
                                        icon={actionDef?.icon || 'ri:settings-line'}
                                        className={
                                          isAI ? 'text-primary' :
                                          isOutbound ? 'text-success' :
                                          'text-secondary'
                                        }
                                        style={{ fontSize: '1.3rem' }}
                                      />
                                    </div>
                                    <div className="flex-grow-1">
                                      <div className="d-flex align-items-center mb-1">
                                        <strong className="me-2">
                                          {actionDef?.label || action.type}
                                        </strong>
                                        {isAI && (
                                          <Badge bg="primary" className="me-1">AI</Badge>
                                        )}
                                        <Badge bg="light" text="dark" className="border" style={{ fontSize: '0.7rem' }}>
                                          #{index + 1}
                                        </Badge>
                                      </div>
                                    {action.config && Object.keys(action.config).length > 0 && (
                                      <div className="small text-muted mt-1">
                                        {/* AI Reply (Inbound) */}
                                        {action.type === 'generate_ai_reply' && (
                                          <>
                                            {action.config.systemPrompt && (
                                              <div>
                                                <strong>Prompt:</strong> {action.config.systemPrompt.substring(0, 60)}
                                                {action.config.systemPrompt.length > 60 && '...'}
                                              </div>
                                            )}
                                            <div className="mt-1">
                                              <Badge bg="secondary" className="me-1">
                                                Temp: {action.config.temperature || 0.7}
                                              </Badge>
                                              <Badge bg="secondary">
                                                Max: {action.config.maxTokens || 300} tokens
                                              </Badge>
                                            </div>
                                          </>
                                        )}
                                        
                                        {/* AI Content Generator (Outbound) */}
                                        {action.type === 'generate_ai_content' && (
                                          <>
                                            {action.config.prompt && (
                                              <div>
                                                <strong>Content:</strong> {action.config.prompt.substring(0, 60)}
                                                {action.config.prompt.length > 60 && '...'}
                                              </div>
                                            )}
                                            <div className="mt-1">
                                              <Badge bg="secondary" className="me-1">
                                                Temp: {action.config.temperature || 0.7}
                                              </Badge>
                                              <Badge bg="secondary">
                                                Max: {action.config.maxTokens || 500} tokens
                                              </Badge>
                                            </div>
                                          </>
                                        )}

                                        {/* Send Email (Outbound) */}
                                        {action.type === 'send_email' && (
                                          <>
                                            <div>
                                              <strong>To:</strong> {action.config.to || 'Not configured'}
                                            </div>
                                            <div>
                                              <strong>Subject:</strong> {action.config.subject?.substring(0, 40) || 'Not configured'}
                                              {action.config.subject && action.config.subject.length > 40 && '...'}
                                            </div>
                                          </>
                                        )}

                                        {/* Send Bulk Email (Outbound) */}
                                        {action.type === 'send_bulk_email' && (
                                          <>
                                            <div>
                                              <strong>List:</strong> {
                                                recipientLists.find(l => l.id === action.config.recipientListId)?.name || 
                                                `List #${action.config.recipientListId || 'Not selected'}`
                                              }
                                            </div>
                                             <div>
                                               <strong>Recipients:</strong> {
                                                 recipientLists.find(l => l.id === action.config.recipientListId)?.total_count || 0
                                               }
                                             </div>
                                            <div>
                                              <strong>Subject:</strong> {action.config.subject?.substring(0, 35) || 'Not configured'}
                                              {action.config.subject && action.config.subject.length > 35 && '...'}
                                            </div>
                                            <div className="mt-1">
                                              <Badge bg="info">
                                                Delay: {action.config.delayBetweenEmails || 1000}ms
                                              </Badge>
                                            </div>
                                          </>
                                        )}

                                        {/* Other Actions */}
                                        {!['generate_ai_reply', 'generate_ai_content', 'send_email'].includes(action.type) && 
                                          Object.entries(action.config).map(([key, value]) => (
                                            <div key={key}>
                                              {key}: {value.toString().substring(0, 50)}
                                              {value.toString().length > 50 && '...'}
                                            </div>
                                          ))
                                        }
                                      </div>
                                    )}
                                  </div>
                                </div>
                                </CardBody>
                              </Card>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className="mt-3">
                        <Alert variant="light" className="border text-center">
                          <IconifyIcon icon="ri:information-line" className="me-2" />
                          No actions configured yet
                        </Alert>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create/Edit Workflow Modal */}
      <Modal
        show={showWorkflowModal}
        onHide={() => {
          setShowWorkflowModal(false);
          resetForm();
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:flow-chart" className="me-2" />
            {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveWorkflow}>
          <Modal.Body>
            {/* Template Selector for Outbound (only when creating new) */}
            {isOutbound && !editingWorkflow && !showTemplates && actions.length === 0 && (
              <Alert variant="primary" className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <IconifyIcon icon="ri:magic-line" className="me-2" />
                    <strong>Quick Start with Templates</strong>
                    <p className="mb-0 mt-1 small">
                      Use pre-built AI-powered workflow templates for common use cases
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowTemplates(true)}
                  >
                    Browse Templates
                  </Button>
                </div>
              </Alert>
            )}

            {/* Templates Grid */}
            {showTemplates && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <IconifyIcon icon="ri:layout-grid-line" className="me-2" />
                    Workflow Templates
                  </h6>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowTemplates(false)}
                  >
                    Create from Scratch
                  </Button>
                </div>
                <Row>
                  {workflowTemplates.map((template) => (
                    <Col key={template.id} md={6} className="mb-3">
                      <Card
                        className="h-100 cursor-pointer border-primary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => applyTemplate(template)}
                      >
                        <CardBody>
                          <div className="text-center mb-2">
                            <IconifyIcon
                              icon={template.icon}
                              style={{ fontSize: '2.5rem' }}
                              className="text-primary"
                            />
                          </div>
                          <h6 className="text-center mb-2">{template.name}</h6>
                          <p className="text-muted small text-center mb-0">
                            {template.description}
                          </p>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <hr />
              </div>
            )}

            <h6 className="mb-3">Basic Information</h6>
            <Form.Group className="mb-3">
              <Form.Label>Workflow Name</Form.Label>
              <Form.Control
                type="text"
                placeholder={isOutbound ? "e.g., AI Marketing Campaign" : "e.g., Auto-Reply to Support Emails"}
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
                {isOutbound ? (
                  <>
                    <option value="manual">Manual (Execute on demand)</option>
                    <option value="schedule">Schedule (Run automatically)</option>
                  </>
                ) : (
                  <option value="email_received">Email Received</option>
                )}
              </Form.Select>
            </Form.Group>

            {/* Inbound Email Filters */}
            {triggerType === 'email_received' && (
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
            )}

            {/* Schedule Configuration */}
            {triggerType === 'schedule' && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Frequency</Form.Label>
                      <Form.Select
                        value={scheduleFrequency}
                        onChange={(e) => setScheduleFrequency(e.target.value)}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {scheduleFrequency === 'weekly' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Day of Week</Form.Label>
                    <Form.Select
                      value={scheduleDayOfWeek}
                      onChange={(e) => setScheduleDayOfWeek(e.target.value)}
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </Form.Select>
                  </Form.Group>
                )}
              </>
            )}

            {/* Manual Trigger Info */}
            {triggerType === 'manual' && (
              <Alert variant="info" className="mb-3">
                <IconifyIcon icon="ri:information-line" className="me-2" />
                <small>
                  This workflow will be executed manually via API call. Perfect for 
                  on-demand campaigns with dynamic data (variables like {`{{recipient}}`}, {`{{product_name}}`}, etc.)
                </small>
              </Alert>
            )}

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                Actions
              </h6>
            </div>

             {actions.length === 0 && (
               <Alert variant="primary">
                 <IconifyIcon icon="ri:sparkling-line" className="me-2" />
                 <strong>Add {isOutbound ? 'AI-Powered Campaign' : 'AI-Powered'} Actions</strong>
                 <p className="mb-0 mt-2 small">
                   {isOutbound ? (
                     <>
                       <strong>Recommended workflow for bulk emails:</strong><br/>
                       1. Add <strong>🤖 AI Content Generator</strong> - Tell AI what to write using {`{{csv_variables}}`}<br/>
                       2. Add <strong>📮 Send Bulk Email</strong> - Set body to {`{{ai_content}}`}<br/>
                       AI will generate unique, personalized content for each recipient!
                     </>
                   ) : (
                     <>
                       Start with <strong>🤖 AI Auto-Reply</strong> for intelligent, 
                       contextual email responses powered by AI.
                     </>
                   )}
                 </p>
               </Alert>
             )}

             {actions.map((action, index) => {
               const actionDef = actionTypes.find((a) => a.value === action.type);
               const isAI = actionDef?.category === 'ai';
               const isOutbound = actionDef?.category === 'outbound';
               
               return (
                 <div key={index}>
                   {index > 0 && (
                     <div className="text-center my-2">
                       <div style={{
                         width: '3px',
                         height: '30px',
                         background: 'linear-gradient(to bottom, #dee2e6 0%, #dee2e6 40%, transparent 40%, transparent 60%, #dee2e6 60%, #dee2e6 100%)',
                         margin: '0 auto',
                         position: 'relative'
                       }}>
                         <div style={{
                           position: 'absolute',
                           bottom: '-8px',
                           left: '50%',
                           transform: 'translateX(-50%)',
                           width: '0',
                           height: '0',
                           borderLeft: '6px solid transparent',
                           borderRight: '6px solid transparent',
                           borderTop: '8px solid #dee2e6'
                         }}></div>
                       </div>
                     </div>
                   )}
                   <Card 
                     className={`mb-0 ${
                       isAI ? 'border-primary' : 
                       isOutbound ? 'border-success' : 
                       'border-secondary'
                     }`}
                     style={{ borderWidth: '2px' }}
                   >
                     <CardBody>
                     <div className="d-flex align-items-center mb-3">
                       <div 
                         className={`d-inline-flex align-items-center justify-content-center rounded-circle me-3 ${
                           isAI ? 'bg-primary bg-opacity-10' :
                           isOutbound ? 'bg-success bg-opacity-10' :
                           'bg-secondary bg-opacity-10'
                         }`}
                         style={{ width: '40px', height: '40px', minWidth: '40px' }}
                       >
                         <IconifyIcon
                           icon={actionDef?.icon || 'ri:settings-line'}
                           className={
                             isAI ? 'text-primary' :
                             isOutbound ? 'text-success' :
                             'text-secondary'
                           }
                           style={{ fontSize: '1.5rem' }}
                         />
                       </div>
                       <div className="flex-grow-1">
                         <div className="d-flex align-items-center">
                           <strong className="me-2">
                             {actionDef?.label || action.type}
                           </strong>
                           {isAI && (
                             <Badge bg="primary" className="me-2">AI-Powered</Badge>
                           )}
                           <Badge 
                             bg="light" 
                             text="dark" 
                             className="border"
                           >
                             Step {index + 1}
                           </Badge>
                         </div>
                         {actionDef?.description && (
                           <small className="text-muted">{actionDef.description}</small>
                         )}
                       </div>
                       <Button
                         variant="link"
                         size="sm"
                         className="text-danger p-0"
                         onClick={() => removeAction(index)}
                       >
                         <IconifyIcon icon="ri:delete-bin-line" style={{ fontSize: '1.2rem' }} />
                       </Button>
                     </div>

                  {/* AI Reply for Inbound */}
                  {action.type === 'generate_ai_reply' && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <IconifyIcon icon="ri:sparkling-line" className="me-1" />
                          AI System Prompt
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={action.config.systemPrompt || ''}
                          onChange={(e) =>
                            updateActionConfig(index, {
                              ...action.config,
                              systemPrompt: e.target.value,
                            })
                          }
                          placeholder="You are a helpful customer support agent..."
                        />
                        <Form.Text className="text-muted">
                          Defines the AI's personality and behavior
                        </Form.Text>
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Temperature</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.1"
                              min="0"
                              max="2"
                              value={action.config.temperature || 0.7}
                              onChange={(e) =>
                                updateActionConfig(index, {
                                  ...action.config,
                                  temperature: parseFloat(e.target.value),
                                })
                              }
                            />
                            <Form.Text className="text-muted">
                              0 = Precise, 1 = Creative
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Max Tokens</Form.Label>
                            <Form.Control
                              type="number"
                              min="50"
                              max="1000"
                              step="50"
                              value={action.config.maxTokens || 300}
                              onChange={(e) =>
                                updateActionConfig(index, {
                                  ...action.config,
                                  maxTokens: parseInt(e.target.value),
                                })
                              }
                            />
                            <Form.Text className="text-muted">
                              Response length limit
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Alert variant="info" className="mb-0">
                        <IconifyIcon icon="ri:information-line" className="me-2" />
                        <small>
                          AI will read the incoming email and generate a contextual reply
                          based on your system prompt.
                        </small>
                      </Alert>
                    </>
                  )}

                  {/* AI Content Generator for Outbound */}
                  {action.type === 'generate_ai_content' && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <IconifyIcon icon="ri:chat-quote-line" className="me-1" />
                          Content Prompt
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={action.config.prompt || ''}
                          onChange={(e) =>
                            updateActionConfig(index, {
                              ...action.config,
                              prompt: e.target.value,
                            })
                          }
                          placeholder="Write a marketing email about {{product_name}}..."
                        />
                        <Form.Text className="text-muted">
                          Use {`{{variable}}`} for dynamic content. Variables will be provided when executing the workflow.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <IconifyIcon icon="ri:user-voice-line" className="me-1" />
                          System Prompt (AI Personality)
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={action.config.systemPrompt || ''}
                          onChange={(e) =>
                            updateActionConfig(index, {
                              ...action.config,
                              systemPrompt: e.target.value,
                            })
                          }
                          placeholder="You are a professional marketing copywriter..."
                        />
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Temperature</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.1"
                              min="0"
                              max="2"
                              value={action.config.temperature || 0.7}
                              onChange={(e) =>
                                updateActionConfig(index, {
                                  ...action.config,
                                  temperature: parseFloat(e.target.value),
                                })
                              }
                            />
                            <Form.Text className="text-muted">
                              0 = Precise, 2 = Creative
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Max Tokens</Form.Label>
                            <Form.Control
                              type="number"
                              min="50"
                              max="2000"
                              step="50"
                              value={action.config.maxTokens || 500}
                              onChange={(e) =>
                                updateActionConfig(index, {
                                  ...action.config,
                                  maxTokens: parseInt(e.target.value),
                                })
                              }
                            />
                            <Form.Text className="text-muted">
                              Content length limit
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Alert variant="success" className="mb-0">
                        <IconifyIcon icon="ri:lightbulb-line" className="me-2" />
                        <small>
                          <strong>Generated content is available as {`{{ai_content}}`}</strong> - 
                          Use this variable in the "Send Email" action to include the AI-generated content.
                        </small>
                      </Alert>
                    </>
                  )}

                  {/* Send Email for Outbound */}
                  {action.type === 'send_email' && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <IconifyIcon icon="ri:mail-line" className="me-1" />
                          To (Recipients)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={action.config.to || ''}
                          onChange={(e) =>
                            updateActionConfig(index, {
                              ...action.config,
                              to: e.target.value,
                            })
                          }
                          placeholder="{{recipient}} or user@example.com"
                        />
                        <Form.Text className="text-muted">
                          Email address or {`{{variable}}`}. Separate multiple with commas.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <IconifyIcon icon="ri:text" className="me-1" />
                          Subject
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={action.config.subject || ''}
                          onChange={(e) =>
                            updateActionConfig(index, {
                              ...action.config,
                              subject: e.target.value,
                            })
                          }
                          placeholder="Discover {{product_name}} - Perfect for You!"
                        />
                        <Form.Text className="text-muted">
                          Use {`{{variables}}`} for dynamic content
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <IconifyIcon icon="ri:file-text-line" className="me-1" />
                          Email Body
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          value={action.config.body || ''}
                          onChange={(e) =>
                            updateActionConfig(index, {
                              ...action.config,
                              body: e.target.value,
                            })
                          }
                          placeholder="{{ai_content}} or write your own content..."
                        />
                        <Form.Text className="text-muted">
                          Use {`{{ai_content}}`} to insert AI-generated content from previous action
                        </Form.Text>
                      </Form.Group>

                      <Alert variant="info" className="mb-0">
                        <IconifyIcon icon="ri:information-line" className="me-2" />
                        <small>
                          <strong>Supported variables:</strong> Any {`{{variable}}`} you define when 
                          executing this workflow, plus {`{{ai_content}}`} from AI generation actions.
                        </small>
                      </Alert>
                    </>
                  )}

                  {/* Send Bulk Email for Outbound */}
                  {action.type === 'send_bulk_email' && (
                    <>
                      <Form.Group className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Form.Label className="mb-0">
                            <IconifyIcon icon="ri:contacts-line" className="me-1" />
                            Recipient List
                          </Form.Label>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0"
                            onClick={() => loadRecipientLists()}
                          >
                            <IconifyIcon icon="ri:refresh-line" className="me-1" />
                            Refresh Lists
                          </Button>
                        </div>
                        <Form.Select
                          value={action.config.recipientListId || ''}
                          onChange={(e) =>
                            updateActionConfig(index, {
                              ...action.config,
                              recipientListId: parseInt(e.target.value),
                            })
                          }
                          required
                        >
                          <option value="">
                            {recipientLists.length === 0 
                              ? 'No recipient lists - Upload CSV first' 
                              : 'Select a recipient list...'}
                          </option>
                           {recipientLists.map((list) => (
                             <option key={list.id} value={list.id}>
                               {list.name} ({list.total_count || 0} recipients)
                             </option>
                           ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          {recipientLists.length === 0 ? (
                            <>
                              <IconifyIcon icon="ri:error-warning-line" className="me-1 text-warning" />
                              No recipient lists found. Click "Upload CSV" button above to upload a list.
                            </>
                          ) : (
                            `${recipientLists.length} list(s) available`
                          )}
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <IconifyIcon icon="ri:text" className="me-1" />
                          Subject
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={action.config.subject || ''}
                          onChange={(e) =>
                            updateActionConfig(index, {
                              ...action.config,
                              subject: e.target.value,
                            })
                          }
                          placeholder="Hi {{name}}! Special offer for {{company}}"
                        />
                        <Form.Text className="text-muted">
                          Use column names from CSV as variables: {`{{name}}, {{company}}, {{plan}}`}, etc.
                        </Form.Text>
                      </Form.Group>

                       <Form.Group className="mb-3">
                         <Form.Label>
                           <IconifyIcon icon="ri:file-text-line" className="me-1" />
                           Email Body
                         </Form.Label>
                         <Form.Control
                           as="textarea"
                           rows={3}
                           value={action.config.body || ''}
                           onChange={(e) =>
                             updateActionConfig(index, {
                               ...action.config,
                               body: e.target.value,
                             })
                           }
                           placeholder="{{ai_content}}"
                         />
                         <Form.Text className="text-muted">
                           💡 <strong>Recommended:</strong> Use {`{{ai_content}}`} to insert AI-generated content. 
                           Add "AI Content Generator" action first, then use {`{{ai_content}}`} here.
                         </Form.Text>
                       </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <IconifyIcon icon="ri:time-line" className="me-1" />
                          Delay Between Emails (ms)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="500"
                          max="10000"
                          step="500"
                          value={action.config.delayBetweenEmails || 1000}
                          onChange={(e) =>
                            updateActionConfig(index, {
                              ...action.config,
                              delayBetweenEmails: parseInt(e.target.value),
                            })
                          }
                        />
                        <Form.Text className="text-muted">
                          Recommended: 1000ms (1 second) to avoid rate limits
                        </Form.Text>
                      </Form.Group>

                       <Alert variant="success" className="mb-3">
                         <IconifyIcon icon="ri:lightbulb-line" className="me-2" />
                         <small>
                           <strong>💡 Pro Tip:</strong> Use AI Content Generator before this action!
                           AI will write personalized emails for each recipient using CSV data. 
                           Just set body to {`{{ai_content}}`} above.
                         </small>
                       </Alert>
                       
                       <Alert variant="warning" className="mb-0">
                         <IconifyIcon icon="ri:error-warning-line" className="me-2" />
                         <small>
                           <strong>CSV Format:</strong> First row must be headers (column names). 
                           Each column becomes a variable. Example: name, email, company, plan.
                           Required column: <strong>email</strong>
                         </small>
                       </Alert>
                    </>
                  )}

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
                      <Form.Text className="text-muted">
                        💡 Tip: Use AI Auto-Reply for intelligent, contextual responses!
                      </Form.Text>
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
                 </div>
               );
             })}

             {/* Add Action Button */}
             <div className="d-grid mt-3">
               <Button 
                 variant="outline-primary" 
                 size="lg"
                 onClick={() => setShowActionSelector(true)}
                 style={{ 
                   borderStyle: 'dashed', 
                   borderWidth: '2px',
                   padding: '16px'
                 }}
               >
                 <IconifyIcon icon="ri:add-circle-line" className="me-2" style={{ fontSize: '1.5rem' }} />
                 Add Action to Workflow
               </Button>
             </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowWorkflowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={actions.length === 0}>
              <IconifyIcon icon="ri:save-line" className="me-1" />
              {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
            </Button>
          </Modal.Footer>
         </Form>
       </Modal>

       {/* Action Selector Modal */}
       <ActionSelector
         show={showActionSelector}
         onHide={() => setShowActionSelector(false)}
         actionTypes={actionTypes}
         onSelect={addAction}
       />
 
       {/* Execute Workflow Modal (for outbound with variables) */}
      <Modal
        show={showExecuteModal}
        onHide={() => {
          setShowExecuteModal(false);
          setSelectedWorkflow(null);
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:play-circle-line" className="me-2" />
            Execute Workflow: {selectedWorkflow?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
           {(() => {
             try {
               const hasVariables = Object.keys(JSON.parse(executeData)).length > 0;
               return hasVariables ? (
                 <Alert variant="info" className="mb-3">
                   <IconifyIcon icon="ri:information-line" className="me-2" />
                   <strong>Provide Variable Data</strong>
                   <p className="mb-0 mt-2 small">
                     This workflow uses variables like {`{{recipient}}`}, {`{{product_name}}`}, etc. 
                     Provide the data in JSON format below. The workflow will use these values to 
                     personalize the content and send the email.
                   </p>
                 </Alert>
               ) : (
                 <Alert variant="success" className="mb-3">
                   <IconifyIcon icon="ri:check-line" className="me-2" />
                   <strong>Ready to Execute</strong>
                   <p className="mb-0 mt-2 small">
                     This workflow doesn't require any variable data. Click "Execute Workflow" to run it.
                   </p>
                 </Alert>
               );
             } catch {
               return (
                 <Alert variant="warning" className="mb-3">
                   <IconifyIcon icon="ri:error-warning-line" className="me-2" />
                   <strong>Invalid JSON</strong>
                   <p className="mb-0 mt-2 small">
                     Please ensure the data below is valid JSON format.
                   </p>
                 </Alert>
               );
             }
           })()}

          <Form.Group className="mb-3">
            <Form.Label>
              <IconifyIcon icon="ri:code-s-slash-line" className="me-1" />
              Workflow Data (JSON)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={12}
              value={executeData}
              onChange={(e) => setExecuteData(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
            />
            <Form.Text className="text-muted">
              Edit the sample data or provide your own values. All {`{{variables}}`} used 
              in the workflow will be replaced with these values.
            </Form.Text>
          </Form.Group>

          <Alert variant="success">
            <IconifyIcon icon="ri:lightbulb-line" className="me-2" />
            <small>
              <strong>Tip:</strong> You can also execute this workflow via API:
            </small>
            <pre className="mb-0 mt-2" style={{ fontSize: '0.75rem', backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
{`curl -X POST https://class.xytek.ai/api/automation/workflows/${selectedWorkflow?.id}/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '${executeData}'`}
            </pre>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowExecuteModal(false);
              setSelectedWorkflow(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExecuteWithData}>
            <IconifyIcon icon="ri:send-plane-fill" className="me-1" />
            Execute Workflow
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Examples Modal */}
      <Modal
        show={showExamples}
        onHide={() => setShowExamples(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:book-open-line" className="me-2" />
            Outbound Workflow Examples
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <OutboundWorkflowExamples />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExamples(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowExamples(false);
              handleOpenCreateWorkflow();
            }}
          >
            <IconifyIcon icon="ri:add-line" className="me-1" />
            Create Workflow
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Upload CSV Modal */}
      <Modal
        show={showUploadCSV}
        onHide={() => {
          setShowUploadCSV(false);
          setCsvFile(null);
          setCsvListName('');
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:file-upload-line" className="me-2" />
            Upload Recipient List (CSV)
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUploadCSV}>
          <Modal.Body>
            <Alert variant="info" className="mb-3">
              <IconifyIcon icon="ri:information-line" className="me-2" />
              <strong>CSV Format Requirements:</strong>
              <ul className="mb-0 mt-2 small">
                <li>First row must contain column headers</li>
                <li>Required column: <strong>email</strong></li>
                <li>Other columns become variables: name, company, plan, etc.</li>
                <li>Example: email, name, company, plan</li>
              </ul>
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>List Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Marketing Campaign Q1"
                value={csvListName}
                onChange={(e) => setCsvListName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>CSV File</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                required
              />
              <Form.Text className="text-muted">
                Select a CSV file with your recipient list
              </Form.Text>
            </Form.Group>

            <Alert variant="success">
              <IconifyIcon icon="ri:lightbulb-line" className="me-2" />
              <small>
                <strong>Example CSV:</strong>
              </small>
              <pre className="mb-0 mt-2" style={{ fontSize: '0.75rem', backgroundColor: 'white', padding: '8px', borderRadius: '4px' }}>
{`email,name,company,plan
john@example.com,John Doe,Acme Corp,Premium
jane@example.com,Jane Smith,TechCo,Basic`}
              </pre>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowUploadCSV(false);
                setCsvFile(null);
                setCsvListName('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={uploadingCSV || !csvFile || !csvListName}
            >
              {uploadingCSV ? (
                <>
                  <IconifyIcon icon="ri:loader-4-line" className="me-1 spinner-border spinner-border-sm" />
                  Uploading...
                </>
              ) : (
                <>
                  <IconifyIcon icon="ri:upload-cloud-line" className="me-1" />
                  Upload CSV
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

