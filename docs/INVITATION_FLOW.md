# 🎓 Class Invitation Flow Documentation

## Overview

The class invitation system allows teachers to invite students to their classes via unique invitation links. The system handles both authenticated and unauthenticated users gracefully.

## 🔄 Invitation Flow

### For New Users (No Account)

```
1. User clicks invitation link
   └─> /accept-invitation?token=xxx

2. System checks authentication
   └─> User not authenticated ❌

3. Shows "Create Account" screen
   ├─> Option 1: Create Student Account
   │   └─> Redirects to /auth/register?role=student
   │       └─> After registration, auto-processes invitation
   │           └─> Enrolls student in class
   │               └─> Redirects to class page ✅
   │
   └─> Option 2: Already have account? Login
       └─> Redirects to /auth/login
           └─> After login, auto-processes invitation
               └─> Enrolls student in class
                   └─> Redirects to class page ✅
```

### For Existing Users (Have Account)

```
1. User clicks invitation link
   └─> /accept-invitation?token=xxx

2. System checks authentication
   └─> User is authenticated ✅

3. Processes invitation immediately
   └─> Enrolls student in class
       └─> Shows success message
           └─> Redirects to class page ✅
```

## 📁 Files Involved

### 1. Accept Invitation Page
**File:** `src/app/(other)/accept-invitation/page.jsx`

**Key Features:**
- Checks if user is authenticated
- Stores pending invitation token in localStorage
- Shows beautiful UI with options to create account or login
- Auto-processes invitation after auth

### 2. Pending Invitation Hook
**File:** `src/hooks/usePendingInvitation.js`

**Purpose:**
- Checks for pending invitations after login/registration
- Automatically processes the invitation
- Redirects to the class page
- Cleans up localStorage

### 3. API Route
**File:** `src/app/api/invitations/accept/route.js`

**Responsibilities:**
- Verifies user authentication (401 if not authenticated)
- Validates invitation token
- Enrolls user in the class
- Marks invitation as accepted
- Returns success response with class ID

### 4. Login/Register Pages
**Files:** 
- `src/app/(other)/auth/login/page.jsx`
- `src/app/(other)/auth/register/page.jsx`

**Integration:**
- Both pages use `usePendingInvitation()` hook
- Automatically processes pending invitations after successful auth

## 🎨 UI States

### 1. Loading State
```
┌─────────────────────┐
│   🔄 Spinner        │
│                     │
│ Accepting           │
│ Invitation...       │
│                     │
│ Please wait while   │
│ we process your     │
│ invitation.         │
└─────────────────────┘
```

### 2. Need Authentication State
```
┌─────────────────────┐
│   👤 User Icon      │
│                     │
│ Welcome to          │
│ the Class!          │
│                     │
│ To join this class, │
│ you need to create  │
│ a student account   │
│ first.              │
│                     │
│ ┌─────────────────┐ │
│ │ Create Account  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Already have    │ │
│ │ account? Login  │ │
│ └─────────────────┘ │
│                     │
│ 🛡️ Your invitation │
│ will be applied     │
│ automatically       │
└─────────────────────┘
```

### 3. Success State
```
┌─────────────────────┐
│   ✅ Check Icon     │
│                     │
│ Invitation          │
│ Accepted!           │
│                     │
│ You have            │
│ successfully joined │
│ the class.          │
│                     │
│ Redirecting...      │
│   🔄 Spinner        │
└─────────────────────┘
```

### 4. Error State
```
┌─────────────────────┐
│   ⚠️ Warning Icon   │
│                     │
│ Invitation Failed   │
│                     │
│ [Error message]     │
│                     │
│ ┌─────────────────┐ │
│ │ Create Account  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Go to Classes   │ │
│ └─────────────────┘ │
└─────────────────────┘
```

## 🔐 Security Features

1. **Token-based invitations**: Each invitation has a unique token
2. **Authentication required**: API checks for valid session
3. **Single-use tokens**: Tokens should be marked as used after acceptance
4. **Expiration**: Tokens should have expiration dates
5. **Role verification**: Ensures only students can accept student invitations

## 💾 LocalStorage Management

### Stored Data
- `pendingInvitationToken`: Temporarily stores invitation token

