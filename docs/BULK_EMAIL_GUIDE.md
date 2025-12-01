# 📮 Bulk Email Campaigns - Complete Guide

## Overview

Send **personalized bulk emails** to hundreds or thousands of recipients using CSV files. Perfect for:

- 📧 Marketing campaigns
- 📰 Newsletter distributions
- 🎯 Targeted outreach
- 📊 Customer communications
- 🎉 Event invitations

## Quick Start (3 Steps)

### Step 1: Prepare Your CSV

Create a CSV file with your recipients:

```csv
email,name,company,plan,custom_field
john@example.com,John Doe,Acme Corp,Premium,ValueA
jane@example.com,Jane Smith,TechCo,Basic,ValueB
bob@example.com,Bob Johnson,StartupXYZ,Enterprise,ValueC
```

**Requirements:**
- ✅ First row must be headers (column names)
- ✅ Must have an `email` column
- ✅ All other columns become variables
- ✅ UTF-8 encoding recommended

### Step 2: Upload CSV

**Via UI:**
1. Go to your outbound agent's workflows
2. Click **"Upload CSV"** button (top right)
3. Enter list name: "Marketing Campaign Q1"
4. Select your CSV file
5. Click "Upload"

**Via API:**
```bash
curl -X POST https://class.xytek.ai/api/automation/recipient-lists/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "csv=@recipients.csv" \
  -F "name=Marketing Campaign Q1" \
  -F "agentId=10"
```

**Response:**
```json
{
  "recipientList": {
    "id": 5,
    "name": "Marketing Campaign Q1",
    "recipientCount": 150,
    "columns": ["email", "name", "company", "plan"]
  }
}
```

### Step 3: Create Bulk Email Workflow

**Via UI:**
1. Click "Create Workflow"
2. Select "Bulk Email Campaign" template
3. Choose your recipient list
4. Customize subject and body with variables
5. Set delay between emails (1000ms recommended)
6. Save workflow

**Via API:**
```bash
curl -X POST https://class.xytek.ai/api/automation/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "agentId": 10,
    "name": "Marketing Email Campaign",
    "triggerConfig": {"type": "manual"},
    "actions": [
      {
        "type": "send_bulk_email",
        "config": {
          "recipientListId": 5,
          "subject": "Hi {{name}}! Special offer for {{company}}",
          "body": "Hi {{name}} from {{company}},\n\nYour {{plan}} plan includes amazing features!\n\nBest regards",
          "delayBetweenEmails": 1000
        }
      }
    ],
    "status": "active"
  }'
```

### Step 4: Execute Workflow

**Via UI:**
- Workflow runs automatically (scheduled)
- Or manually click execute button

**Via API:**
```bash
curl -X POST https://class.xytek.ai/api/automation/workflows/7/execute \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## CSV Format Guide

### Basic Format

```csv
email,name
john@example.com,John Doe
jane@example.com,Jane Smith
```

### Advanced Format

```csv
email,name,company,plan,industry,pain_point,last_interaction
john@example.com,John Doe,Acme Corp,Premium,Education,manual grading,2024-01-15
jane@example.com,Jane Smith,TechCo,Basic,Technology,lack of automation,2024-01-10
```

### Column Guidelines

| Column Type | Example | Notes |
|-------------|---------|-------|
| **Required** | `email` | Recipient email address |
| **Name** | `name`, `first_name`, `last_name` | Personalization |
| **Company** | `company`, `organization` | B2B campaigns |
| **Custom** | `plan`, `industry`, `role` | Any data you want |
| **Dates** | `signup_date`, `last_seen` | Use YYYY-MM-DD format |

### Best Practices

✅ **Do:**
- Use descriptive column names: `customer_name` not `n`
- Keep column names lowercase with underscores
- Include all data you want to personalize
- Test with a small list first (5-10 recipients)

❌ **Don't:**
- Use special characters in column names
- Include empty email addresses
- Mix data types in same column
- Use spaces in column names (use underscores)

## Variable Substitution

### Using Variables

In your email subject and body, use `{{column_name}}` syntax:

```
Subject: Hi {{name}}! Special offer for {{company}}

