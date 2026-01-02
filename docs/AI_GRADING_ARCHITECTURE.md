# AI Grading System Architecture 🏗️

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI GRADING SYSTEM                             │
│                                                                      │
│  ┌────────────────┐  ┌───────────────┐  ┌─────────────────────┐   │
│  │  Global        │  │  Student      │  │  Email-Based        │   │
│  │  Settings      │  │  Submission   │  │  Review             │   │
│  │  (Teachers)    │  │  (Students)   │  │  (Teachers)         │   │
│  └────────────────┘  └───────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Complete User Journey

### Phase 1: Teacher Setup

```
┌──────────────────────────────────────────────────────────────┐
│ Teacher Dashboard                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Classes > English 101 > Assignments                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [🤖 AI Settings] [🤖 Pending AI Grades]            │   │
│  │ [➕ Create Assignment]                             │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                    │
│         │ (Teacher clicks "AI Settings")                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Global AI Grading Settings                          │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ☑️ Enable AI Grading                               │   │
│  │                                                     │   │
│  │ Grading Mode:                                       │   │
│  │ ● Manual Review  ○ Automatic                       │   │
│  │                                                     │   │
│  │ AI Instructions:                                    │   │
│  │ [Focus on clarity and examples...]                 │   │
│  │                                                     │   │
│  │ ☑️ Auto-apply to new assignments                   │   │
│  │                                                     │   │
│  │ [🔄 Apply to All Existing Assignments]             │   │
│  │                                                     │   │
│  │          [Cancel]  [💾 Save Settings]               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ✅ Settings saved! All assignments now have AI grading     │
└──────────────────────────────────────────────────────────────┘
```

---

### Phase 2A: Automatic Grading Flow

```
┌────────────────────────────────────────────────────────────────┐
│ AUTOMATIC MODE (Instant Feedback)                             │
└────────────────────────────────────────────────────────────────┘

Student                    Backend                    Database
   │                          │                           │
   │  Submit Assignment       │                           │
   ├─────────────────────────>│                           │
   │                          │                           │
   │                          │  Store Submission         │
   │                          ├──────────────────────────>│
   │                          │                           │
   │                          │  Trigger AI Grading       │
   │                          ├──────────────────────────>│
   │                          │                           │
   │                          │  AI Analyzes (<5s)        │
   │                          │  - Read submission        │
   │                          │  - Apply criteria         │
   │                          │  - Generate grade         │
   │                          │  - Write feedback         │
   │                          │                           │
   │                          │  Save Grade (auto-approved)│
   │                          ├──────────────────────────>│
   │                          │                           │
   │  ✅ Grade Applied        │                           │
   │<─────────────────────────┤                           │
   │                          │                           │
   │  📧 Email: Grade Ready   │                           │
   │<─────────────────────────┤                           │
   │                          │                           │
   
Timeline: < 10 seconds
Teacher Involvement: NONE
```

---

### Phase 2B: Manual Review Flow

```
┌────────────────────────────────────────────────────────────────┐
│ MANUAL REVIEW MODE (Teacher Approval Required)                │
└────────────────────────────────────────────────────────────────┘

Student              Backend              Database           Teacher
   │                    │                     │                  │
   │ Submit             │                     │                  │
   ├───────────────────>│                     │                  │
   │                    │                     │                  │
   │                    │  Store Submission   │                  │
   │                    ├────────────────────>│                  │
   │                    │                     │                  │
   │                    │  Trigger AI         │                  │
   │                    ├────────────────────>│                  │
   │                    │                     │                  │
   │                    │  AI Analyzes        │                  │
   │                    │  - Generate grade   │                  │
   │                    │  - Write feedback   │                  │
   │                    │                     │                  │
   │                    │  Save (pending)     │                  │
   │                    ├────────────────────>│                  │
   │                    │                     │                  │
   │                    │  Generate Token     │                  │
   │                    ├────────────────────>│                  │
   │                    │                     │                  │
   │                    │  📧 Review Email    │                  │
   │                    ├─────────────────────────────────────────>│
   │                    │                     │                  │
   │                    │                     │    (Later...)    │
   │                    │                     │                  │
   │                    │                     │  Click Email Link│
   │                    │                     │                  │
   │                    │   GET /grading/:token                  │
   │                    │<─────────────────────────────────────────┤
   │                    │                     │                  │
   │                    │  Fetch Grade Data   │                  │
   │                    ├────────────────────>│                  │
   │                    │                     │                  │
   │                    │  Return Full Context│                  │
   │                    │<────────────────────┤                  │
   │                    │                     │                  │
   │                    │  Display Review Page                   │
   │                    ├─────────────────────────────────────────>│
   │                    │                     │                  │
   │                    │                     │  Reviews & Approves│
   │                    │                     │                  │
   │                    │  POST /approve/:token                  │
   │                    │<─────────────────────────────────────────┤
   │                    │                     │                  │
   │                    │  Update Grade       │                  │
   │                    ├────────────────────>│                  │
   │                    │  (status: approved) │                  │
   │                    │                     │                  │
   │  📧 Grade Ready    │                     │                  │
   │<───────────────────┤                     │                  │
   │                    │                     │                  │

Timeline: 1-24 hours (depends on teacher)
Teacher Involvement: Review & Approve
```

