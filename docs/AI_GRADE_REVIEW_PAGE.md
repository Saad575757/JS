# AI Grade Review Page 📋✨

## Overview

The **Grade Review Page** allows teachers to review AI-generated grades via email links. Teachers receive an email with a unique review link, click it, and can approve or reject the grade with full context.

---

## Features

### 📧 Email-Based Review
- Unique review token per grade
- Secure, one-time use links
- No login required (token-based authentication)

### 📊 Complete Grade Context
- **Course & Assignment Info**: Course name, assignment title, due date, max points
- **Student Info**: Student name, email, submission date
- **Proposed Grade**: Large, prominent display with color-coding
- **AI Feedback**: Full AI-generated feedback
- **Grade Breakdown**: Detailed rubric breakdown (if available)
- **Student Submission**: Full submission text and attachments

### ✅ Easy Actions
- **Approve Grade**: One-click approval → Student notified
- **Reject Grade**: Provide reason → Manual grading required
- **Return to Dashboard**: Quick navigation

### 🎨 Beautiful UI
- Color-coded grades (green/yellow/red based on percentage)
- Responsive design (mobile-friendly)
- Loading states
- Success/error handling
- Sticky action panel

---

## User Flow

### Step 1: Teacher Receives Email
```
Subject: [AI Grade] Review Needed: John Doe - Essay Assignment

Hi Teacher,

An AI-generated grade is ready for your review:

Student: John Doe
Assignment: Essay Assignment
Course: English 101
Proposed Grade: 85/100

[Review Grade Now]

---
This link expires in 7 days
```

### Step 2: Click Review Link
Teacher clicks the link → Opens `/grading/:token` page

### Step 3: Review Grade
Teacher sees:
- ✅ Complete assignment context
- ✅ Student submission
- ✅ AI-proposed grade (85/100 = 85%)
- ✅ AI feedback
- ✅ Grade breakdown

### Step 4: Take Action

**Option A: Approve**
1. Click "Approve Grade" button
2. Confirm approval
3. See success message
4. Student receives email notification
5. Redirect to dashboard

**Option B: Reject**
1. Click "Reject Grade" button
2. Modal opens for rejection reason
3. Enter reason (e.g., "AI misunderstood requirements")
4. Confirm rejection
5. Grade marked for manual review
6. Redirect to dashboard

---

## Page Layout

### Desktop View:
```
┌────────────────────────────────────────────────────────────┐
│  🤖 AI Grade Review                                        │
│  Review and approve or reject this AI-generated grade      │
└────────────────────────────────────────────────────────────┘

┌──────────────────────────┬─────────────────────────────────┐
│                          │  ┌───────────────────────────┐  │
│  📚 Assignment Details   │  │ ⭐ AI-Proposed Grade      │  │
│  Course: English 101     │  │                           │  │
│  Assignment: Essay 1     │  │        85                 │  │
│  Max Points: 100         │  │   out of 100 points       │  │
│                          │  │                           │  │
│  👤 Student Information  │  │        85%                │  │
│  Name: John Doe          │  │   [████████░░] Progress   │  │
│  Email: john@email.com   │  │                           │  │
│  Submitted: 12/15/2025   │  └───────────────────────────┘  │
│                          │                                  │
│  📝 Student Submission   │  ┌───────────────────────────┐  │
│  [Full text here...]     │  │ ⚙️ Actions               │  │
│                          │  │                           │  │
│  📎 Attachments:         │  │ [✅ Approve Grade]        │  │
│  • essay.pdf (150 KB)    │  │                           │  │
│                          │  │ [❌ Reject Grade]         │  │
│  💬 AI Feedback          │  │                           │  │
│  [AI feedback text...]   │  │ [🏠 Return to Dashboard]  │  │
│                          │  └───────────────────────────┘  │
│  📊 Grade Breakdown      │                                  │
│  Content: 40/50          │  ℹ️ Once approved, student     │
│  Grammar: 25/25          │    will receive this grade     │
│  Structure: 20/25        │                                  │
│                          │                                  │
└──────────────────────────┴─────────────────────────────────┘
```

### Mobile View:
```
┌──────────────────────────┐
│ 🤖 AI Grade Review       │
└──────────────────────────┘

┌──────────────────────────┐
│ ⭐ AI-Proposed Grade     │
│                          │
│         85               │
│    out of 100            │
│                          │
│         85%              │
│   [████████░░]           │
└──────────────────────────┘

┌──────────────────────────┐
│ 📚 Assignment Details    │
│ Course: English 101      │
│ Assignment: Essay 1      │
└──────────────────────────┘

┌──────────────────────────┐
│ 👤 Student Info          │
│ John Doe                 │
│ john@email.com           │
└──────────────────────────┘

┌──────────────────────────┐
│ 📝 Student Submission    │
│ [Text here...]           │
└──────────────────────────┘

┌──────────────────────────┐
│ 💬 AI Feedback           │
│ [Feedback text...]       │
└──────────────────────────┘

┌──────────────────────────┐
│ ⚙️ Actions               │
│ [✅ Approve Grade]       │
│ [❌ Reject Grade]        │
│ [🏠 Return to Dashboard] │
└──────────────────────────┘
```

