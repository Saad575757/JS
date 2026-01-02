# AI Grading - Developer Quick Reference 🔧

## Quick Links

| Component | File | Purpose |
|-----------|------|---------|
| Global AI Settings | `src/components/GlobalAISettings/index.jsx` | Configure AI grading globally |
| Grade Review Page | `src/app/(admin)/grading/[token]/page.jsx` | Email-based grade review |
| Preferences API | `src/lib/api/aiGradingPreferences.js` | Global preferences endpoints |
| Review API | `src/lib/api/aiGradingReview.js` | Token-based review endpoints |
| Core AI API | `src/lib/api/aiGrading.js` | AI grading core functions |

---

## API Quick Reference

### Global Preferences
```javascript
import { 
  getAIGradingPreferences, 
  updateAIGradingPreferences, 
  applyAISettingsToAllAssignments 
} from '@/lib/api/aiGradingPreferences';

// Get preferences
const { preferences } = await getAIGradingPreferences();

// Update preferences
await updateAIGradingPreferences({
  aiGradingEnabled: true,
  defaultGradingMode: 'manual',
  defaultAiInstructions: 'Focus on clarity...',
  autoApplyToNewAssignments: true
});

// Apply to all assignments
const result = await applyAISettingsToAllAssignments();
// Returns: { appliedCount, skippedCount, totalAssignments }
```

### Grade Review
```javascript
import { 
  getGradeByToken, 
  approveGradeByToken, 
  rejectGradeByToken 
} from '@/lib/api/aiGradingReview';

// Get grade by token
const { grade } = await getGradeByToken(token);

// Approve grade
await approveGradeByToken(token);

// Reject grade
await rejectGradeByToken(token, 'AI misunderstood requirements');
```

---

## Component Usage

### Global AI Settings Modal
```jsx
import GlobalAISettings from '@/components/GlobalAISettings';

<GlobalAISettings
  show={showModal}
  onHide={() => setShowModal(false)}
  onSettingsUpdated={(settings) => {
    console.log('Settings updated:', settings);
  }}
/>
```

### Grade Review Page
```jsx
// Route: /grading/[token]
// Automatically handles token from URL params
// No props needed - fully self-contained
```

---

## Backend Endpoints Expected

### Global Preferences
```http
GET /api/ai-grading/preferences
Response: {
  success: true,
  preferences: {
    teacher_id: number,
    ai_grading_enabled: boolean,
    default_grading_mode: 'manual' | 'auto',
    default_ai_instructions: string,
    auto_apply_to_new_assignments: boolean
  }
}

PUT /api/ai-grading/preferences
Body: {
  aiGradingEnabled: boolean,
  defaultGradingMode: 'manual' | 'auto',
  defaultAiInstructions: string,
  autoApplyToNewAssignments: boolean
}

POST /api/ai-grading/preferences/apply-to-all
Response: {
  success: true,
  appliedCount: number,
  skippedCount: number,
  totalAssignments: number
}
```

### Grade Review
```http
GET /api/ai-grading/grade/:token
Response: {
  success: true,
  grade: {
    id: number,
    proposed_grade: number,
    ai_feedback: string,
    ai_analysis: {
      breakdown: Array<{
        criterion: string,
        score: number,
        maxScore: number,
        comment: string
      }>
    },
    assignment: { id, title, max_points, due_date },
    course: { id, name },
    student: { id, name, email },
    submission: {
      id,
      submission_text: string,
      attachments: Array<{
        originalName: string,
        url: string,
        size: number,
        mimetype: string
      }>,
      submitted_at: string
    }
  }
}

POST /api/ai-grading/approve/:token
Response: {
  success: true,
  message: string
}

POST /api/ai-grading/reject/:token
Body: { reason: string }
Response: {
  success: true,
  message: string
}
```

---

## State Management Patterns

### Global Settings Component
```javascript
const [preferences, setPreferences] = useState({
  aiGradingEnabled: false,
  defaultGradingMode: 'manual',
  defaultAiInstructions: '',
  autoApplyToNewAssignments: true
});

const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(null);
```

### Review Page Component
```javascript
const [loading, setLoading] = useState(true);
const [processing, setProcessing] = useState(false);
const [gradeData, setGradeData] = useState(null);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(null);
const [showRejectModal, setShowRejectModal] = useState(false);
const [rejectReason, setRejectReason] = useState('');
```

---

## Color Coding Helper

```javascript
const getGradeColor = (grade, maxPoints) => {
  const percentage = (grade / maxPoints) * 100;
  if (percentage >= 90) return 'success';
  if (percentage >= 80) return 'primary';
  if (percentage >= 70) return 'info';
  if (percentage >= 60) return 'warning';
  return 'danger';
};

const getGradePercentage = (grade, maxPoints) => {
  return ((grade / maxPoints) * 100).toFixed(1);
};
```

---

## Environment Variables

```bash
# Required
NEXT_PUBLIC_API_BASE_URL=https://class.xytek.ai

# For development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## Testing Commands

```bash
# Test global settings
curl -X GET https://class.xytek.ai/api/ai-grading/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test apply to all
curl -X POST https://class.xytek.ai/api/ai-grading/preferences/apply-to-all \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test review page (replace token)
curl -X GET https://class.xytek.ai/api/ai-grading/grade/YOUR_TOKEN

# Test approve
curl -X POST https://class.xytek.ai/api/ai-grading/approve/YOUR_TOKEN

