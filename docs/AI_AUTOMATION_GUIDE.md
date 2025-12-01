# 🤖 AI-Powered Email Automation

## Overview

Create intelligent email automation agents powered by AI that understand context and generate personalized responses automatically.

## ✨ Why AI-Powered?

Unlike traditional email automation that uses static templates, our AI system:

- 📖 **Reads and understands** incoming emails
- 🧠 **Generates contextual responses** based on the content
- 🎯 **Adapts to different scenarios** automatically
- 💬 **Maintains your brand voice** through custom prompts
- ⚡ **Responds faster** than human agents

## 🚀 Quick Start

### 0. Configure Your AI API Key (Required)

**Via UI (Recommended):**
1. Navigate to **Apps → Email Automation**
2. Click **"AI Settings"** button
3. Enter your OpenAI API key
4. Select model (GPT-4o Mini recommended)
5. Click **"Save Configuration"**

**Via API:**
```bash
curl -X POST https://class.xytek.ai/api/ai-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "provider": "openai",
    "apiKey": "sk-YOUR-API-KEY",
    "modelName": "gpt-4o-mini",
    "isDefault": true
  }'
```

> **Important**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### 1. Create an AI Agent

```bash
curl -X POST https://class.xytek.ai/api/automation/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "AI Support Agent",
    "description": "Intelligent auto-reply agent",
    "type": "email_inbound",
    "config": {
      "pollingInterval": 60
    }
  }'
```

### 2. Authorize Gmail

The OAuth popup will open automatically. Grant permissions.

### 3. Create AI Workflow

```bash
curl -X POST https://class.xytek.ai/api/automation/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "agentId": 1,
    "name": "AI Auto-Reply",
    "description": "Intelligent email responses",
    "triggerConfig": {
      "type": "email_received",
      "filters": {
        "from": ".*",
        "subject": ".*"
      }
    },
    "actions": [
      {
        "type": "generate_ai_reply",
        "config": {
          "systemPrompt": "You are a friendly customer support agent. Be helpful and professional. Keep responses under 100 words.",
          "temperature": 0.7,
          "maxTokens": 300
        }
      },
      {
        "type": "mark_as_read"
      }
    ],
    "status": "active"
  }'
```

### 4. Activate Agent

```bash
curl -X PATCH https://class.xytek.ai/api/automation/agents/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "active"}'
```

## 🎨 Visual Workflow Builder

Access via UI: `Apps → Email Automation → Manage Workflows`

### Creating AI Workflows

1. **Add Action** → Select **🤖 AI Auto-Reply**
2. Configure:
   - **System Prompt**: Define AI personality
   - **Temperature**: 0-2 (0=precise, 1=creative)
   - **Max Tokens**: Response length (50-1000)

### Visual Display

```
┌─────────────────────────────┐
│   📧 Email Received         │
│   From: .*                  │
│   Subject: .*              │
└─────────────────────────────┘
            ↓
┌─────────────────────────────┐
│   🤖 AI Auto-Reply          │
│   AI-Powered Badge          │
│   Prompt: "You are..."      │
│   Temp: 0.7 | Max: 300      │
└─────────────────────────────┘
            ↓
┌─────────────────────────────┐
│   ✓ Mark as Read            │
└─────────────────────────────┘
```

## 💡 AI Configuration

### System Prompt

The system prompt defines how the AI behaves:

```
Good Prompt:
"You are a friendly customer support agent for TechCorp. 
Be helpful, professional, and empathetic. Keep responses 
under 100 words. If you can't help, offer to escalate 
to a human agent."
```

### Temperature Settings

- **0.0-0.3**: Precise, consistent responses (good for FAQs)
- **0.4-0.7**: Balanced creativity and consistency (recommended)
- **0.8-2.0**: Creative, varied responses (use carefully)

### Max Tokens

- **50-100**: Very brief responses
- **100-300**: Standard email replies (recommended)
- **300-500**: Detailed explanations
- **500-1000**: Comprehensive responses

## 🎯 Example AI Prompts

### Customer Support
```
You are a friendly customer support agent for [Company]. 
Be helpful, professional, and empathetic. Always thank 
the customer for reaching out. Keep responses under 100 
words. If you cannot resolve the issue, offer to escalate.
```

### Sales Inquiries
```
You are a sales assistant for [Company]. Be enthusiastic 
about our products but not pushy. Provide clear information 
and pricing when asked. Always include a call-to-action. 
Keep responses under 150 words.
```

### HR/Recruiting
```
You are an HR assistant for [Company]. Be professional and 
welcoming to candidates. Provide clear next steps. Keep 
responses under 100 words. Do not make hiring decisions - 
only provide information and schedule interviews.
```