---

## Component Architecture

```
Frontend (Next.js)
├── Pages
│   ├── /dashboard
│   │   └── Main dashboard with AI chat
│   │
│   ├── /apps/classes/[id]
│   │   └── ClassDetailView_New.jsx
│   │       ├── Shows "AI Settings" button
│   │       ├── Shows "Pending AI Grades" button
│   │       └── Lists assignments with submission counts
│   │
│   └── /grading/[token]
│       └── page.jsx (Grade Review Page)
│           ├── Displays grade details
│           ├── Shows student submission
│           ├── Approve/Reject actions
│           └── Redirects after action
│
├── Components
│   ├── GlobalAISettings/
│   │   └── index.jsx
│   │       ├── Enable/disable toggle
│   │       ├── Mode selection (manual/auto)
│   │       ├── AI instructions textarea
│   │       ├── Auto-apply checkbox
│   │       └── Apply to all button
│   │
│   ├── PendingAIGrades/
│   │   └── index.jsx
│   │       ├── Lists pending grades
│   │       ├── Batch approve/reject
│   │       └── Shows AI analysis
│   │
│   └── SubmissionDetailsModal/
│       └── AIGradingButton.jsx
│           └── Trigger AI for individual submission
│
└── API Utilities
    ├── aiGradingPreferences.js
    │   ├── getAIGradingPreferences()
    │   ├── updateAIGradingPreferences()
    │   └── applyAISettingsToAllAssignments()
    │
    ├── aiGradingReview.js
    │   ├── getGradeByToken()
    │   ├── approveGradeByToken()
    │   └── rejectGradeByToken()
    │
    └── aiGrading.js
        ├── triggerAIGrading()
        ├── getPendingAIGrades()
        └── generateRubricSuggestions()
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│ teacher_ai_preferences                                      │
├─────────────────────────────────────────────────────────────┤
│ teacher_id (PK)                                             │
│ ai_grading_enabled (BOOLEAN)                                │
│ default_grading_mode (VARCHAR: 'manual' | 'auto')          │
│ default_ai_instructions (TEXT)                              │
│ auto_apply_to_new_assignments (BOOLEAN)                     │
│ created_at, updated_at                                      │
└─────────────────────────────────────────────────────────────┘
          │
          │ 1:N
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ assignments                                                 │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                     │
│ course_id (FK)                                              │
│ teacher_id (FK)                                             │
│ title, description, max_points, due_date                    │
│ ai_grading_enabled (BOOLEAN) ← Inherits from preferences   │
│ ai_grading_mode (VARCHAR)    ← Inherits from preferences   │
│ ai_instructions (TEXT)       ← Inherits from preferences   │
└─────────────────────────────────────────────────────────────┘
          │
          │ 1:N
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ submissions                                                 │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                     │
│ assignment_id (FK)                                          │
│ student_id (FK)                                             │
│ submission_text, attachments (JSON)                         │
│ status, grade, feedback                                     │
│ submitted_at                                                │
└─────────────────────────────────────────────────────────────┘
          │
          │ 1:1
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ ai_grades                                                   │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                     │
│ submission_id (FK)                                          │
│ assignment_id (FK)                                          │
│ proposed_grade (DECIMAL)                                    │
│ ai_feedback (TEXT)                                          │
│ ai_analysis (JSON)                                          │
│ status ('pending' | 'approved' | 'rejected')                │
│ review_token (VARCHAR, UNIQUE) ← For email links           │
│ token_expires_at (TIMESTAMP)   ← 7 days                    │
│ approved_at, rejected_at                                    │
│ rejection_reason (TEXT)                                     │
│ created_at                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## API Flow Diagrams

### 1. Get Global Preferences

```
Teacher Dashboard
       │
       │ GET /api/ai-grading/preferences
       │ Authorization: Bearer <token>
       ▼
