# 📧 Invitation System - Complete Flow

## Overview

A complete invitation acceptance system that handles user authentication and class enrollment through shareable invitation links.

## 🔗 URL Structure

Invitation links follow this pattern:
```
https://xytek-classroom-assistant.vercel.app/accept-invitation/{token}
```

Where `{token}` is a unique invitation token generated when creating the invitation.

## 🎯 Complete Flow

### 1. **User Clicks Invitation Link**
```
User receives: https://xytek-classroom-assistant.vercel.app/accept-invitation/3a0f34909ea7ee086a37a92c563be1df
```

### 2. **Automatic Authentication Check**
The system checks if the user is logged in:
- ✅ **Logged In**: Proceed to accept invitation
- ❌ **Not Logged In**: Redirect to login with return URL

### 3. **Login Redirect (if needed)**
```
Redirects to: /login?returnTo=%2Faccept-invitation%2F3a0f34909ea7ee086a37a92c563be1df
```

The login page shows:
- 📘 Info alert: "Please log in to accept the class invitation"
- Standard login form

### 4. **After Login**
User is automatically redirected back to the invitation acceptance page:
```
/accept-invitation/3a0f34909ea7ee086a37a92c563be1df
```

### 5. **Accept Invitation**
- Shows loading spinner
- Calls API: `POST /api/invitations/accept`
- Displays success or error message
- Redirects to the class page

### 6. **Final Redirect**
User lands on the class they just joined:
```
/apps/classes/{classId}
```

## 📁 File Structure

```
src/
├── app/
│   ├── (other)/
│   │   ├── accept-invitation/
│   │   │   └── [token]/
│   │   │       └── page.jsx         # Dynamic invitation page
│   │   └── auth/
│   │       └── login/
│   │           └── components/
│   │               └── LoginForm.jsx # Updated with returnTo handling
│   └── api/
│       └── invitations/
│           └── accept/
│               └── route.js          # API endpoint
```

## 🔌 API Endpoint

### POST `/api/invitations/accept`

**Request:**
```json
{
  "token": "3a0f34909ea7ee086a37a92c563be1df"
}
```

**Headers:**
```
Authorization: Bearer {user_jwt_token}
Content-Type: application/json
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Invitation accepted successfully! You have been enrolled in the course.",
  "classId": "abc123",
  "redirectTo": "/apps/classes/abc123",
  "enrolled": true
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid or expired invitation"
}
```

## 💾 Database Implementation

You need to implement these database operations in `/api/invitations/accept/route.js`:

### 1. **Verify Invitation Token**
```sql
SELECT * FROM invitations 
WHERE token = ? AND status = 'pending'
AND expires_at > NOW()
```

### 2. **Get User ID from JWT**
```javascript
const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
const userId = decoded.userId;
```

### 3. **Check Existing Enrollment**
```sql
SELECT * FROM course_enrollments 
WHERE course_id = ? AND user_id = ?
```

### 4. **Enroll User**
```sql
INSERT INTO course_enrollments 
(course_id, user_id, role, enrolled_at) 
VALUES (?, ?, 'student', NOW())
```

### 5. **Mark Invitation as Accepted**
```sql
UPDATE invitations 
SET status = 'accepted', 
    accepted_at = NOW(), 
    accepted_by = ? 
WHERE token = ?
```

## 🎨 User Experience

### Loading State
```
┌─────────────────────────┐
│  🔄 Accepting           │
│     Invitation...       │
│                         │
│  Please wait while we   │
│  process your          │
│  invitation.           │
└─────────────────────────┘
```

### Success State
```
┌─────────────────────────┐
│  ✅ Invitation          │
│     Accepted!           │
│                         │
│  You have successfully  │
│  joined the class.      │
│  Redirecting you now... │
│                         │
│  🔄 Loading...          │
└─────────────────────────┘
```

### Error State
```
┌─────────────────────────┐
│  ⚠️ Invitation Failed   │
│                         │
│  Invalid or expired     │
│  invitation             │
│                         │
│  [Go to Classes]        │
└─────────────────────────┘
```

### Login Required
```
┌─────────────────────────┐
│  📘 Join Class          │
│                         │
│  Please log in to       │
│  accept the class       │
│  invitation.            │
│                         │
│  [Email Input]          │
│  [Password Input]       │
│  [Log In Button]        │
└─────────────────────────┘
```

## 🔐 Security Features

1. **Authentication Required**: Must be logged in to accept invitation
2. **Token Validation**: Verifies invitation token exists and is valid
3. **Expiration Check**: Can implement token expiration
4. **One-time Use**: Mark invitation as used after acceptance
5. **Authorization Header**: Uses Bearer token for API calls

## 🚀 Generating Invitation Links

Example code to generate invitation links:

```javascript
import crypto from 'crypto';

// Generate unique token
const token = crypto.randomBytes(32).toString('hex');

// Save to database
await db.query(`
  INSERT INTO invitations 
  (token, course_id, created_by, expires_at, status) 
  VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), 'pending')
`, [token, courseId, teacherId]);

// Generate shareable URL
const invitationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/accept-invitation/${token}`;

// Return or send invitation URL
return invitationUrl;
```

## 📧 Email Template Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Class Invitation</title>
</head>
<body>
  <h2>You're Invited to Join a Class!</h2>
  <p>Hello,</p>
  <p>You have been invited to join <strong>{{className}}</strong>.</p>
  <p>
    <a href="{{invitationUrl}}" style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Accept Invitation
    </a>
  </p>
  <p>Or copy and paste this link: {{invitationUrl}}</p>
  <p>This invitation will expire in 7 days.</p>
</body>
</html>
```

## 🔄 State Management

### Invitation States
- `pending` - Invitation sent, not yet accepted
- `accepted` - User has joined the class
- `expired` - Invitation past expiration date
- `revoked` - Invitation manually cancelled

### Database Schema Example
```sql
CREATE TABLE invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  token VARCHAR(64) UNIQUE NOT NULL,
  course_id VARCHAR(255) NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP NULL,
  accepted_by INT NULL,
  status ENUM('pending', 'accepted', 'expired', 'revoked') DEFAULT 'pending',
  INDEX idx_token (token),
  INDEX idx_course_id (course_id),
  INDEX idx_status (status)
);
```

## ✅ Testing Checklist

- [ ] User can access invitation URL
- [ ] Redirects to login if not authenticated
- [ ] Login preserves returnTo parameter
- [ ] After login, returns to invitation page
- [ ] Invitation acceptance works
- [ ] Success message displays correctly
- [ ] Redirects to correct class page
- [ ] Error handling for invalid tokens
- [ ] Error handling for expired invitations
- [ ] Error handling for already enrolled users
- [ ] Mobile responsive design
- [ ] Loading states display properly

## 🐛 Common Issues

### Issue: "Page Not Found" on invitation link
**Solution**: Make sure the dynamic route exists at `src/app/(other)/accept-invitation/[token]/page.jsx`

### Issue: Infinite redirect loop
**Solution**: Check that `returnTo` parameter is properly cleared after login

### Issue: User already enrolled
**Solution**: Check existing enrollment before inserting and show appropriate message

### Issue: Token not found
**Solution**: Verify token is correctly passed from URL to API

## 📝 Next Steps

1. Implement database queries in `/api/invitations/accept/route.js`
2. Add token expiration logic
3. Implement invitation generation endpoint
4. Add email notification system
5. Create teacher interface for sending invitations
6. Add invitation management page (view/revoke invitations)

## 🔗 Related Documentation

- [Classes System](./CLASSES_SYSTEM.md)
- [API Reference](../AUTOMATION_QUICKSTART.md)

