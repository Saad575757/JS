# Email Automation Guide

## Overview

The Email Automation system allows you to create intelligent email agents that can automatically respond to, forward, label, and manage your Gmail inbox. It features a visual workflow builder similar to n8n/Zapier.

## Features

✅ **Visual Workflow Builder** - Create automation workflows with an intuitive drag-and-drop interface
✅ **Gmail Integration** - Full OAuth integration with Gmail API
✅ **Multiple Agent Types** - Support for inbound and outbound email automation
✅ **Execution History** - Track all workflow executions with detailed logs and statistics
✅ **Flexible Triggers** - Email filters based on sender, subject, and more
✅ **Action Library** - Reply, forward, label, mark as read/unread, and more

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                 │
│            n8n-style visual workflow builder UI              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Xytek API)                   │
│                  /api/automation/*                           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
┌──────────────────────┐                 ┌──────────────────────┐
│  Automation Engine   │                 │   Gmail Service      │
│  - Execute workflows │                 │   - OAuth            │
│  - Evaluate filters  │                 │   - Send/Read emails │
│  - Run actions       │                 │   - Filters          │
└──────────────────────┘                 └──────────────────────┘
```

## Getting Started

### 1. Navigate to Automation

From the sidebar, click on **Email Automation** under the Apps section.

### 2. Create an Agent

1. Click **"Create Agent"**
2. Fill in the form:
   - **Agent Name**: e.g., "Support Email Bot"
   - **Description**: What this agent does
   - **Type**: Email Inbound or Outbound
   - **Polling Interval**: How often to check for emails (in seconds)
3. Click **"Create Agent"**

### 3. Authorize Gmail

1. Click the **three dots** menu on your agent card
2. Select **"Authorize Gmail"**
3. Complete the OAuth flow in the popup window
4. Your Gmail account is now connected!

### 4. Create a Workflow

1. Click the **three dots** menu on your agent
2. Select **"Manage Workflows"**
3. Click **"Create Workflow"**
4. Configure your workflow:
   - **Name & Description**: Identify your workflow
   - **Trigger**: Define when the workflow runs
   - **Filters**: Specify email patterns (regex)
   - **Actions**: Add actions to perform

### 5. Activate Your Agent

1. Go back to the agents list
2. Click **"Activate"** on your agent
3. Your automation is now live! 🎉

## Workflow Configuration

### Trigger Types

- **Email Received**: Triggers when a new email arrives

### Email Filters

Use regex patterns to filter emails:

- `.*` - Match any email
- `@customer.com` - Match emails from customer.com domain
- `urgent|important` - Match emails with "urgent" or "important" in subject

### Available Actions

#### 1. Reply to Email
Automatically send a reply to incoming emails.
```json
{
  "type": "reply_to_email",
  "config": {
    "replyBody": "Thank you for your email! We'll respond within 24 hours."
  }
}
```

#### 2. Forward Email
Forward emails to another address.
```json
{
  "type": "forward_email",
  "config": {
    "forwardTo": "manager@company.com"
  }
}
```

#### 3. Add Label
Add a Gmail label to the email.
```json
{
  "type": "add_label",
  "config": {
    "label": "Support-Automated"
  }
}
```

#### 4. Mark as Read
Mark the email as read.
```json
{
  "type": "mark_as_read",
  "config": {}
}
```

#### 5. Mark as Unread
Keep the email unread.
```json
{
  "type": "mark_as_unread",
  "config": {}
}
```

## Example Workflows

### Auto-Reply Support Bot

**Use Case**: Automatically acknowledge support emails

**Configuration**:
- **Trigger**: Email Received
- **From Filter**: `.*`
- **Subject Filter**: `.*`
- **Actions**:
  1. Reply: "Thank you for contacting support..."
  2. Add Label: "Support-Pending"
  3. Mark as Read

### VIP Email Forwarder

**Use Case**: Forward important client emails to your manager

**Configuration**:
- **Trigger**: Email Received
- **From Filter**: `@vip-client.com`
- **Subject Filter**: `.*`
- **Actions**:
  1. Forward to: `manager@company.com`
  2. Add Label: "VIP-Client"

### Newsletter Filter

**Use Case**: Automatically label and mark newsletters as read

**Configuration**:
- **Trigger**: Email Received
- **From Filter**: `.*newsletter.*|.*@news.*`
- **Subject Filter**: `.*`
- **Actions**:
  1. Add Label: "Newsletters"
  2. Mark as Read

## API Integration

All automation features are powered by the Xytek Automation API. The frontend automatically handles authentication using JWT tokens.

### Key API Endpoints

```bash
# List agents
GET /api/automation/agents

# Create agent
POST /api/automation/agents

# Get Gmail OAuth URL
GET /api/automation/agents/:id/gmail/auth

# Create workflow
POST /api/automation/workflows

# Get executions
GET /api/automation/agents/:id/executions

# Get statistics
GET /api/automation/agents/:id/stats
```

## Execution History

Track all workflow executions in the **Execution History** tab:

- **Total Executions**: Total number of times workflows ran
- **Successful**: Completed without errors
- **Failed**: Encountered errors
- **Success Rate**: Percentage of successful executions

### Execution Details

Each execution shows:
- Workflow name
- Status badge (success/failed/running)
- Start time and duration
- Number of actions executed
- Error messages (if any)

## Best Practices

### 1. Test Your Workflows
Use the **Test** button to manually execute workflows before activating your agent.

### 2. Use Specific Filters
Be as specific as possible with email filters to avoid false matches:
- ✅ Good: `support@company.com`
- ❌ Too broad: `.*`

### 3. Monitor Executions
Regularly check the execution history to ensure your workflows are running as expected.

### 4. Set Reasonable Polling Intervals
- For urgent emails: 30-60 seconds
- For regular monitoring: 300-600 seconds (5-10 minutes)
- For low-priority: 1800-3600 seconds (30-60 minutes)

### 5. Keep Actions Simple
Start with simple workflows and add complexity gradually. Complex workflows are harder to debug.

### 6. Use Labels for Organization
Add labels to categorized automated emails for easy reference.

## Troubleshooting

### Agent Not Running
- Check that the agent status is **Active** (green badge)
- Verify Gmail authorization is complete
- Check polling interval is set correctly

### Workflows Not Triggering
- Verify email filters are correct (test with regex101.com)
- Check execution history for error messages
- Ensure agent has active workflows

### Gmail Authorization Failed
- Clear browser cache and cookies
- Try authorizing again
- Check that your Google account allows third-party apps

### Actions Not Executing
- Check action configuration is complete
- Verify Gmail API permissions are granted
- Review execution logs for specific errors

## File Structure

```
src/
├── lib/
│   └── api/
│       └── automation.js          # API utilities
├── app/
│   └── (admin)/
│       └── apps/
│           └── automation/
│               ├── page.jsx       # Main automation page
│               └── components/
│                   ├── WorkflowBuilder.jsx   # Visual workflow builder
│                   └── ExecutionHistory.jsx  # Execution logs viewer
└── assets/
    └── data/
        └── menu-items.js          # Navigation menu
```

## Future Enhancements

Planned features for future releases:

- 🔄 More trigger types (scheduled, webhook)
- 📊 Advanced analytics and reporting
- 🤖 AI-powered email classification
- 🔗 Integration with more services (Slack, Discord)
- 📧 Email template library
- 🎯 A/B testing for auto-replies
- 👥 Team collaboration features

## Support

For issues or questions:
1. Check the execution history for error details
2. Review this documentation
3. Contact your system administrator

---

**Happy Automating! 🚀**