---

## API Endpoints

### 1. Get Grade by Token
```http
GET /api/ai-grading/grade/:token

Response:
{
  "success": true,
  "grade": {
    "id": 1,
    "submission_id": 5,
    "proposed_grade": 85,
    "ai_feedback": "Great work! Well-structured essay...",
    "ai_analysis": {
      "breakdown": [
        {
          "criterion": "Content",
          "score": 40,
          "maxScore": 50,
          "comment": "Strong analysis..."
        }
      ]
    },
    "assignment": {
      "id": 1,
      "title": "Essay Assignment",
      "max_points": 100,
      "due_date": "2025-12-20"
    },
    "course": {
      "id": 1,
      "name": "English 101"
    },
    "student": {
      "id": 3,
      "name": "John Doe",
      "email": "john@email.com"
    },
    "submission": {
      "id": 5,
      "submission_text": "Here is my essay...",
      "attachments": [
        {
          "originalName": "essay.pdf",
          "url": "/uploads/...",
          "size": 153600,
          "mimetype": "application/pdf"
        }
      ],
      "submitted_at": "2025-12-15T10:30:00"
    }
  }
}
```

### 2. Approve Grade by Token
```http
POST /api/ai-grading/approve/:token

Response:
{
  "success": true,
  "message": "Grade approved successfully",
  "grade": {
    "id": 1,
    "status": "approved",
    "approved_at": "2025-12-17T14:30:00"
  }
}
```

### 3. Reject Grade by Token
```http
POST /api/ai-grading/reject/:token

Body:
{
  "reason": "AI misunderstood the requirements"
}

Response:
{
  "success": true,
  "message": "Grade rejected successfully",
  "grade": {
    "id": 1,
    "status": "rejected",
    "rejection_reason": "AI misunderstood the requirements",
    "rejected_at": "2025-12-17T14:30:00"
  }
}
```

---

## Component Architecture

### Files Created:

**1. API Utilities:**
```
src/lib/api/aiGradingReview.js
```
- `getGradeByToken(token)` - Fetch grade details
- `approveGradeByToken(token)` - Approve grade
- `rejectGradeByToken(token, reason)` - Reject with reason

**2. Page Component:**
```
src/app/(admin)/grading/[token]/page.jsx
```
- Grade review page
- Approve/reject actions
- Success/error handling

---

## State Management

### Component State:
```javascript
{
  loading: false,           // Loading grade data
  processing: false,        // Processing approve/reject
  gradeData: null,          // Grade details from API
  error: null,              // Error messages
  success: null,            // Success messages
  showRejectModal: false,   // Reject modal visibility
  rejectReason: ''          // Rejection reason text
}
```

---

## Color Coding

Grades are color-coded based on percentage:

| Percentage | Color   | Badge      |
|------------|---------|------------|
| 90-100%    | Green   | `success`  |
| 80-89%     | Blue    | `primary`  |
| 70-79%     | Light   | `info`     |
| 60-69%     | Yellow  | `warning`  |
| 0-59%      | Red     | `danger`   |

---

## Security Features

### Token-Based Authentication:
- ✅ Unique token per grade
- ✅ Token expires after 7 days
- ✅ One-time use (invalid after approval/rejection)
- ✅ Secure token generation (UUID + encryption)

### Validation:
- ✅ Invalid token → Error page
- ✅ Expired token → Error page
- ✅ Already processed → Error page

### Privacy:
- ✅ Only authorized teacher can access
- ✅ No student PII exposed in URL
- ✅ Secure HTTPS-only links

---

## Email Template Example

### Subject:
```
[AI Grade] Review Needed: John Doe - Essay Assignment
```

