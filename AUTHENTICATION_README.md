# Authentication System Documentation

## Overview

This application uses the Xytek API for authentication, supporting three user roles:
- **Student**: Regular student access
- **Teacher**: Instructor/educator access
- **Super Admin**: Full administrative access

## API Endpoints

### Base URL
```
https://class.xytek.ai/api
```

### 1. Sign Up (Registration)
**Endpoint:** `POST /auth/signup`

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Student",
  "role": "student" // or "teacher" or "superadmin"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "name": "John Student",
    "role": "student",
    "picture": null
  },
  "message": "User registered successfully"
}
```

### 2. Login
**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "teacher@example.com",
    "name": "Jane Teacher",
    "role": "teacher",
    "picture": null
  },
  "message": "Login successful"
}
```

### 3. Get Current User
**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "teacher@example.com",
    "name": "Jane Teacher",
    "role": "teacher",
    "picture": null
  }
}
```

## File Structure

```
src/
├── lib/
│   ├── api/
│   │   └── auth.js              # API utility functions
│   └── auth/
│       └── tokenManager.js      # Token and user data management
├── hooks/
│   └── useAuth.js               # Authentication hooks
├── components/
│   └── ProtectedRoute.jsx       # Route protection component
└── app/
    └── (other)/
        └── auth/
            ├── login/
            │   ├── page.jsx
            │   └── components/
            │       └── LoginForm.jsx
            ├── register/
            │   ├── page.jsx
            │   └── components/
            │       └── RegisterForm.jsx
            └── logout/
                ├── page.jsx
                └── LogoutHandler.jsx
```

## Usage Examples

### 1. Using the Login Form
Navigate to `/auth/login` and enter credentials:
- Email
- Password

After successful login, the JWT token is automatically saved to localStorage and the user is redirected based on their role.

### 2. Using the Registration Form
Navigate to `/auth/register` and fill in:
- Full Name
- Email Address
- Password
- Confirm Password
- Role Selection (Student, Teacher, or Super Admin)
- Accept Terms and Conditions

### 3. Making Authenticated API Requests

```javascript
import { authenticatedRequest } from '@/lib/api/auth';

// Example: Get some protected data
const data = await authenticatedRequest('/some-endpoint', {
  method: 'GET'
});
```

### 4. Using the useAuth Hook

```javascript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 5. Protecting Routes

```javascript
import ProtectedRoute from '@/components/ProtectedRoute';

function TeacherDashboard() {
  return (
    <ProtectedRoute requiredRole="teacher">
      <div>Teacher Dashboard Content</div>
    </ProtectedRoute>
  );
}
```

## Token Storage

The authentication system stores two items in localStorage:
- `auth_token`: The JWT token from the API
- `user_data`: JSON object containing user information

These are automatically managed by the `tokenManager` utility.

## Logout

To logout a user:
1. Navigate to `/auth/logout`
2. Or call the `logout()` function from `useAuth` hook
3. Or call `clearAuthData()` from `tokenManager`

All methods will:
- Clear the JWT token from localStorage
- Clear user data from localStorage
- Redirect to the login page

## Role-Based Access

The system supports three roles with visual indicators:
- **Student** (Green badge)
- **Teacher** (Blue badge)
- **Super Admin** (Red badge)

The role badge appears in the profile dropdown in the top navigation bar.

## Security Notes

1. **Token Expiration**: Tokens expire after 24 hours
2. **Automatic Redirect**: If a token is invalid or expired, users are automatically redirected to login
3. **Protected Routes**: Use the `ProtectedRoute` component to restrict access to authenticated users
4. **Role Validation**: Use `requiredRole` prop in `ProtectedRoute` to restrict by role

## Testing the Authentication Flow

1. **Sign Up**:
   - Navigate to `/auth/register`
   - Fill in all fields
   - Select a role
   - Submit the form
   - Check console for success message
   - Verify redirect to dashboard

2. **Login**:
   - Navigate to `/auth/login`
   - Enter email and password
   - Submit the form
   - Check console for success message
   - Verify redirect to dashboard

3. **Verify Session**:
   - Check localStorage for `auth_token` and `user_data`
   - Check profile dropdown shows correct user info and role badge

4. **Logout**:
   - Click logout in profile dropdown
   - Verify redirect to login page
   - Check that localStorage is cleared

## Troubleshooting

### Issue: Login/Signup fails
- Check network tab for API errors
- Verify Xytek API is accessible
- Check console for error messages

### Issue: Token not saving
- Check browser localStorage settings
- Ensure cookies are enabled
- Check for browser extensions blocking localStorage

### Issue: Redirect not working
- Check router is properly initialized
- Verify role-based redirect logic
- Check console for navigation errors

## API Integration Examples

### Manual Signup Test
```bash
curl -X POST https://class.xytek.ai/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "student"
  }'
```

### Manual Login Test
```bash
curl -X POST https://class.xytek.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Manual Get User Test
```bash
curl -X GET https://class.xytek.ai/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