Body:
Hi {{name}} from {{company}},

Your {{plan}} plan includes:
- Feature 1
- Feature 2
- Feature 3

Industry: {{industry}}

Best regards
```

### Example Result

For this CSV row:
```csv
email,name,company,plan,industry
john@example.com,John Doe,Acme Corp,Premium,Education
```

Produces this email:
```
To: john@example.com
Subject: Hi John Doe! Special offer for Acme Corp

Body:
Hi John Doe from Acme Corp,

Your Premium plan includes:
- Feature 1
- Feature 2
- Feature 3

Industry: Education

Best regards
```

## Rate Limiting & Delays

### Why Delays Matter

Gmail has sending limits:
- **Free Gmail**: ~500 emails/day
- **Google Workspace**: ~2,000 emails/day

### Recommended Settings

```json
{
  "delayBetweenEmails": 1000
}
```

| Recipients | Delay (ms) | Total Time | Daily Limit |
|------------|------------|------------|-------------|
| 100 | 1000 | ~2 minutes | Safe |
| 500 | 1000 | ~8 minutes | At limit (free) |
| 1000 | 2000 | ~33 minutes | Use Workspace |
| 2000 | 2000 | ~67 minutes | At limit (Workspace) |

### Exceeding Limits

If you need to send more:
1. **Upgrade to Google Workspace** (2,000/day limit)
2. **Split into batches** - Multiple lists over multiple days
3. **Use multiple agents** - Different Gmail accounts
4. **Schedule over time** - Weekly campaigns instead of daily

## Scheduling Bulk Campaigns

### One-Time Send (Manual)

```json
{
  "triggerConfig": {
    "type": "manual"
  }
}
```

Execute when ready via UI or API.

### Daily Newsletter

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

Sends every day at 8:00 AM.

### Weekly Campaign

```json
{
  "triggerConfig": {
    "type": "schedule",
    "schedule": {
      "frequency": "weekly",
      "dayOfWeek": "monday",
      "time": "09:00"
    }
  }
}
```

Sends every Monday at 9:00 AM.

### Monthly Report

```json
{
  "triggerConfig": {
    "type": "schedule",
    "schedule": {
      "frequency": "monthly",
      "time": "10:00"
    }
  }
}
```

Sends on the 1st of each month at 10:00 AM.

## Advanced Use Cases

### 1. Multi-Segment Campaign

Upload multiple CSV lists:
- `premium-customers.csv`
- `basic-customers.csv`
- `trial-users.csv`

Create separate workflows for each segment with targeted messaging.

### 2. A/B Testing

Create two workflows with same list but different:
- Subject lines
- Email copy
- Call-to-action

Track which performs better.

### 3. Drip Campaign

Schedule multiple workflows:
- Day 1: Welcome email
- Day 3: Feature overview
- Day 7: Case study
- Day 14: Upgrade offer

### 4. Re-engagement Campaign

CSV with inactive users:
```csv
email,name,last_active,plan
john@example.com,John,2023-12-01,Premium
```

Personalized message:
```
Hi {{name}},

We noticed you haven't been active since {{last_active}}.

Your {{plan}} plan still includes...

Come back today!
```

## Managing Recipient Lists

### View Lists

**Via UI:**
- Lists shown on workflow page
- Shows name and recipient count

**Via API:**
```bash
curl -X GET https://class.xytek.ai/api/automation/recipient-lists?agentId=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete List

**Via UI:**
- Click delete icon on list card

