# 🚀 Outbound Email Workflows - Complete Guide

## Overview

Outbound workflows allow you to **proactively send emails** using AI-powered content generation. Perfect for:

- 📧 Marketing campaigns
- 💌 Personalized follow-ups
- 📰 Newsletters and digests
- 🎉 Product announcements
- 📊 Automated reports

## Key Differences: Inbound vs Outbound

| Feature | Inbound | Outbound |
|---------|---------|----------|
| **Purpose** | React to received emails | Proactively send emails |
| **Trigger** | Email received | Manual or Scheduled |
| **Actions** | Reply, Forward, Label | Generate & Send |
| **Use Cases** | Support, Auto-replies | Marketing, Campaigns |
| **Variables** | Email context | Custom data |

## Getting Started

### 1. Create an Outbound Agent

```bash
# Via API
curl -X POST https://class.xytek.ai/api/automation/agents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marketing Campaign Bot",
    "type": "email_outbound",
    "description": "Handles outbound marketing emails",
    "config": {
      "pollingInterval": 60
    }
  }'
```

**Via UI:**
1. Go to Dashboard → Automation
2. Click "Create Agent"
3. Select "Email Outbound"
4. Authorize Gmail

### 2. Choose a Workflow Type

#### 🎯 Manual Workflows (Execute on Demand)

Perfect for: Campaigns with dynamic data, personalized bulk sends

```json
{
  "triggerConfig": {
    "type": "manual"
  }
}
```

**Execution:**
```bash
curl -X POST https://class.xytek.ai/api/automation/workflows/{id}/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "recipient": "customer@example.com",
      "product_name": "XYTEK AI"
    }
  }'
```

#### 📅 Scheduled Workflows (Run Automatically)

Perfect for: Daily newsletters, weekly digests, recurring sends

```json
{
  "triggerConfig": {
    "type": "schedule",
    "schedule": {
      "frequency": "daily",
      "time": "08:00"
    }
  }
}
```

**Frequencies:** `hourly`, `daily`, `weekly`, `monthly`

## Action Types

### 🤖 AI Content Generator

Generates personalized content using AI with variable substitution.

```json
{
  "type": "generate_ai_content",
  "config": {
    "prompt": "Write a marketing email about {{product_name}}. Highlight: {{benefits}}. Keep it under 150 words.",
    "systemPrompt": "You are a professional marketing copywriter.",
    "temperature": 0.7,
    "maxTokens": 500
  }
}
```

**Configuration:**
- `prompt` - The content request with variables
- `systemPrompt` - Defines AI personality
- `temperature` - 0 (precise) to 2 (creative)
- `maxTokens` - Response length limit

**Output:** Content is available as `{{ai_content}}` variable

### 📧 Send Email

Sends emails to specified recipients.

```json
{
  "type": "send_email",
  "config": {
    "to": "{{recipient}}",
    "subject": "Discover {{product_name}}!",
    "body": "{{ai_content}}",
    "isHtml": false
  }
}
```

**Configuration:**
- `to` - Recipient(s), comma-separated
- `subject` - Email subject line
- `body` - Email body (use `{{ai_content}}` for AI-generated)
- `isHtml` - Set to `true` for HTML emails

## Variables & Personalization

### Using Variables

Variables use `{{variable_name}}` syntax and work in:
- AI prompts
- Email subjects
- Email bodies

### Common Variables

```javascript
{
  "recipient": "customer@example.com",
  "email": "john@example.com",
  "name": "John Doe",
  "product_name": "XYTEK AI Classroom",
  "benefits": "automated grading, AI assistance",
  "action_taken": "attended our webinar",
  "date": "2024-01-15",
  "company_goal": "helping educators",
  "feature_name": "New Dashboard",
  "audience": "marketing professionals",
  "tone": "professional and friendly"
}
```

### Variable Flow

```
1. Execute workflow with data
   ↓
2. AI Content Generator uses variables in prompt
   ↓
3. AI generates content → stored as {{ai_content}}
   ↓
4. Send Email uses {{ai_content}} and other variables
   ↓
5. Email sent with personalized content
```

## Templates

### 📧 Marketing Email Template

```json
{
  "name": "AI Marketing Campaign",
  "triggerConfig": { "type": "manual" },
  "actions": [
    {
      "type": "generate_ai_content",
      "config": {
        "prompt": "Write a marketing email about {{product_name}}. Highlight: {{benefits}}. Include a call-to-action. Keep it under 150 words and friendly.",
        "systemPrompt": "You are a professional marketing copywriter. Write engaging, benefit-focused emails that convert.",
        "temperature": 0.7,
        "maxTokens": 300
      }
    },
    {
      "type": "send_email",
      "config": {
        "to": "{{recipient}}",
        "subject": "Discover {{product_name}} - Perfect for You!",
        "body": "{{ai_content}}"
      }
    }
  ]
}
```

**Execute:**
```bash
curl -X POST https://class.xytek.ai/api/automation/workflows/7/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "recipient": "customer@example.com",
      "product_name": "XYTEK AI Classroom",
      "benefits": "automated grading, AI teaching assistant, real-time insights"
    }
  }'
```

### 💬 Follow-Up Template

