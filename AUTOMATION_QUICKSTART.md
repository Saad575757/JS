# Email Automation - Quick Start Guide

## 🎯 What You Can Do

Create intelligent email bots that automatically:
- 📧 Reply to emails
- ➡️ Forward emails to team members
- 🏷️ Add labels and organize
- ✅ Mark as read/unread
- 🔄 And much more!

## 🚀 Quick Start (5 Minutes)

### Step 1: Access Automation
Navigate to **Email Automation** in the sidebar under "Apps"

### Step 2: Create Your First Agent
```
1. Click "Create Agent"
2. Name: "Support Bot"
3. Type: Email Inbound
4. Polling: 60 seconds
5. Click "Create"
```

### Step 3: Authorize Gmail (Automatic)
```
⚡ Gmail authorization popup will open automatically!
1. Sign in to your Gmail account
2. Click "Allow" to grant permissions
3. Window closes automatically
4. ✅ Gmail Connected!
```

> **Note**: If the popup doesn't appear, click the yellow "⚠️ Authorize Gmail Required" button on your agent card.

### Step 4: Verify Gmail Connection
```
Your agent card should now show:
✅ Gmail Connected (green badge)
```

### Step 5: Create a Workflow
```
1. Click ⋮ → "Manage Workflows"
2. Click "Create Workflow"
3. Name: "Auto-Reply"
4. Trigger: Email Received
5. Filters: .* (any email)
6. Click "Add Action" → "Reply to Email"
7. Write your auto-reply message
8. Click "Create Workflow"
```

### Step 6: Activate!
```
1. Back to agents list
2. Click "Activate" button
3. 🎉 Your bot is live!
```

## 📊 Features Overview

### ✅ What's Included

- **Visual Workflow Builder**: Drag-and-drop interface (n8n-style)
- **Gmail OAuth Integration**: Secure authentication
- **Real-time Execution Logs**: Monitor every action
- **Statistics Dashboard**: Track success rates
- **Multiple Agents**: Create unlimited automation bots
- **Flexible Filters**: Regex-based email matching
- **Action Library**: 5+ built-in actions

### 🎨 User Interface

The automation page has 3 main tabs:

1. **Agents**: Manage your email bots
2. **Workflows**: Visual workflow builder
3. **Execution History**: Logs and statistics

## 💡 Example Use Cases

### Use Case 1: Support Auto-Reply
```
Trigger: Email Received
From: .*
Actions:
  1. Reply: "Thanks! We'll respond in 24hrs"
  2. Add Label: "Support-Pending"
  3. Mark as Read
```

### Use Case 2: VIP Forwarding
```
Trigger: Email Received
From: @important-client.com
Actions:
  1. Forward to: manager@company.com
  2. Add Label: "VIP"
```

### Use Case 3: Newsletter Management
```
Trigger: Email Received
Subject: .*newsletter.*
Actions:
  1. Add Label: "Newsletters"
  2. Mark as Read
```

## 🔗 API Endpoints (Auto-configured)

The frontend automatically connects to:

```bash
Base URL: https://class.xytek.ai/api/automation

# Main Endpoints
GET    /agents                    # List agents
POST   /agents                    # Create agent
PATCH  /agents/:id/status         # Toggle status
GET    /agents/:id/gmail/auth     # Get OAuth URL
POST   /workflows                 # Create workflow
GET    /agents/:id/workflows      # List workflows
GET    /agents/:id/executions     # Execution history
GET    /agents/:id/stats          # Statistics
```

All requests automatically include your JWT token in the `Authorization` header.

## 📱 Navigation

Access automation from:
- **Sidebar** → Apps → Email Automation
- **Direct URL**: `/apps/automation`

## 🎨 Visual Workflow Structure

```
┌─────────────────────────┐
│   📧 Email Received     │
│   Trigger               │
│   From: .*             │
│   Subject: .*          │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│   ✉️ Reply to Email     │
│   Action                │
│   Message: "Thanks..."  │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│   ✓ Mark as Read        │
│   Action                │
└─────────────────────────┘
```

## 🛠️ Files Created

```
src/lib/api/automation.js                    # API utilities
src/app/(admin)/apps/automation/page.jsx     # Main page
src/app/(admin)/apps/automation/components/
  ├── WorkflowBuilder.jsx                    # Workflow builder
  └── ExecutionHistory.jsx                   # History viewer
docs/AUTOMATION_GUIDE.md                     # Full documentation
```

## 📊 Monitoring Your Automations

The **Execution History** tab shows:

- **Total Executions**: How many times workflows ran
- **Success Rate**: Percentage of successful runs
- **Recent Logs**: Last 10 executions with details
- **Error Messages**: Debug failed executions

## ⚡ Pro Tips

1. **Test First**: Use the "Test" button before activating
2. **Start Simple**: Begin with 1-2 actions, add more later
3. **Use Specific Filters**: Avoid matching too many emails
4. **Monitor Regularly**: Check execution history weekly
5. **Adjust Polling**: Lower intervals = faster response, higher load

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Agent not running | Check status badge is green |
| Workflow not triggering | Verify email filters with regex tester |
| Gmail auth failed | Clear cache, try again |
| Actions not executing | Check execution logs for errors |

## 📚 Learn More

For detailed documentation, see:
- `docs/AUTOMATION_GUIDE.md` - Complete guide
- `AUTHENTICATION_README.md` - Auth system
- API docs at Xytek

## 🎉 You're Ready!

Your automation system is fully configured and ready to use. Create your first agent and start automating! 🚀

---

**Need Help?** Check the execution logs or review the full documentation in `docs/AUTOMATION_GUIDE.md`

