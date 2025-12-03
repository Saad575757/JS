# 🔐 Role-Based Access Control (RBAC) - Classes System

## Overview

The classes system now includes role-based permissions to ensure students and teachers have appropriate access levels.

## 👥 User Roles

### 1. **Teacher**
- Full control over their courses
- Can create, edit, and delete courses
- Can post announcements
- Can create and delete assignments
- Can view all enrolled students
- See action buttons and controls

### 2. **Student**  
- Read-only access to enrolled courses
- Can view course details
- Can view announcements (no create/delete)
- Can view assignments (no create/delete)
- Can see other students in the class
- **Cannot** see create/delete buttons

## 🎯 Permission Matrix

| Feature | Teacher | Student |
|---------|---------|---------|
| **Courses** |
| View courses | ✅ | ✅ |
| Create course | ✅ | ❌ |
| Delete course | ✅ | ❌ |
| **Announcements** |
| View announcements | ✅ | ✅ |
| Create announcement | ✅ | ❌ |
| Delete announcement | ✅ | ❌ |
| **Assignments** |
| View assignments | ✅ | ✅ |
| Create assignment | ✅ | ❌ |
| Delete assignment | ✅ | ❌ |
| **Students** |
| View students | ✅ | ✅ |
| Invite students | ✅ | ❌ |

## 💻 Implementation

### Role Detection

The system checks the user's role from localStorage:

```javascript
const [isTeacher, setIsTeacher] = useState(false);

useEffect(() => {
  const userRole = localStorage.getItem('role');
  setIsTeacher(userRole === 'teacher');
}, []);
```

### Conditional Rendering - Create Buttons

Teachers see create buttons, students don't:

```javascript
{isTeacher && (
  <Button variant="primary" onClick={() => setShowAnnouncementModal(true)}>
    <IconifyIcon icon="ri:add-line" className="me-2" />
    Post Announcement
  </Button>
)}
```

### Conditional Rendering - Delete Buttons

Teachers see delete buttons on announcements and assignments:

```javascript
{isTeacher && (
  <Button 
    variant="link" 
    className="text-danger p-0"
    onClick={() => handleDeleteAnnouncement(announcement.id)}
  >
    <IconifyIcon icon="ri:delete-bin-line" />
  </Button>
)}
```

### Empty State Messages

Different messages for teachers vs students:

```javascript
<p className="text-muted">
  {isTeacher 
    ? 'Create your first announcement to keep students informed' 
    : 'Your teacher hasn\'t posted any announcements yet'}
</p>
```

## 🎨 UI Differences

### Teacher View

```
┌─────────────────────────────────────────┐
│  📢 Announcements    [+ Post Announcement] │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  Teacher John                  [🗑]│  │
│  │  Dec 3, 2025                       │  │
│  │  Welcome to the class!             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Student View

```
┌─────────────────────────────────────────┐
│  📢 Announcements                        │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  Teacher John                      │  │
│  │  Dec 3, 2025                       │  │
│  │  Welcome to the class!             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 📁 Files Updated

### ClassDetailView_New.jsx

Added role checks for:
- ✅ Create announcement button visibility
- ✅ Delete announcement button visibility
- ✅ Create assignment button visibility  
- ✅ Delete assignment button visibility
- ✅ Empty state messages
- ✅ Actions column in assignment table

### ClassListView_New.jsx

Teachers see:
- ✅ Floating action button (+ Create Course)
- ✅ Delete course option in dropdown
- ✅ All course management controls

Students see:
- ✅ Course grid (read-only)
- ❌ No create button
- ❌ No delete options

## 🔐 Security Notes

### Frontend Protection

The current implementation uses **client-side role checks** which are sufficient for UI display but should be complemented with backend validation.

### Backend Protection Required

**⚠️ IMPORTANT**: Always validate permissions on the backend:

```javascript
// API Example: POST /api/announcements
export async function POST(request) {
  const token = request.headers.get('authorization');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // Check if user is a teacher
  if (decoded.role !== 'teacher') {
    return NextResponse.json(
      { message: 'Unauthorized. Only teachers can create announcements.' },
      { status: 403 }
    );
  }
  
  // Proceed with creating announcement...
}
```

### Role Storage

User roles are stored in localStorage after login:

```javascript
// In LoginForm.jsx after successful login
saveAuthData({
  token: response.token,
  user: response.user,
  role: response.user.role, // 'teacher' or 'student'
  ...
});
```

## 🧪 Testing Checklist

### As Teacher
- [ ] Can see "Create Course" button
- [ ] Can see "Post Announcement" button
- [ ] Can see "Create Assignment" button
- [ ] Can see delete buttons on announcements
- [ ] Can see delete buttons on assignments
- [ ] Empty states show "Create your first..."

### As Student
- [ ] Cannot see "Create Course" button
- [ ] Cannot see "Post Announcement" button
- [ ] Cannot see "Create Assignment" button
- [ ] Cannot see delete buttons
- [ ] Empty states show "Teacher hasn't posted..."
- [ ] Can still view all content

## 🚀 Future Enhancements

### Additional Roles
- **Admin**: Full system control
- **TA (Teaching Assistant)**: Limited teacher permissions
- **Guest**: Read-only access to public courses

### Granular Permissions
- Custom permission sets per role
- Course-specific permissions
- Time-based permissions (e.g., can't submit after deadline)

### Permission Middleware
```javascript
// Example: withRole.js
export function withRole(allowedRoles) {
  return (Component) => {
    return (props) => {
      const userRole = localStorage.getItem('role');
      
      if (!allowedRoles.includes(userRole)) {
        return <UnauthorizedPage />;
      }
      
      return <Component {...props} />;
    };
  };
}

// Usage:
export default withRole(['teacher'])(CreateAssignmentPage);
```

## 📊 User Flow Examples

### Teacher Creates Announcement

1. Teacher logs in (role: 'teacher')
2. Opens course detail page
3. Sees "Post Announcement" button
4. Clicks button → Modal opens
5. Fills form and submits
6. Backend validates teacher role
7. Announcement created and displayed
8. Teacher can delete own announcements

### Student Views Announcement

1. Student logs in (role: 'student')
2. Opens course detail page
3. Does NOT see "Post Announcement" button
4. Views existing announcements
5. Cannot see delete buttons
6. Can read all content

## 🔗 Related Documentation

- [Classes System](./CLASSES_SYSTEM.md)
- [Invitation System](./INVITATION_SYSTEM.md)
- [API Reference](../AUTOMATION_QUICKSTART.md)