### Body:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #0d6efd; color: white; padding: 20px; }
    .content { padding: 20px; }
    .grade-box { background: #f8f9fa; padding: 20px; margin: 20px 0; }
    .button { 
      background: #198754; 
      color: white; 
      padding: 15px 30px; 
      text-decoration: none; 
      border-radius: 5px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🤖 AI Grade Ready for Review</h2>
    </div>
    <div class="content">
      <p>Hi Professor Smith,</p>
      
      <p>An AI-generated grade is ready for your review:</p>
      
      <div class="grade-box">
        <strong>Student:</strong> John Doe<br>
        <strong>Assignment:</strong> Essay Assignment<br>
        <strong>Course:</strong> English 101<br>
        <strong>Proposed Grade:</strong> 85/100 (85%)
      </div>
      
      <p style="text-align: center;">
        <a href="https://yourapp.com/grading/abc123xyz" class="button">
          Review Grade Now
        </a>
      </p>
      
      <p style="color: #6c757d; font-size: 12px;">
        This link expires in 7 days. Click to review the submission, 
        AI feedback, and approve or reject the grade.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## User Experience Flow

### Success Flow (Approve):
```
1. Teacher clicks email link
   └─> Opens /grading/:token

2. Page loads grade details
   └─> Shows all context (assignment, student, submission, AI grade)

3. Teacher reviews:
   ✓ Reads submission
   ✓ Reviews AI feedback
   ✓ Checks grade breakdown
   ✓ Verifies proposed grade

4. Teacher clicks "Approve Grade"
   └─> Confirmation dialog: "Are you sure?"

5. Teacher confirms
   └─> POST /api/ai-grading/approve/:token

6. Success!
   └─> "Grade approved successfully!"
   └─> Student receives email notification
   └─> Redirect to dashboard after 3 seconds
```

### Rejection Flow:
```
1. Teacher clicks email link
   └─> Opens /grading/:token

2. Page loads grade details
   └─> Shows all context

3. Teacher disagrees with AI grade

4. Teacher clicks "Reject Grade"
   └─> Modal opens: "Rejection Reason"

5. Teacher enters reason:
   "AI misunderstood the assignment requirements"

6. Teacher clicks "Reject Grade" in modal
   └─> POST /api/ai-grading/reject/:token

7. Success!
   └─> "Grade rejected. You can now manually grade."
   └─> Grade marked for manual review
   └─> Redirect to dashboard after 3 seconds
```

---

## Testing Checklist

### Basic Functionality:
- [ ] Open `/grading/:token` with valid token
- [ ] Page loads grade details correctly
- [ ] All sections render (assignment, student, submission, grade)
- [ ] Approve button works
- [ ] Reject button opens modal
- [ ] Reject with reason works
- [ ] Success message appears
- [ ] Redirect to dashboard works

### Error Handling:
- [ ] Invalid token shows error
- [ ] Expired token shows error
- [ ] Already processed shows error
- [ ] Network error shows message
- [ ] Loading spinner appears while loading

### UI/UX:
- [ ] Grade color matches percentage
- [ ] Progress bar displays correctly
- [ ] Responsive on mobile
- [ ] Sticky action panel works
- [ ] Attachments are downloadable
- [ ] All icons render

### Security:
- [ ] Token cannot be reused after approval
- [ ] Token cannot be reused after rejection
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected

---

## Best Practices

### For Teachers:
1. **Review First Few Grades Carefully**
   - Verify AI understands your criteria
   - Check feedback quality
   - Adjust global AI settings if needed

2. **Read the Submission**
   - Don't just trust the AI score
   - Skim the student's work
   - Verify AI didn't miss anything

3. **Use Rejection Wisely**
   - Provide clear rejection reasons
   - Helps you remember why when manually grading
   - Improves AI over time with feedback

4. **Act Quickly**
   - Links expire in 7 days
   - Students waiting for grades
   - Check email regularly

### For Developers:
1. **Token Security**
   - Use UUID v4 for tokens
   - Store hashed in database
   - Set expiration dates
   - One-time use only

2. **Email Sending**
   - Send immediately after AI grading
   - Include all context in email
   - Make button/link prominent
   - Mobile-friendly email template

3. **Performance**
   - Cache grade data
   - Lazy load attachments
   - Optimize images
   - Fast page load

---

## Future Enhancements

### Planned Features:
1. **Batch Review**: Review multiple grades on one page
2. **Compare Grades**: See AI grade vs. class average
3. **Edit Grade**: Modify grade before approving
4. **Quick Feedback**: Add teacher notes to AI feedback
5. **Mobile App**: Native mobile review experience

---

## Summary

The **Grade Review Page** provides:

✅ **Email-based review** - Click link, review, approve  
✅ **Complete context** - All info in one place  
✅ **Easy actions** - Approve or reject with one click  
✅ **Beautiful UI** - Color-coded, responsive design  
✅ **Secure tokens** - One-time use, expiring links  
✅ **Fast workflow** - Review in under 60 seconds  

**Result:** Teachers can review and approve AI grades from anywhere, anytime, in under a minute! ⚡

---

**Documentation Date:** December 17, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