# Test reject
curl -X POST https://class.xytek.ai/api/ai-grading/reject/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{"reason":"Testing rejection"}'
```

---

## Common Patterns

### Loading State
```jsx
{loading ? (
  <div className="text-center py-4">
    <Spinner animation="border" />
    <p className="mt-2 text-muted">Loading...</p>
  </div>
) : (
  // Content
)}
```

### Error Alert
```jsx
{error && (
  <Alert variant="danger" dismissible onClose={() => setError(null)}>
    <IconifyIcon icon="ri:error-warning-line" className="me-2" />
    {error}
  </Alert>
)}
```

### Success Alert
```jsx
{success && (
  <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
    <IconifyIcon icon="ri:checkbox-circle-line" className="me-2" />
    {success}
  </Alert>
)}
```

### Processing Button
```jsx
<Button onClick={handleSave} disabled={saving}>
  {saving ? (
    <>
      <Spinner animation="border" size="sm" className="me-2" />
      Saving...
    </>
  ) : (
    <>
      <IconifyIcon icon="ri:save-line" className="me-2" />
      Save
    </>
  )}
</Button>
```

---

## Icon Reference

```jsx
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// AI & Robot
<IconifyIcon icon="ri:robot-line" />
<IconifyIcon icon="ri:robot-2-line" />

// Actions
<IconifyIcon icon="ri:checkbox-circle-line" />  // Approve
<IconifyIcon icon="ri:close-circle-line" />     // Reject
<IconifyIcon icon="ri:refresh-line" />          // Apply to all

// Status
<IconifyIcon icon="ri:error-warning-line" />    // Error
<IconifyIcon icon="ri:information-line" />      // Info
<IconifyIcon icon="ri:alert-line" />            // Warning

// Content
<IconifyIcon icon="ri:file-text-line" />        // Text/Document
<IconifyIcon icon="ri:file-list-line" />        // List
<IconifyIcon icon="ri:book-open-line" />        // Course
<IconifyIcon icon="ri:user-line" />             // Student
<IconifyIcon icon="ri:star-line" />             // Grade

// UI
<IconifyIcon icon="ri:settings-3-line" />       // Settings
<IconifyIcon icon="ri:dashboard-line" />        // Dashboard
<IconifyIcon icon="ri:bar-chart-line" />        // Analytics
```

---

## Error Handling Pattern

```javascript
const handleAction = async () => {
  setProcessing(true);
  setError(null);
  setSuccess(null);

  try {
    const result = await apiCall();
    setSuccess('Action completed successfully!');
    
    // Optional: Redirect after delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  } catch (err) {
    console.error('[ACTION] Error:', err);
    setError(`Failed to complete action: ${err.message}`);
  } finally {
    setProcessing(false);
  }
};
```

---

## Responsive Design Utilities

```jsx
// Stack on mobile, side-by-side on desktop
<Row>
  <Col lg={8}>
    {/* Main content */}
  </Col>
  <Col lg={4}>
    {/* Sidebar */}
  </Col>
</Row>

// Sticky sidebar
<div style={{ position: 'sticky', top: '20px' }}>
  {/* Sidebar content */}
</div>

// Hide on mobile
<div className="d-none d-lg-block">
  {/* Desktop only */}
</div>

// Show on mobile only
<div className="d-lg-none">
  {/* Mobile only */}
</div>
```

---

## Bootstrap Variants

```javascript
// Colors
'primary'    // Blue
'secondary'  // Gray
'success'    // Green
'danger'     // Red
'warning'    // Yellow
'info'       // Light blue
'light'      // Light gray
'dark'       // Dark gray

// Usage
<Button variant="primary">
<Alert variant="success">
<Badge bg="danger">
<Card className="border-info">
```

---

## Database Schema (Expected)

```sql
-- Teacher AI Preferences
CREATE TABLE teacher_ai_preferences (
  teacher_id INT PRIMARY KEY,
  ai_grading_enabled BOOLEAN DEFAULT false,
  default_grading_mode VARCHAR(10) DEFAULT 'manual',
  default_ai_instructions TEXT,
  auto_apply_to_new_assignments BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- AI Grades
CREATE TABLE ai_grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT,
  assignment_id INT,
  proposed_grade DECIMAL(5,2),
  ai_feedback TEXT,
  ai_analysis JSON,
  status VARCHAR(20) DEFAULT 'pending',
  review_token VARCHAR(255) UNIQUE,
  token_expires_at TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP
);
```

---

## Deployment Checklist

- [ ] Environment variables set
- [ ] API endpoints implemented
- [ ] Database migrations run
- [ ] Email service configured
- [ ] Test with sample data
- [ ] Verify token expiration works
- [ ] Test on mobile devices
- [ ] Check email templates
- [ ] Verify security (HTTPS only)
- [ ] Set up monitoring/logging

---

## Support Resources

- 📖 [Full Documentation](./GLOBAL_AI_GRADING.md)
- 🚀 [Quick Start Guide](./GLOBAL_AI_QUICK_START.md)
- 📋 [Review Page Docs](./AI_GRADE_REVIEW_PAGE.md)
- 📊 [Complete Summary](./AI_GRADING_COMPLETE_SUMMARY.md)

---

**Last Updated:** December 17, 2025  
**Version:** 2.0.0  
**Maintainer:** Development Team