**Via API:**
```bash
curl -X DELETE https://class.xytek.ai/api/automation/recipient-lists/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update List

To update a list:
1. Delete old list
2. Upload new CSV with same name

## Troubleshooting

### Issue: "Email column not found"

**Solution:** Ensure your CSV has a column named `email`:
```csv
email,name
john@example.com,John
```

### Issue: "Rate limit exceeded"

**Solutions:**
1. Increase `delayBetweenEmails` to 2000ms
2. Split recipients into smaller lists
3. Upgrade to Google Workspace

### Issue: "Variables not replaced"

**Problem:** Using wrong variable names

**Solution:** Variable names must match CSV column names exactly:
- CSV column: `first_name`
- Email: Use `{{first_name}}` not `{{name}}`

### Issue: "Special characters broken"

**Solution:** Save CSV as UTF-8:
- Excel: Save As → CSV UTF-8
- Google Sheets: Download → CSV

### Issue: "Some emails not sent"

**Check:**
1. Execution logs for errors
2. Invalid email addresses in CSV
3. Gmail authorization still valid
4. Rate limits not exceeded

## Best Practices

### Email Content

✅ **Do:**
- Personalize with recipient data
- Include clear call-to-action
- Keep it concise and scannable
- Test with yourself first
- Provide unsubscribe option

❌ **Don't:**
- Use all caps or excessive punctuation!!!
- Include too many links (spam filters)
- Send generic, impersonal content
- Forget to test thoroughly

### CSV Management

✅ **Do:**
- Keep CSVs organized with clear names
- Remove invalid email addresses
- Update lists regularly
- Backup your CSVs
- Document your column meanings

❌ **Don't:**
- Reuse old, outdated lists
- Include duplicate email addresses
- Mix different audiences in one list

### Compliance

⚠️ **Important:**
- Follow CAN-SPAM Act (US)
- Follow GDPR (EU)
- Include physical address
- Honor unsubscribe requests
- Only email opt-in recipients

## API Reference

### Upload CSV
```bash
POST /api/automation/recipient-lists/upload
Content-Type: multipart/form-data

Form Data:
- csv: file
- name: string
- agentId: number
```

### List Recipient Lists
```bash
GET /api/automation/recipient-lists?agentId={id}
```

### Get Recipient List
```bash
GET /api/automation/recipient-lists/{listId}
```

### Delete Recipient List
```bash
DELETE /api/automation/recipient-lists/{listId}
```

### Create Bulk Workflow
```bash
POST /api/automation/workflows

{
  "agentId": 10,
  "name": "Bulk Campaign",
  "triggerConfig": {"type": "manual"},
  "actions": [{
    "type": "send_bulk_email",
    "config": {
      "recipientListId": 5,
      "subject": "...",
      "body": "...",
      "delayBetweenEmails": 1000
    }
  }]
}
```

### Execute Bulk Workflow
```bash
POST /api/automation/workflows/{workflowId}/execute
```

## Examples

### Example 1: Simple Newsletter

**CSV:**
```csv
email,name
john@example.com,John
jane@example.com,Jane
```

**Workflow:**
```json
{
  "subject": "Weekly Update for {{name}}",
  "body": "Hi {{name}},\n\nHere's this week's update...\n\nBest regards",
  "delayBetweenEmails": 1000
}
```

### Example 2: Product Launch

**CSV:**
```csv
email,name,company,plan,industry
john@example.com,John Doe,Acme Corp,Premium,Education
```

**Workflow:**
```json
{
  "subject": "🚀 New Feature for {{industry}} - {{company}}",
  "body": "Hi {{name}},\n\nWe just launched a feature perfect for {{industry}}!\n\nYour {{plan}} plan includes:\n- Early access\n- Priority support\n\nCheck it out!\n\nBest regards",
  "delayBetweenEmails": 1500
}
```

### Example 3: Re-engagement

**CSV:**
```csv
email,name,last_login,days_inactive
john@example.com,John,2024-01-01,30
```

**Workflow:**
```json
{
  "subject": "We miss you, {{name}}!",
  "body": "Hi {{name}},\n\nIt's been {{days_inactive}} days since your last login on {{last_login}}.\n\nWe have new features waiting for you!\n\nCome back today and get a special welcome back offer.\n\nBest regards",
  "delayBetweenEmails": 1000
}
```

---

**Ready to launch your first bulk email campaign?** Upload your CSV and start sending personalized emails at scale! 📮

