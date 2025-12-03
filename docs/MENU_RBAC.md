# 🔐 Menu Role-Based Access Control

## Changes Made

### 1. **Renamed "Email Automation" → "Workflow Automation"**

All references updated:
- ✅ Sidebar menu label
- ✅ Page title
- ✅ Card header title

### 2. **Hide Workflow Automation from Students**

Students can no longer see or access the Workflow Automation section.

## Implementation Details

### Menu Items (`menu-items.js`)

Added `requiredRole` property to menu items:

```javascript
{
  key: 'apps-automation',
  icon: 'ri:robot-2-line',
  label: 'Workflow Automation',
  url: '/apps/automation',
  requiredRole: 'teacher' // Only teachers can see this
}
```

### Menu Helper (`helpers/menu.js`)

Updated `getMenuItems()` to filter based on user role:

```javascript
import { getUserRole } from '@/lib/auth/tokenManager';

export const getMenuItems = () => {
  const userRole = getUserRole();
  
  // Filter menu items based on user role
  const filteredItems = MENU_ITEMS.filter(item => {
    // If item has requiredRole, check if user has that role
    if (item.requiredRole) {
      return userRole === item.requiredRole;
    }
    // If no requiredRole specified, show to everyone
    return true;
  });
  
  return filteredItems;
};
```

## Menu Visibility Matrix

| Menu Item | Teacher | Student |
|-----------|---------|---------|
| Dashboard | ✅ | ✅ |
| Classes | ✅ | ✅ |
| Archived Classes | ✅ | ✅ |
| **Workflow Automation** | ✅ | ❌ |

## How It Works

### 1. User Logs In
```javascript
// User data stored in localStorage
{
  "email": "user@example.com",
  "role": "student" // or "teacher"
}
```

### 2. Menu Loads
```javascript
// Menu helper checks role
const userRole = getUserRole(); // "student" or "teacher"
```

### 3. Menu Filters
```javascript
// Items with requiredRole are filtered
if (item.requiredRole === 'teacher' && userRole === 'student') {
  // Item is hidden
}
```

### 4. Navigation Renders
- Teachers see: Dashboard, Classes, Archived Classes, **Workflow Automation**
- Students see: Dashboard, Classes, Archived Classes

## Adding More Role-Based Menu Items

To add role restrictions to other menu items:

```javascript
{
  key: 'some-feature',
  icon: 'ri:icon-name',
  label: 'Feature Name',
  url: '/some/url',
  requiredRole: 'teacher' // Add this property
}
```

Supported roles:
- `'teacher'` - Only teachers can see
- `'student'` - Only students can see
- `'admin'` - Only admins can see (if implemented)
- No `requiredRole` - Everyone can see

## Testing

### As Teacher
1. Log in as teacher
2. Check sidebar
3. Should see "Workflow Automation" menu item
4. Should be able to access `/apps/automation`

### As Student
1. Log in as student
2. Check sidebar
3. Should NOT see "Workflow Automation" menu item
4. If accessing `/apps/automation` directly, should implement redirect

## Security Note

⚠️ **Frontend filtering is NOT enough for security!**

The menu hiding is for **UX only**. You must also:

### 1. Add Route Protection

Create a middleware or protected route wrapper:

```javascript
// app/(admin)/apps/automation/page.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/auth/tokenManager';

export default function AutomationPage() {
  const router = useRouter();
  
  useEffect(() => {
    const userRole = getUserRole();
    if (userRole !== 'teacher') {
      router.push('/dashboard'); // Redirect non-teachers
    }
  }, [router]);
  
  // Rest of component...
}
```

### 2. Add Backend Validation

```javascript
// API Route: /api/automation/*
export async function GET(request) {
  const token = request.headers.get('authorization');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  if (decoded.role !== 'teacher') {
    return NextResponse.json(
      { message: 'Unauthorized. Teacher access only.' },
      { status: 403 }
    );
  }
  
  // Process request...
}
```

## File Changes

### Modified Files
- ✅ `src/assets/data/menu-items.js` - Added `requiredRole: 'teacher'`
- ✅ `src/helpers/menu.js` - Added role filtering logic
- ✅ `src/app/(admin)/apps/automation/page.jsx` - Updated title to "Workflow Automation"

## Future Enhancements

### Multi-Role Support
```javascript
{
  key: 'some-feature',
  allowedRoles: ['teacher', 'admin'] // Allow multiple roles
}
```

### Permission-Based Access
```javascript
{
  key: 'some-feature',
  requiredPermissions: ['can_manage_workflows', 'can_view_analytics']
}
```

### Dynamic Menu Loading
```javascript
// Load menu items from database based on user permissions
const menuItems = await fetchMenuItemsForUser(userId);
```

## Related Documentation

- [RBAC System](./RBAC_SYSTEM.md)
- [Classes System](./CLASSES_SYSTEM.md)
- [Invitation System](./INVITATION_SYSTEM.md)