### Cleanup
- Token is removed after successful processing
- Token is removed if processing fails (prevents infinite loops)
- Token persists across page reloads until processed

## 🔧 Implementation Guide

### Step 1: Generate Invitation Link
```javascript
// In your class component
const generateInvitationLink = async (classId) => {
  const response = await fetch('/api/invitations/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ classId, role: 'student' })
  });
  
  const { token: invitationToken } = await response.json();
  const invitationLink = `${window.location.origin}/accept-invitation?token=${invitationToken}`;
  
  return invitationLink;
};
```

### Step 2: Database Schema (Example)
```javascript
// Invitations Collection/Table
{
  id: string,
  token: string (unique, indexed),
  classId: string,
  courseId: string,
  role: string (default: 'student'),
  createdBy: string (teacher userId),
  status: string (pending | accepted | expired),
  expiresAt: Date,
  acceptedAt: Date (nullable),
  acceptedBy: string (nullable, student userId),
  createdAt: Date
}

// Enrollments Collection/Table
{
  id: string,
  courseId: string,
  userId: string,
  role: string,
  enrolledAt: Date,
  invitationToken: string (optional, for tracking)
}
```

### Step 3: Complete API Implementation
```javascript
// src/app/api/invitations/accept/route.js
export async function POST(request) {
  const session = await getServerSession(options);
  
  if (!session) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  const { token } = await request.json();

  // 1. Find invitation
  const invitation = await db.invitations.findOne({
    token,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });

  if (!invitation) {
    return NextResponse.json(
      { message: 'Invalid or expired invitation' },
      { status: 404 }
    );
  }

  // 2. Check if already enrolled
  const existingEnrollment = await db.enrollments.findOne({
    courseId: invitation.courseId,
    userId: session.user.id
  });

  if (existingEnrollment) {
    return NextResponse.json(
      { message: 'You are already enrolled in this class' },
      { status: 400 }
    );
  }

  // 3. Create enrollment
  await db.enrollments.create({
    courseId: invitation.courseId,
    userId: session.user.id,
    role: invitation.role,
    enrolledAt: new Date(),
    invitationToken: token
  });

  // 4. Mark invitation as accepted
  await db.invitations.update(
    { token },
    {
      status: 'accepted',
      acceptedAt: new Date(),
      acceptedBy: session.user.id
    }
  );

  // 5. Return success
  return NextResponse.json({
    success: true,
    message: 'Welcome to the class!',
    classId: invitation.courseId,
    redirectTo: `/apps/classes/${invitation.courseId}`
  });
}
```

## 🧪 Testing Checklist

- [ ] New user with no account can create account via invitation
- [ ] Existing user can login and accept invitation
- [ ] Invitation is automatically processed after login/registration
- [ ] User is redirected to correct class page
- [ ] Invalid/expired tokens show appropriate error
- [ ] Already enrolled users see appropriate message
- [ ] Pending invitation survives page reloads
- [ ] Pending invitation is cleared after processing
- [ ] 401 errors trigger authentication flow
- [ ] UI shows correct states (loading, auth needed, success, error)

## 🎯 User Experience Tips

1. **Clear messaging**: Explain why account creation is needed
2. **Visual feedback**: Show spinners and progress indicators
3. **Automatic processing**: No extra clicks after auth
4. **Error handling**: Provide helpful error messages
5. **Mobile responsive**: Works on all screen sizes

## 🚀 Future Enhancements

- [ ] Email invitation system
- [ ] Invitation expiration countdown
- [ ] Batch invitations (multiple students)
- [ ] Invitation analytics (who clicked, who joined)
- [ ] Custom invitation messages
- [ ] Role-based invitations (teacher, TA, student)
- [ ] One-time use codes instead of links

## 📝 Notes

- The invitation token should be generated using a secure random generator
- Tokens should be long enough to prevent brute force (at least 32 characters)
- Consider implementing rate limiting on the accept endpoint
- Store invitation activity for audit purposes
- Send email notifications when invitations are accepted

## 🤝 Support

If you encounter issues:
1. Check browser console for errors
2. Verify API endpoints are working
3. Check authentication token is valid
4. Ensure database connections are working
5. Review server logs for detailed errors

