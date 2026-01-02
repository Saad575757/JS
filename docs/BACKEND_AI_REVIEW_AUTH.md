# Backend API Requirements - AI Grade Review 🔐

## Issue Encountered

The grade review endpoints are returning `{"success":false,"error":"No token provided"}` because they're expecting a JWT Bearer token in the Authorization header.

## Expected Behavior

The review endpoints should work **with or without** a JWT token because:

1. **Email Links**: Teachers receive review links via email and should be able to click them without logging in
2. **Review Token**: The review token in the URL itself should be sufficient authentication
3. **Optional Auth**: If the teacher is logged in, we send the JWT token as well (but it's optional)

---

## Backend Implementation Required

### Option 1: Review Token is Sufficient (Recommended)

The backend should accept the review token as authentication:

```javascript
// Backend middleware
function authenticateReviewToken(req, res, next) {
  const reviewToken = req.params.token;
  
  if (!reviewToken) {
    return res.status(401).json({ success: false, error: 'No review token provided' });
  }
  
  // Validate review token
  const grade = await db.query(
    'SELECT * FROM ai_grades WHERE review_token = ? AND token_expires_at > NOW() AND status = "pending"',
    [reviewToken]
  );
  
  if (!grade) {
    return res.status(401).json({ success: false, error: 'Invalid or expired review token' });
  }
  
  // Attach grade to request
  req.grade = grade;
  next();
}
```

### Option 2: Support Both Auth Methods

Accept either JWT token OR review token:

```javascript
function authenticateGradeReview(req, res, next) {
  const reviewToken = req.params.token;
  const authHeader = req.headers.authorization;
  
  // Try JWT token first (if user is logged in)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwtToken = authHeader.substring(7);
    try {
      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
      req.user = decoded;
      // Continue to validate review token
    } catch (err) {
      // JWT invalid, fall back to review token only
    }
  }
  
  // Validate review token (required)
  const grade = await validateReviewToken(reviewToken);
  
  if (!grade) {
    return res.status(401).json({ success: false, error: 'Invalid review token' });
  }
  
  // Optionally verify teacher owns this grade
  if (req.user && grade.teacher_id !== req.user.id) {
    return res.status(403).json({ success: false, error: 'Not authorized for this grade' });
  }
  
  req.grade = grade;
  next();
}
```

---

## API Endpoints to Update

### 1. GET /api/ai-grading/grade/:token

**Current:** Requires JWT Bearer token ❌  
**Should be:** Review token in URL is sufficient ✅

```javascript
router.get('/grade/:token', authenticateReviewToken, async (req, res) => {
  try {
    const grade = req.grade; // From middleware
    
    // Fetch related data
    const assignment = await getAssignment(grade.assignment_id);
    const course = await getCourse(assignment.course_id);
    const student = await getStudent(grade.student_id);
    const submission = await getSubmission(grade.submission_id);
    
    res.json({
      success: true,
      grade: {
        ...grade,
        assignment,
        course,
        student,
        submission
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
```

---

### 2. POST /api/ai-grading/approve/:token

**Current:** Requires JWT Bearer token ❌  
**Should be:** Review token in URL is sufficient ✅

```javascript
router.post('/approve/:token', authenticateReviewToken, async (req, res) => {
  try {
    const grade = req.grade;
    
    // Update grade status
    await db.query(
      'UPDATE ai_grades SET status = "approved", approved_at = NOW() WHERE id = ?',
      [grade.id]
    );
    
    // Apply grade to submission
    await db.query(
      'UPDATE submissions SET grade = ?, feedback = ?, status = "graded" WHERE id = ?',
      [grade.proposed_grade, grade.ai_feedback, grade.submission_id]
    );
    
    // Send email to student
    await sendGradeNotificationEmail(grade.student_id, grade);
    
    // Invalidate token (one-time use)
    await db.query(
      'UPDATE ai_grades SET review_token = NULL WHERE id = ?',
      [grade.id]
    );
    
    res.json({
      success: true,
      message: 'Grade approved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
```

---

### 3. POST /api/ai-grading/reject/:token

**Current:** Requires JWT Bearer token ❌  
**Should be:** Review token in URL is sufficient ✅

```javascript
router.post('/reject/:token', authenticateReviewToken, async (req, res) => {
  try {
    const grade = req.grade;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Rejection reason required' });
    }
    
    // Update grade status
    await db.query(
      'UPDATE ai_grades SET status = "rejected", rejected_at = NOW(), rejection_reason = ? WHERE id = ?',
      [reason, grade.id]
    );
    
    // Invalidate token (one-time use)
    await db.query(
      'UPDATE ai_grades SET review_token = NULL WHERE id = ?',
      [grade.id]
    );
    
    res.json({
      success: true,
      message: 'Grade rejected successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
```

---

## Security Considerations

### Review Token Requirements:
✅ **Unique**: UUID v4 (128-bit, cryptographically secure)  
✅ **One-time use**: Invalidated after approve/reject  
✅ **Expiration**: 7 days from generation  
✅ **Status check**: Only work for pending grades  
✅ **HTTPS only**: Never send over HTTP  

### Additional Security:
✅ **Rate limiting**: Prevent token brute-forcing  
✅ **Audit logging**: Log all approve/reject actions  
✅ **Teacher verification**: Optionally verify teacher_id if JWT present  
✅ **Token cleanup**: Periodically delete expired tokens  

---

## Frontend Changes Made

I've updated `src/lib/api/aiGradingReview.js` to:

1. ✅ **Try to get JWT token** from localStorage (if user is logged in)
2. ✅ **Include Authorization header** if JWT token exists
3. ✅ **Work without JWT** if user is not logged in
4. ✅ **Log authentication method** for debugging

This allows the review page to work in both scenarios:
- **Logged-in teacher**: Sends both JWT + review token
- **Email link (not logged in)**: Sends only review token

---

## Testing

### Test Case 1: Logged-in Teacher
```bash
# Teacher is logged in, has JWT token
curl -X GET https://class.xytek.ai/api/ai-grading/grade/REVIEW_TOKEN \
  -H "Authorization: Bearer JWT_TOKEN"

# Expected: Success (both tokens valid)
```

### Test Case 2: Email Link (Not Logged In)
```bash
# Teacher clicks email link, no JWT token
curl -X GET https://class.xytek.ai/api/ai-grading/grade/REVIEW_TOKEN

# Expected: Success (review token sufficient)
```

### Test Case 3: Invalid Review Token
```bash
curl -X GET https://class.xytek.ai/api/ai-grading/grade/INVALID_TOKEN

# Expected: 401 Unauthorized
```

### Test Case 4: Expired Review Token
```bash
# Review token is older than 7 days
curl -X GET https://class.xytek.ai/api/ai-grading/grade/EXPIRED_TOKEN

# Expected: 401 Unauthorized, "Token expired"
```

### Test Case 5: Already Used Token
```bash
# Token was already used for approve/reject
curl -X GET https://class.xytek.ai/api/ai-grading/grade/USED_TOKEN

# Expected: 401 Unauthorized, "Token already used"
```

---

## Database Schema for Review Tokens

```sql
CREATE TABLE ai_grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT NOT NULL,
  assignment_id INT NOT NULL,
  teacher_id INT NOT NULL,
  student_id INT NOT NULL,
  proposed_grade DECIMAL(5,2),
  ai_feedback TEXT,
  ai_analysis JSON,
  
  -- Review token fields
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  review_token VARCHAR(255) UNIQUE,  -- UUID v4
  token_expires_at TIMESTAMP,         -- NOW() + 7 days
  
  -- Action timestamps
  approved_at TIMESTAMP NULL,
  rejected_at TIMESTAMP NULL,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_review_token (review_token),
  INDEX idx_status (status),
  INDEX idx_teacher_status (teacher_id, status)
);
```

---

## Token Generation Example

```javascript
const crypto = require('crypto');

function generateReviewToken() {
  return crypto.randomUUID(); // UUID v4
}

async function createAIGrade(submissionId, assignmentId, teacherId, studentId, proposedGrade, aiFeedback) {
  const reviewToken = generateReviewToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const result = await db.query(
    `INSERT INTO ai_grades 
    (submission_id, assignment_id, teacher_id, student_id, proposed_grade, ai_feedback, review_token, token_expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [submissionId, assignmentId, teacherId, studentId, proposedGrade, aiFeedback, reviewToken, expiresAt]
  );
  
  return {
    gradeId: result.insertId,
    reviewToken,
    reviewUrl: `https://class.xytek.ai/grading/${reviewToken}`
  };
}
```

---

## Summary

**Problem:** Backend requires JWT token, but email links should work without login  
**Solution:** Review token in URL should be sufficient authentication  
**Frontend:** Updated to send JWT token if available (but optional)  
**Backend:** Should accept review token as primary authentication  

**Action Required:** Update backend API to accept review token without requiring JWT Bearer token.

---

**Date:** December 17, 2025  
**Status:** Frontend Updated, Backend Changes Required  
**Priority:** High (blocks email-based review feature)