### Technical Support
```
You are a technical support agent. Be patient and explain 
things clearly. Ask clarifying questions if needed. Provide 
step-by-step instructions. Keep responses under 200 words.
Use bullet points for clarity.
```

## 🔥 Advanced Features

### Multi-Action Workflows

Combine AI with other actions:

```json
{
  "actions": [
    {
      "type": "generate_ai_reply",
      "config": { "systemPrompt": "...", "temperature": 0.7 }
    },
    {
      "type": "add_label",
      "config": { "label": "AI-Handled" }
    },
    {
      "type": "mark_as_read"
    }
  ]
}
```

### Conditional AI Responses

Use filters to route different emails to different AI prompts:

**Support Emails:**
```json
{
  "triggerConfig": {
    "filters": {
      "from": ".*@customer.com",
      "subject": ".*support.*"
    }
  },
  "actions": [{
    "type": "generate_ai_reply",
    "config": {
      "systemPrompt": "You are a technical support agent..."
    }
  }]
}
```

**Sales Emails:**
```json
{
  "triggerConfig": {
    "filters": {
      "from": ".*",
      "subject": ".*(pricing|quote|buy).*"
    }
  },
  "actions": [{
    "type": "generate_ai_reply",
    "config": {
      "systemPrompt": "You are a sales assistant..."
    }
  }]
}
```

## 📊 Monitoring AI Performance

### Execution History

Track AI-generated responses:
- View what the AI wrote
- Check response times
- Monitor success rates
- Identify issues

### Statistics Dashboard

- **Total AI Responses**: Count of automated replies
- **Success Rate**: Percentage of successful sends
- **Average Response Time**: How fast AI generates replies
- **Token Usage**: Monitor AI resource consumption

## 🛠️ Best Practices

### 1. Start Conservative
- Use **temperature 0.5-0.7** initially
- Set **maxTokens to 200-300**
- Test thoroughly before full deployment

### 2. Clear System Prompts
- Be specific about tone and style
- Include word count limits in the prompt
- Define what the AI should NOT do

### 3. Test Extensively
- Use the "Test" button in the UI
- Send test emails from different scenarios
- Review AI responses before activating

### 4. Monitor Regularly
- Check execution history daily
- Read sample AI responses
- Adjust prompts based on results

### 5. Combine with Human Oversight
- Add labels to AI-handled emails
- Review periodically
- Have escalation paths

## ⚠️ Important Notes

### What AI CAN Do
✅ Generate contextual responses
✅ Understand email intent
✅ Maintain consistent tone
✅ Handle multiple languages
✅ Provide helpful information

### What AI CANNOT Do
❌ Make business decisions
❌ Access external systems (unless integrated)
❌ Guarantee 100% accuracy
❌ Replace human judgment for complex issues
❌ Handle sensitive/legal matters

## 🔐 Privacy & Security

- **Email Content**: Processed by AI, not stored long-term
- **Tokens**: Encrypted and securely stored
- **AI Model**: Industry-standard security practices
- **Compliance**: GDPR-compliant processing

## 🚨 Troubleshooting

### AI Not Generating Responses
- Check agent is active and Gmail authorized
- Verify workflow has `generate_ai_reply` action
- Check execution logs for errors
- Ensure maxTokens is reasonable (50-1000)

### Poor Response Quality
- Refine system prompt for clarity
- Adjust temperature (lower = more consistent)
- Increase maxTokens if responses are cut off
- Add more context to system prompt

### Responses Too Long/Short
- Adjust maxTokens setting
- Add word count limits to system prompt
- Use temperature to control verbosity

## 📈 Scaling AI Automation

### Single Agent
- 1 agent = 1 Gmail account
- Multiple workflows per agent
- Different AI prompts for different scenarios

### Multiple Agents
- Separate agents for different email accounts
- Specialized AI agents (support, sales, HR)
- Different response times/priorities

## 🎓 Learn More

### Example Scenarios

**Scenario 1: E-commerce Support**
- Customer asks about order status
- AI reads email, checks tone
- Generates personalized response
- Offers to help with returns/exchanges

**Scenario 2: Meeting Scheduler**
- Email requests meeting
- AI understands intent
- Proposes available times
- Sends calendar invitation

**Scenario 3: FAQ Automation**
- Common question received
- AI recognizes pattern
- Provides accurate answer
- Marks as resolved

## 🌟 Success Stories

**Before AI**: 
- 2-hour average response time
- Generic template replies
- Customer frustration

**After AI**:
- 30-second response time
- Personalized, contextual replies
- 85% customer satisfaction

---

## 🚀 Get Started Now!

1. Navigate to **Apps → Email Automation**
2. Create your first AI agent
3. Authorize Gmail
4. Add **🤖 AI Auto-Reply** action
5. Activate and watch the magic happen!

**AI-powered email automation is the future. Start today!** ✨

