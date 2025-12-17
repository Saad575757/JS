# AI Grading Feature Documentation

## Overview

The AI Grading feature allows teachers to leverage artificial intelligence to automatically grade student submissions. This powerful feature saves time, provides consistent grading, and offers detailed feedback to students.

---

## Features

### 🤖 Automatic Grading
- AI analyzes student submissions based on assignment criteria
- Generates grades and detailed feedback automatically
- Supports both manual review and automatic modes

### 📊 Rubric Generation
- AI can generate grading rubrics from assignment descriptions
- Suggests criteria and point distributions
- Helps standardize grading across submissions

### ✅ Manual Review Mode
- AI suggests grades that teachers can approve/reject
- Teachers maintain full control over final grades
- Review detailed AI analysis before applying grades

### ⚡ Automatic Mode
- Instant grading upon submission
- Students receive immediate feedback
- Perfect for objective assignments with clear criteria

---

## Components

### 1. AIGradingSettings Component
**Location:** `src/components/AIGradingSettings/index.jsx`

Modal component for configuring AI grading settings for an assignment.

**Features:**
- Enable/disable AI grading
- Choose grading mode (manual/auto)
- Add custom AI instructions
- Generate rubric suggestions
- Extract grading criteria from assignment description

**Usage:**
```jsx
import AIGradingSettings from '@/components/AIGradingSettings';

<AIGradingSettings
  show={showModal}
  onHide={() => setShowModal(false)}
  assignment={selectedAssignment}
  onSettingsUpdated={(settings) => console.log('Settings updated:', settings)}
/>
```

### 2. PendingAIGrades Component
**Location:** `src/components/PendingAIGrades/index.jsx`

Modal component for reviewing and approving AI-generated grades (manual mode only).

**Features:**
- View all pending AI grades
- See detailed AI analysis and feedback
- Approve or reject individual grades
- Batch processing capabilities

**Usage:**
```jsx
import PendingAIGrades from '@/components/PendingAIGrades';

<PendingAIGrades
  show={showModal}
  onHide={() => setShowModal(false)}
  onGradesProcessed={() => loadSubmissions()}
/>
```

---

## API Integration

### API Utilities
**Location:** `src/lib/api/aiGrading.js`

#### Available Functions:

##### 1. Update AI Grading Settings
```javascript
import { updateAIGradingSettings } from '@/lib/api/aiGrading';

await updateAIGradingSettings(assignmentId, {
  enabled: true,
  mode: 'manual', // or 'auto'
  aiInstructions: 'Focus on code quality and documentation',
  extractCriteria: true
});
```

##### 2. Get AI Grading Settings
```javascript
import { getAIGradingSettings } from '@/lib/api/aiGrading';

const settings = await getAIGradingSettings(assignmentId);
```

##### 3. Generate Rubric Suggestions
```javascript
import { generateRubricSuggestions } from '@/lib/api/aiGrading';

const rubric = await generateRubricSuggestions(assignmentId);
console.log(rubric.criteria); // Array of grading criteria
```

##### 4. Get Pending AI Grades
```javascript
import { getPendingAIGrades } from '@/lib/api/aiGrading';

const pending = await getPendingAIGrades();
console.log(pending.pendingGrades); // Array of grades awaiting approval
```

##### 5. Approve AI Grade
```javascript
import { approveAIGrade } from '@/lib/api/aiGrading';

await approveAIGrade(gradeId, approvalToken);
```

##### 6. Reject AI Grade
```javascript
import { rejectAIGrade } from '@/lib/api/aiGrading';

await rejectAIGrade(gradeId, approvalToken, 'Reason for rejection');
```

##### 7. Trigger AI Grading (Manual Mode)
```javascript
import { triggerAIGrading } from '@/lib/api/aiGrading';

await triggerAIGrading(submissionId);
```

---

## Backend API Endpoints

### 1. Enable/Update AI Grading Settings
```http
PUT /api/ai-grading/settings/:assignmentId
Authorization: Bearer <teacher_token>

Body:
{
  "enabled": true,
  "mode": "manual" | "auto",
  "aiInstructions": "Optional custom instructions",
  "extractCriteria": true
}

Response:
{
  "success": true,
  "settings": {
    "id": 1,
    "assignment_id": 123,
    "enabled": true,
    "mode": "manual",
    "ai_instructions": "...",
    "extract_criteria": true
  }
}
```