```json
{
  "name": "AI Follow-Up",
  "triggerConfig": { "type": "manual" },
  "actions": [
    {
      "type": "generate_ai_content",
      "config": {
        "prompt": "Write a friendly follow-up email to {{name}} who {{action_taken}}. Ask for their feedback and offer help. Be warm and conversational. Under 100 words.",
        "temperature": 0.8,
        "maxTokens": 250
      }
    },
    {
      "type": "send_email",
      "config": {
        "to": "{{email}}",
        "subject": "How did it go, {{name}}?",
        "body": "{{ai_content}}"
      }
    }
  ]
}
```

### 📰 Newsletter Template

```json
{
  "name": "Daily AI Digest",
  "triggerConfig": {
    "type": "schedule",
    "schedule": {
      "frequency": "daily",
      "time": "08:00"
    }
  },
  "actions": [
    {
      "type": "generate_ai_content",
      "config": {
        "prompt": "Create a brief morning newsletter for {{date}}. Include: 1) A motivational quote, 2) Today's tip for productivity, 3) A quick reminder about {{company_goal}}. Keep it energizing and under 150 words.",
        "systemPrompt": "You are an inspiring team leader. Write motivational, actionable content.",
        "temperature": 0.7,
        "maxTokens": 300
      }
    },
    {
      "type": "send_email",
      "config": {
        "to": "team@xytek.ai",
        "subject": "Good Morning! ☀️ - {{date}}",
        "body": "{{ai_content}}"
      }
    }
  ]
}
```

### 🚀 Product Launch Template

```json
{
  "name": "AI Product Launch",
  "triggerConfig": { "type": "manual" },
  "actions": [
    {
      "type": "generate_ai_content",
      "config": {
        "prompt": "Write an exciting product launch email for {{feature_name}}. Target audience: {{audience}}. Key benefits: {{benefits}}. Tone: {{tone}}. Include a clear CTA. Under 200 words.",
        "temperature": 0.8,
        "maxTokens": 400
      }
    },
    {
      "type": "send_email",
      "config": {
        "to": "{{recipient_list}}",
        "subject": "🚀 Introducing {{feature_name}}!",
        "body": "{{ai_content}}"
      }
    }
  ]
}
```

## Best Practices

### ✅ Do's

1. **Test First** - Use sample data before real sends
2. **Use Descriptive Variables** - `{{customer_name}}` vs `{{n}}`
3. **Set Appropriate Temperature**
   - 0.3-0.5: Professional, factual
   - 0.7-0.8: Balanced, friendly
   - 0.9-1.2: Creative, varied
4. **Monitor Execution Logs** - Check for errors
5. **Respect Gmail Limits** - ~500 emails/day for free accounts

### ❌ Don'ts

1. **Don't Spam** - Respect recipients
2. **Don't Skip Testing** - Always test with sample data
3. **Don't Use High Temperature for Formal** - Keep it professional
4. **Don't Ignore Errors** - Check logs regularly
5. **Don't Hardcode Data** - Use variables for flexibility

## Advanced Use Cases

### Multi-Language Campaigns

```json
{
  "prompt": "Write a {{language}} marketing email about {{product}}...",
  "data": {
    "language": "Spanish",
    "product": "XYTEK AI"
  }
}
```

### A/B Testing

Create multiple workflows with different:
- Tones (professional vs casual)
- Lengths (short vs detailed)
- CTAs (different calls-to-action)

### Personalization Levels

**Basic:**
```json
{
  "recipient": "john@example.com",
  "name": "John"
}
```

**Advanced:**
```json
{
  "recipient": "john@example.com",
  "name": "John",
  "company": "Acme Corp",
  "industry": "Education",
  "pain_points": "manual grading, lack of insights",
  "previous_interaction": "attended webinar on Jan 10",
  "interests": "AI automation, time-saving tools"
}
```

### Conditional Content

```json
{
  "prompt": "Write to {{name}} at {{company}}. {{#if premium}}Mention our premium features.{{else}}Focus on our free tier.{{/if}}"
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Variables not replaced | Check JSON format, ensure variables match |
| Email not sent | Verify Gmail is authorized |
| AI content generic | Add more context to prompt, increase specificity |
| Rate limit errors | Reduce send frequency, upgrade Gmail account |
| Content too short/long | Adjust `maxTokens` parameter |

## Rate Limits & Costs

### Gmail Limits
- **Free Account**: ~500 emails/day
- **Google Workspace**: ~2,000 emails/day
- **Recommendation**: Batch sends, use delays

### OpenAI Costs (Typical)
- **GPT-4o Mini**: ~$0.0001-0.0005 per email
- **GPT-4o**: ~$0.001-0.005 per email
- **1,000 emails/month**: $0.10-$5 depending on model

## UI Features

### Workflow Builder
- **Templates Gallery** - Pre-built workflows
- **Visual Editor** - Drag-and-drop actions
- **Variable Hints** - Auto-suggest common variables
- **Test Execution** - Test with sample data
- **Examples** - View working examples

### Execution Modal
- **JSON Editor** - Edit variable data
- **Sample Data** - Auto-generated based on template
- **API Example** - Copy-paste curl command
- **Instant Execute** - Test immediately

## Support & Resources

- **UI**: [class.xytek.ai/dashboard](https://class.xytek.ai/dashboard)
- **Quickstart**: `AUTOMATION_QUICKSTART.md`
- **Full Guide**: `docs/AUTOMATION_GUIDE.md`
- **API Docs**: Contact Xytek support

---

**Ready to Launch?** Create your first outbound agent and start sending AI-powered campaigns! 🚀