┌──────────────────┐
│   Backend API    │
│   Validates      │
│   Teacher Token  │
└──────────────────┘
       │
       │ SELECT * FROM teacher_ai_preferences
       │ WHERE teacher_id = ?
       ▼
┌──────────────────┐
│    Database      │
│  Returns prefs   │
└──────────────────┘
       │
       │ {
       │   ai_grading_enabled: true,
       │   default_grading_mode: 'manual',
       │   default_ai_instructions: '...',
       │   auto_apply_to_new_assignments: true
       │ }
       ▼
Teacher Dashboard
(Renders GlobalAISettings modal)
```

---

### 2. Apply Settings to All Assignments

```
Teacher Clicks "Apply to All"
       │
       │ POST /api/ai-grading/preferences/apply-to-all
       │ Authorization: Bearer <token>
       ▼
┌──────────────────────────────────────────────────────────┐
│   Backend API                                            │
│   1. Fetch teacher's preferences                         │
│   2. Find all teacher's assignments                      │
│   3. Update each assignment:                             │
│      - ai_grading_enabled = preferences.enabled          │
│      - ai_grading_mode = preferences.mode                │
│      - ai_instructions = preferences.instructions        │
└──────────────────────────────────────────────────────────┘
       │
       │ UPDATE assignments
       │ SET ai_grading_enabled = ?,
       │     ai_grading_mode = ?,
       │     ai_instructions = ?
       │ WHERE teacher_id = ?
       ▼
┌──────────────────┐
│    Database      │
│  25 rows updated │
└──────────────────┘
       │
       │ {
       │   success: true,
       │   appliedCount: 25,
       │   skippedCount: 0,
       │   totalAssignments: 25
       │ }
       ▼
Teacher Dashboard
(Shows success message)
```

---

### 3. Email-Based Grade Review

```
Student Submits → AI Grades → Email Sent
                                    │
                                    │ Teacher receives:
                                    │ "Review Grade for John Doe"
                                    │ [Review Now] ← Click
                                    ▼
                    https://app.com/grading/abc123xyz
                                    │
                                    ▼
                           Grade Review Page
┌────────────────────────────────────────────────────────────┐
│ GET /api/ai-grading/grade/abc123xyz                        │
│                                                            │
│ Backend:                                                   │
│ 1. Validate token (exists, not expired, not used)         │
│ 2. Fetch ai_grade by review_token                          │
│ 3. Join with:                                              │
│    - assignments                                           │
│    - courses                                               │
│    - students                                              │
│    - submissions                                           │
│ 4. Return full context                                     │
└────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        Display Grade Review Page
┌────────────────────────────────────────────────────────────┐
│ Left Column:                    Right Column:              │
│ - Assignment details            - AI-Proposed Grade (85)   │
│ - Student info                  - Percentage (85%)         │
│ - Submission text               - Progress bar             │
│ - Attachments                   - [✅ Approve]             │
│ - AI feedback                   - [❌ Reject]              │
│ - Grade breakdown               - [🏠 Dashboard]           │
└────────────────────────────────────────────────────────────┘
                                    │
                            Teacher decides
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
              [✅ Approve]                    [❌ Reject]
                    │                               │
                    ▼                               ▼
    POST /approve/:token              POST /reject/:token
                    │                  Body: { reason: "..." }
                    │                               │
                    ▼                               ▼
            Update ai_grade                 Update ai_grade
            status = 'approved'             status = 'rejected'
            approved_at = NOW()             rejected_at = NOW()
                    │                       rejection_reason = "..."
                    ▼                               │
            Apply grade to                          ▼
            submission                     Manual grading needed
            (grade, feedback)
                    │
                    ▼
            Email student
            "Grade ready!"
                    │
                    ▼
            Success page
            "Grade approved!"
            → Redirect to dashboard