### 2. Get AI Grading Settings
```http
GET /api/ai-grading/settings/:assignmentId
Authorization: Bearer <teacher_token>

Response:
{
  "success": true,
  "settings": {
    "enabled": true,
    "mode": "manual",
    "ai_instructions": "...",
    "extract_criteria": true
  }
}
```

### 3. Generate Rubric Suggestions
```http
POST /api/ai-grading/rubric/:assignmentId
Authorization: Bearer <teacher_token>

Response:
{
  "success": true,
  "rubric": {
    "criteria": [
      {
        "name": "Code Quality",
        "points": 30,
        "description": "Clean, readable, well-structured code",
        "levels": {
          "excellent": "30 pts - Exceptional code quality",
          "good": "25 pts - Good code quality",
          "fair": "20 pts - Acceptable code quality",
          "poor": "10 pts - Poor code quality"
        }
      },
      {
        "name": "Functionality",
        "points": 40,
        "description": "Program meets all requirements",
        "levels": { ... }
      },
      {
        "name": "Documentation",
        "points": 20,
        "description": "Comments and explanations",
        "levels": { ... }
      },
      {
        "name": "Testing",
        "points": 10,
        "description": "Test coverage and quality",
        "levels": { ... }
      }
    ]
  }
}
```

### 4. Get Pending AI Grades (Manual Mode)
```http
GET /api/ai-grading/pending
Authorization: Bearer <teacher_token>

Response:
{
  "success": true,
  "pendingGrades": [
    {
      "id": 1,
      "student_id": 3,
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "assignment_id": 123,
      "assignment_title": "Essay 1",
      "submission_id": 456,
      "proposed_grade": 85,
      "proposed_feedback": "Great work! Your essay demonstrates...",
      "ai_analysis": {
        "strengths": [
          "Well-structured arguments",
          "Good use of evidence",
          "Clear writing style"
        ],
        "improvements": [
          "Could expand on conclusion",
          "Minor grammar issues"
        ],
        "criteria": {
          "Content": 40,
          "Organization": 25,
          "Grammar": 15,
          "Citations": 5
        }
      },
      "approval_token": "abc123...",
      "created_at": "2025-12-17T..."
    }
  ]
}
```

### 5. Approve AI Grade
```http
POST /api/ai-grading/approve/:gradeId
Authorization: Bearer <teacher_token>

Body:
{
  "approvalToken": "abc123..."
}

Response:
{
  "success": true,
  "message": "Grade approved and applied to submission"
}
```

### 6. Reject AI Grade
```http
POST /api/ai-grading/reject/:gradeId
Authorization: Bearer <teacher_token>

Body:
{
  "approvalToken": "abc123...",
  "reason": "Optional rejection reason"
}

Response:
{
  "success": true,
  "message": "Grade rejected successfully"
}
```

### 7. Trigger AI Grading (Manual Mode)
```http
POST /api/ai-grading/grade/:submissionId
Authorization: Bearer <teacher_token>

Response:
{
  "success": true,
  "pendingGrade": {
    "id": 1,
    "proposed_grade": 85,
    "proposed_feedback": "...",
    "ai_analysis": { ... }
  }
}
```

---

## User Flow

### Teacher Workflow

#### 1. **Enable AI Grading**
1. Navigate to class → Assignments tab
2. Click the robot icon (🤖) next to an assignment
3. Toggle "Enable AI Grading" ON
4. Choose grading mode:
   - **Manual Review:** AI suggests, teacher approves
   - **Automatic:** AI grades instantly

#### 2. **Configure Settings**
- Add custom AI instructions (optional)
- Enable "Extract Grading Criteria" to analyze assignment description
- Generate rubric suggestions for structured grading

#### 3. **Manual Review Mode**
1. Students submit assignments
2. AI analyzes and generates proposed grades
3. Click "Pending AI Grades" button
4. Review each grade with detailed analysis:
   - Proposed grade (0-100)
   - Detailed feedback
   - Strengths identified
   - Areas for improvement
   - Criteria breakdown
5. Approve or reject each grade
6. Approved grades are applied to submissions

#### 4. **Automatic Mode**
1. Students submit assignments
2. AI immediately grades and provides feedback
3. Grades are automatically applied
4. Students see grades instantly

### Student Experience

#### Manual Mode:
1. Submit assignment
2. Status shows "Submitted"
3. Wait for teacher approval of AI grade
4. Receive grade and detailed feedback

#### Automatic Mode:
1. Submit assignment
2. AI processes submission immediately
3. Receive instant grade and feedback
4. See detailed analysis of strengths/weaknesses

---

## Integration in ClassDetailView

