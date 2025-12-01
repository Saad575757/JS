# 🤖 AI-Powered Email Automation - Quick Start

## 🎯 What You Can Do

Create **AI-powered** email bots that automatically:
- 🤖 **Generate intelligent, contextual replies** (AI-powered!)
- 📧 Reply with static templates
- ➡️ Forward emails to team members
- 🏷️ Add labels and organize
- ✅ Mark as read/unread
- 🔄 And much more!

> **✨ NEW: AI Auto-Reply** - The AI reads incoming emails and generates personalized, contextual responses automatically!

## 🚀 Quick Start (5 Minutes)

### Step 1: Access Automation
Navigate to **Email Automation** in the sidebar under "Apps"

### Step 2: Configure AI (Required for AI Features) 🔑
```
1. Click "AI Settings" button
2. Get your OpenAI API key from https://platform.openai.com/api-keys
3. Enter your API key
4. Select model: "GPT-4o Mini" (recommended)
5. Click "Test AI Connection"
6. Click "Save Configuration"
```

> **💡 Your Key, Your Control**: You provide your own OpenAI API key. You're only charged by OpenAI for your actual usage.

### Step 3: Create Your First Agent
```
1. Click "Create Agent"
2. Name: "Support Bot"
3. Type: Email Inbound
4. Polling: 60 seconds
5. Click "Create"
```

### Step 4: Authorize Gmail (Automatic)
```
⚡ Gmail authorization popup will open automatically!
1. Sign in to your Gmail account
2. Click "Allow" to grant permissions
3. Window closes automatically
4. ✅ Gmail Connected!
```

> **Note**: If the popup doesn't appear, click the yellow "⚠️ Authorize Gmail Required" button on your agent card.

### Step 5: Verify Gmail Connection
```
Your agent card should now show:
✅ Gmail Connected (green badge)
```

### Step 6: Create an AI Workflow
```
1. Click ⋮ → "Manage Workflows"
2. Click "Create Workflow"
3. Name: "AI Auto-Reply"
4. Trigger: Email Received
5. Filters: .* (any email)
6. Click "Add Action" → "🤖 AI Auto-Reply"
7. Configure AI:
   - System Prompt: "You are a friendly customer support agent..."
   - Temperature: 0.7
   - Max Tokens: 300
8. (Optional) Add "Mark as Read" action
9. Click "Create Workflow"
```

> **💡 Pro Tip**: The AI will read each incoming email and generate a personalized, contextual response automatically!

### Step 7: Activate!
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

### Use Case 1: AI Support Auto-Reply ⭐
```
Trigger: Email Received
From: .*
Actions:
  1. 🤖 AI Auto-Reply
     - Prompt: "You are a helpful support agent..."
     - Temperature: 0.7
     - Max Tokens: 300
  2. Add Label: "AI-Handled"
  3. Mark as Read
```
*AI reads the email and generates a contextual, personalized response!*

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

## 🚀 Outbound Email Campaigns (NEW!)

Create AI-powered outbound email workflows for marketing, newsletters, and personalized campaigns!

### 📧 What's Different About Outbound?

**Inbound** = React to emails (auto-replies)  
**Outbound** = Proactively send emails (campaigns, newsletters)

### 🎨 Getting Started with Outbound

1. **Create an Outbound Agent**
   ```
   - Click "Create Agent"
   - Type: Email Outbound
   - Authorize Gmail (same as inbound)
   ```

2. **Browse Templates**
   ```
   - Go to agent → "Manage Workflows"
   - Click "Examples" button (top right)
   - See 4 pre-built templates:
     • AI Marketing Email
     • Personalized Follow-Up
     • Daily AI Newsletter
     • Product Launch Email
   ```

3. **Create from Template**
   ```
   - Click "Create Workflow"
   - Browse the template gallery
   - Click any template to use it
   - Customize the content
   - Save!
   ```

### 🎯 Outbound Workflow Types

#### Manual Workflows (On-Demand)
Perfect for: Campaigns, follow-ups, one-time sends

```
Trigger: Manual
Actions:
  1. AI Content Generator → Create personalized content
  2. Send Email → Deliver to recipients

Variables: {{recipient}}, {{product_name}}, etc.
```

**Execute via UI:**
- Click "Execute" button
- Fill in variables with your data
- Click "Execute Workflow"

