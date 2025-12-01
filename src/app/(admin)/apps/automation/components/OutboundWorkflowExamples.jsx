'use client';

import { Card, CardBody, Alert, Badge, Accordion } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

export default function OutboundWorkflowExamples() {
  const examples = [
    {
      id: 'marketing',
      title: '🚀 AI Marketing Email',
      description: 'Generate personalized marketing emails with AI',
      variables: ['recipient', 'product_name', 'benefits'],
      curlExample: `curl -X POST https://class.xytek.ai/api/automation/workflows/YOUR_WORKFLOW_ID/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "data": {
      "recipient": "customer@example.com",
      "product_name": "XYTEK AI Classroom",
      "benefits": "automated grading, AI teaching assistant, real-time insights"
    }
  }'`,
      aiOutput: `Subject: Discover XYTEK AI Classroom - Perfect for You!

Hi there,

I wanted to share something exciting with you - XYTEK AI Classroom.

Here's what makes it special:
• Automated grading - Save hours of manual work
• AI teaching assistant - Get instant help for your students
• Real-time insights - Track progress as it happens

Ready to transform your classroom? Let's schedule a quick demo!

Best regards,
Your Team`
    },
    {
      id: 'followup',
      title: '💬 Personalized Follow-Up',
      description: 'Send warm, personalized follow-up emails',
      variables: ['email', 'name', 'action_taken'],
      curlExample: `curl -X POST https://class.xytek.ai/api/automation/workflows/YOUR_WORKFLOW_ID/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "data": {
      "email": "john@example.com",
      "name": "John",
      "action_taken": "attended our webinar on AI automation"
    }
  }'`,
      aiOutput: `Subject: How did it go, John?

Hi John,

Hope you enjoyed the webinar on AI automation! We'd love to hear your thoughts on what you learned.

Is there anything you'd like to dive deeper into? I'm here to help!

Looking forward to hearing from you.

Best regards`
    },
    {
      id: 'newsletter',
      title: '📰 Daily AI Newsletter',
      description: 'Automated daily newsletters with motivational content',
      variables: ['recipients', 'date', 'company_goal'],
      schedule: 'Daily at 8:00 AM',
      curlExample: `# This workflow runs automatically on schedule
# Or trigger manually:
curl -X POST https://class.xytek.ai/api/automation/workflows/YOUR_WORKFLOW_ID/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "data": {
      "recipients": "team@xytek.ai",
      "date": "2024-01-15",
      "company_goal": "helping educators save time"
    }
  }'`,
      aiOutput: `Subject: Good Morning! ☀️ - January 15, 2024

Good morning team!

📖 Today's Quote: "The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt

💡 Productivity Tip: Start your day by tackling your most challenging task first. Your brain is freshest in the morning!

🎯 Remember: We're focused on helping educators save time - every improvement we make impacts thousands of teachers.

Have a great day!`
    },
    {
      id: 'product_launch',
      title: '🎉 Product Launch Email',
      description: 'Exciting product announcements with AI-generated copy',
      variables: ['recipient_list', 'feature_name', 'audience', 'benefits', 'tone'],
      curlExample: `curl -X POST https://class.xytek.ai/api/automation/workflows/YOUR_WORKFLOW_ID/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "data": {
      "recipient_list": "customers@example.com",
      "feature_name": "AI Content Generator",
      "audience": "marketing professionals",
      "benefits": "10x faster content creation, consistent brand voice, multilingual support",
      "tone": "professional and exciting"
    }
  }'`,
      aiOutput: `Subject: 🚀 Introducing AI Content Generator!

We're thrilled to announce our newest feature designed specifically for marketing professionals - AI Content Generator!

🌟 What You Get:
• 10x faster content creation - Ship campaigns in hours, not days
• Consistent brand voice - Never lose your brand identity
• Multilingual support - Reach global audiences effortlessly

This is a game-changer for your marketing workflow. Early adopters are already seeing incredible results!

👉 Try it now - Your first 100 generations are on us!

Let's revolutionize how you create content.

The XYTEK Team`
    }
  ];

  return (
    <div>
      <Alert variant="primary" className="mb-4">
        <IconifyIcon icon="ri:book-open-line" className="me-2" />
        <strong>Outbound Workflow Examples</strong>
        <p className="mb-0 mt-2">
          These examples show you how to create AI-powered outbound email campaigns. 
          Use the templates in the workflow builder, or create your own custom workflows!
        </p>
      </Alert>

      <Accordion>
        {examples.map((example, index) => (
          <Accordion.Item key={example.id} eventKey={index.toString()}>
            <Accordion.Header>
              <div>
                <strong>{example.title}</strong>
                <div className="small text-muted">{example.description}</div>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="mb-3">
                <h6 className="mb-2">
                  <IconifyIcon icon="ri:price-tag-3-line" className="me-1" />
                  Variables
                </h6>
                {example.variables.map(variable => (
                  <Badge key={variable} bg="secondary" className="me-1 mb-1">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
                {example.schedule && (
                  <div className="mt-2">
                    <Badge bg="info">
                      <IconifyIcon icon="ri:calendar-line" className="me-1" />
                      {example.schedule}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <h6 className="mb-2">
                  <IconifyIcon icon="ri:terminal-line" className="me-1" />
                  API Call Example
                </h6>
                <pre
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    overflow: 'auto'
                  }}
                >
                  {example.curlExample}
                </pre>
              </div>

              <div>
                <h6 className="mb-2">
                  <IconifyIcon icon="ri:sparkling-line" className="me-1" />
                  AI-Generated Output Example
                </h6>
                <Card className="bg-light">
                  <CardBody>
                    <pre
                      style={{
                        fontSize: '0.85rem',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit'
                      }}
                    >
                      {example.aiOutput}
                    </pre>
                  </CardBody>
                </Card>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <Alert variant="success" className="mt-4">
        <IconifyIcon icon="ri:lightbulb-line" className="me-2" />
        <strong>Pro Tips:</strong>
        <ul className="mb-0 mt-2">
          <li>Use descriptive variable names like {`{{customer_name}}`} instead of {`{{name}}`}</li>
          <li>Test workflows with sample data before sending to real recipients</li>
          <li>Combine multiple AI actions to create sophisticated campaigns</li>
          <li>Use scheduled triggers for recurring communications (newsletters, digests)</li>
          <li>Chain workflows together using the API for complex automation</li>
        </ul>
      </Alert>
    </div>
  );
}