**Location:** `src/app/(admin)/apps/classes/components/ClassDetailView_New.jsx`

### Teacher View Additions:

#### 1. Pending AI Grades Button (Header)
```jsx
<Button 
  variant="outline-info" 
  size="sm"
  onClick={() => setShowPendingAIGrades(true)}
>
  <IconifyIcon icon="ri:robot-2-line" className="me-2" />
  Pending AI Grades
</Button>
```

#### 2. AI Settings Icon (Per Assignment)
Each assignment row now has a robot icon for AI grading settings:
```jsx
<Button 
  variant="link" 
  className="text-primary p-0"
  onClick={() => {
    setSelectedAssignment(assignment);
    setShowAIGradingSettings(true);
  }}
  title="AI Grading Settings"
>
  <IconifyIcon icon="ri:robot-line" />
</Button>
```

---

## Best Practices

### 1. **Clear Assignment Descriptions**
- Provide detailed requirements and expectations
- Enable "Extract Criteria" for better AI understanding
- Include grading criteria in assignment description

### 2. **Custom AI Instructions**
Enhance grading accuracy with specific instructions:
```
Examples:
- "Focus on code efficiency and readability"
- "Penalize late submissions by 10%"
- "Give partial credit for attempted solutions"
- "Check for proper MLA citations"
```

### 3. **Use Manual Mode Initially**
- Start with manual review to evaluate AI accuracy
- Approve/reject grades to train expectations
- Switch to auto mode once confident

### 4. **Generate Rubrics**
- Use AI rubric generator for structured assignments
- Review and customize suggested criteria
- Share rubric with students before assignment

### 5. **Review AI Analysis**
- Check strengths/improvements identified
- Verify criteria breakdown
- Adjust custom instructions if needed

---

## Error Handling

### Common Issues:

#### 1. **AI Grading Not Enabled**
```javascript
// Check if settings exist
const settings = await getAIGradingSettings(assignmentId);
if (!settings.enabled) {
  alert('Please enable AI grading for this assignment');
}
```

#### 2. **No Pending Grades**
```javascript
// Handle empty pending list
const pending = await getPendingAIGrades();
if (pending.pendingGrades.length === 0) {
  console.log('No pending grades to review');
}
```

#### 3. **Approval Token Invalid**
```javascript
// Backend validates tokens
try {
  await approveAIGrade(gradeId, token);
} catch (error) {
  console.error('Invalid or expired approval token');
}
```

---

## Security Considerations

1. **Authentication Required:** All AI grading endpoints require teacher authentication
2. **Approval Tokens:** Prevent unauthorized grade manipulation
3. **Permission Checks:** Only teachers can access AI grading features
4. **Audit Trail:** All AI grading actions are logged (backend)

---

## Future Enhancements

### Planned Features:
- Batch approve/reject pending grades
- Custom rubric editor with AI suggestions
- Grade appeal system for students
- AI confidence scores for grades
- Historical accuracy tracking
- Multi-language support for feedback
- Plagiarism detection integration

### Potential Improvements:
- Real-time AI grading progress tracking
- AI grading analytics and insights
- Student performance trends based on AI feedback
- Customizable feedback templates
- Integration with learning management systems

---

## Testing

### Manual Testing Checklist:

#### AI Grading Settings:
- [ ] Open AI settings modal
- [ ] Toggle AI grading on/off
- [ ] Switch between manual/auto modes
- [ ] Add custom instructions
- [ ] Generate rubric suggestions
- [ ] Save settings successfully

#### Pending AI Grades (Manual Mode):
- [ ] View pending grades list
- [ ] Expand grade details
- [ ] Review AI analysis
- [ ] Approve a grade
- [ ] Reject a grade with reason
- [ ] Verify grade applied to submission

#### Automatic Mode:
- [ ] Submit assignment as student
- [ ] Verify instant grading
- [ ] Check feedback displayed
- [ ] Validate grade accuracy

---

## Support

For issues or questions:
1. Check browser console for error logs
2. Verify backend API endpoints are working
3. Ensure proper authentication tokens
4. Review assignment description for clarity
5. Contact system administrator if problems persist

---

## Summary

The AI Grading feature revolutionizes the grading process by:
- ✅ Saving teachers significant time
- ✅ Providing consistent, objective grading
- ✅ Offering detailed, constructive feedback
- ✅ Enabling instant student feedback (auto mode)
- ✅ Maintaining teacher oversight (manual mode)

**Get Started Today!** Enable AI grading for your assignments and experience the future of education technology! 🚀