**Execute via API:**
```bash
curl -X POST https://class.xytek.ai/api/automation/workflows/YOUR_ID/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "recipient": "customer@example.com",
      "product_name": "XYTEK AI Classroom",
      "benefits": "automated grading, AI insights"
    }
  }'
```

#### Scheduled Workflows (Automatic)
Perfect for: Daily newsletters, weekly digests, recurring bulk sends

```
Trigger: Schedule (Daily at 8:00 AM)
Actions:
  1. AI Content Generator → Create fresh content daily
  2. Send Email → Send to team

OR Trigger: Schedule (Weekly on Monday at 9:00 AM)
Actions:
  1. Send Bulk Email → Send to CSV list
```

**Weekly Scheduling:**
- Select "Weekly" frequency
- Choose day: Monday, Tuesday, etc.
- Set time: 09:00
- Perfect for weekly newsletters to CSV lists!

### 💡 Outbound Action Types

| Action | Description | Use Case |
|--------|-------------|----------|
| **🤖 AI Content Generator** | Generate content with variables | Marketing emails, newsletters |
| **📧 Send Email** | Send to specified recipients | Single/few recipients |
| **📮 Send Bulk Email** | Send to CSV recipient list | Mass campaigns, newsletters |

### 🔧 Variables & Personalization

Use `{{variable}}` syntax in prompts and emails:

**Common Variables:**
- `{{recipient}}` - Email address
- `{{name}}` - Person's name
- `{{product_name}}` - Product/service name
- `{{benefits}}` - Key benefits
- `{{date}}` - Current date
- `{{ai_content}}` - Content from AI action

**Example Prompt:**
```
Write a marketing email about {{product_name}}.
Target audience: {{audience}}.
Highlight these benefits: {{benefits}}.
Include a call-to-action.
```

### 📊 Example 1: Single Email Campaign

```json
{
  "name": "AI Marketing Email",
  "triggerConfig": { "type": "manual" },
  "actions": [
    {
      "type": "generate_ai_content",
      "config": {
        "prompt": "Write a marketing email about {{product_name}}...",
        "temperature": 0.7
      }
    },
    {
      "type": "send_email",
      "config": {
        "to": "{{recipient}}",
        "subject": "Discover {{product_name}}!",
        "body": "{{ai_content}}"
      }
    }
  ]
}
```

### 📊 Example 2: Bulk Email Campaign (CSV)

**Step 1: Upload CSV**
```bash
curl -X POST https://class.xytek.ai/api/automation/recipient-lists/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "csv=@recipients.csv" \
  -F "name=Marketing Campaign Q1"
```

Returns: `{"recipientList": {"id": 5, "recipientCount": 150}}`

**CSV Format:**
```csv
email,name,company,plan
john@example.com,John Doe,Acme Corp,Premium
jane@example.com,Jane Smith,TechCo,Basic
```

**Step 2: Create Bulk Workflow**
```json
{
  "name": "Bulk Marketing Campaign",
  "triggerConfig": { "type": "manual" },
  "actions": [
    {
      "type": "send_bulk_email",
      "config": {
        "recipientListId": 5,
        "subject": "Hi {{name}}! Special offer for {{company}}",
        "body": "Hi {{name}} from {{company}},\n\nYour {{plan}} plan includes...\n\nBest regards",
        "delayBetweenEmails": 1000
      }
    }
  ]
}
```

**Or via UI:**
1. Click "Upload CSV" button
2. Select your CSV file
3. Create workflow → Select "Bulk Email Campaign" template
4. Choose your recipient list
5. Customize subject/body with CSV column variables
6. Execute workflow!

### 🎓 Best Practices

1. **Test with Sample Data** - Use "Execute" button to test before going live
2. **Use Clear Variable Names** - `{{customer_name}}` better than `{{n}}`
3. **Start with Templates** - Customize proven workflows
4. **Monitor Execution** - Check logs to ensure delivery
5. **Respect Rate Limits** - Gmail has sending limits

## ⚡ Pro Tips

1. **Test First**: Use the "Test" or "Execute" button before activating
2. **Start Simple**: Begin with 1-2 actions, add more later
3. **Use Specific Filters** (Inbound): Avoid matching too many emails
4. **Use Descriptive Variables** (Outbound): Make prompts clear
5. **Monitor Regularly**: Check execution history weekly
6. **Adjust Polling**: Lower intervals = faster response, higher load

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