```

---

## Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│ SECURITY LAYERS                                            │
└────────────────────────────────────────────────────────────┘

1. Authentication
   ├── Global Settings: Requires teacher JWT token
   ├── Review Page: Requires valid review token
   └── API Endpoints: Token validation on every request

2. Authorization
   ├── Teachers only access their own preferences
   ├── Teachers only see grades for their assignments
   └── Students cannot access AI grading settings

3. Token Security
   ├── Review tokens: UUID v4 (cryptographically secure)
   ├── Stored hashed in database
   ├── Expire after 7 days
   ├── One-time use (invalidated after approve/reject)
   └── No PII in token or URL

4. Data Privacy
   ├── HTTPS-only in production
   ├── No sensitive data in email body
   ├── Review tokens are unique and unpredictable
   └── Audit trail for all actions

5. Rate Limiting
   ├── API endpoints rate-limited
   ├── Email sending throttled
   └── Prevent token brute-forcing
```

---

## Performance Considerations

```
┌────────────────────────────────────────────────────────────┐
│ OPTIMIZATION STRATEGIES                                    │
└────────────────────────────────────────────────────────────┘

1. Database Queries
   ├── Index on review_token (for fast lookups)
   ├── Index on teacher_id + status (for pending grades)
   ├── Join optimization (fetch related data in one query)
   └── Cache teacher preferences (Redis, 5 min TTL)

2. Frontend Performance
   ├── Lazy load attachments (only when expanded)
   ├── Optimize images (WebP, lazy loading)
   ├── Code splitting (review page separate bundle)
   └── Loading states (prevent blank screens)

3. AI Grading
   ├── Queue submissions (background processing)
   ├── Batch processing (multiple submissions at once)
   ├── Timeout protection (max 30 seconds per grade)
   └── Retry logic (3 attempts on failure)

4. Email Delivery
   ├── Queue emails (background job)
   ├── Batch sending (avoid rate limits)
   ├── Template caching
   └── Retry failed sends
```

---

## Monitoring & Logging

```
┌────────────────────────────────────────────────────────────┐
│ OBSERVABILITY                                              │
└────────────────────────────────────────────────────────────┘

1. Application Logs
   ├── All API calls logged with request ID
   ├── AI grading process (start, duration, result)
   ├── Email sending (success/failure)
   └── Token validation (valid/invalid/expired)

2. Metrics
   ├── AI grading success rate
   ├── Average approval time (manual mode)
   ├── Email delivery rate
   ├── API response times
   └── Error rates per endpoint

3. Alerts
   ├── High error rate (> 5%)
   ├── Slow API responses (> 2s)
   ├── Email delivery failures (> 10%)
   └── Token validation failures (> 20%)

4. Audit Trail
   ├── All preference updates logged
   ├── All grade approvals/rejections logged
   ├── Teacher ID, timestamp, action
   └── Retention: 1 year
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────┐
│ PRODUCTION DEPLOYMENT                                      │
└────────────────────────────────────────────────────────────┘

Frontend (Vercel)
├── Next.js App
├── /dashboard → Main app
├── /grading/[token] → Review page
└── Environment: NEXT_PUBLIC_API_BASE_URL

                    ▼ HTTPS ▼

Backend API (Your server)
├── Node.js/Express
├── /api/ai-grading/* endpoints
├── Authentication middleware
└── Database connection pool

                    ▼ SQL ▼

Database (PostgreSQL/MySQL)
├── Tables: teacher_ai_preferences, ai_grades, etc.
├── Indexes on frequently queried columns
└── Backups: Daily

                    ▼ Queue ▼

Background Jobs
├── AI grading queue
├── Email sending queue
└── Token cleanup (expired tokens)

                    ▼ SMTP ▼

Email Service
├── SendGrid / Mailgun / AWS SES
├── Templates stored
└── Bounce handling
```

---

**Documentation Date:** December 17, 2025  
**Version:** 2.0.0  
**Status:** ✅ Complete

