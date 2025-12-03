# 📎 AI Assignment Attachment - Backend Integration Guide

## 🎯 Actual Backend Response Format

Based on the console logs, the backend is using `ongoingAction` format:

### Backend Response When Attachment is Requested

```json
{
  "conversationId": "8aec7977-7fa3-493a-87c6-0cc90befd15a",
  "message": "Would you like to attach a file to this assignment? (yes/no)\n\n📎 You can attach:\n• PDF documents\n• Word documents\n• Images\n• Spreadsheets\n• Any other files\n\nJust say \"yes\" or \"no\".",
  "ongoingAction": {
    "action": "CREATE_ASSIGNMENT",
    "missingParameters": ["attachmentUrl"],
    "collectedParameters": {
      "courseName": "Math 101",
      "title": "Maths Intro",
      "hasAttachment": true
    }
  }
}
```

## ✅ Frontend Detection Logic

The frontend now detects this format:

```javascript
if (response.ongoingAction && 
    response.ongoingAction.action === 'CREATE_ASSIGNMENT' && 
    response.ongoingAction.collectedParameters &&
    response.ongoingAction.collectedParameters.hasAttachment === true) {
  // Show file upload UI
}
```

## 📤 File Upload Flow

### Step 1: User Selects File
```javascript
onChange={(e) => {
  const file = e.target.files[0];
  if (file) {
    setPendingAttachment({ 
      assignmentData: params, 
      file,
      conversationId: response.conversationId 
    });
  }
}}
```

### Step 2: Upload File
```javascript
// Upload to /api/upload
const formData = new FormData();
formData.append('file', file);

const uploadRes = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const uploadData = await uploadRes.json();
const fileUrl = uploadData.url; // Get file URL
```

### Step 3: Send File URL to AI
```javascript
// Send message to AI with file URL
const aiRes = await fetch('/api/ai/message', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: `File uploaded: ${fileUrl}`,
    conversationId: conversationId,
    fileUrl: fileUrl
  })
});

// AI completes the assignment creation
```

## 🔧 Backend Requirements

### 1. File Upload Endpoint

**Endpoint:** `POST /api/upload`

**Request:**
```javascript
// FormData
file: [binary data]
```

**Response:**
```json
{
  "success": true,
  "url": "https://storage.example.com/files/abc123.pdf",
  "fileUrl": "https://storage.example.com/files/abc123.pdf",
  "filename": "homework.pdf",
  "size": 2621440
}
```

### 2. AI Message Handler

**When user sends file URL:**

```javascript
// Request
{
  "message": "File uploaded: https://storage.example.com/files/abc123.pdf",
  "conversationId": "8aec7977-7fa3-493a-87c6-0cc90befd15a",
  "fileUrl": "https://storage.example.com/files/abc123.pdf"
}

// Response - Complete the assignment creation
{
  "conversationId": "8aec7977-7fa3-493a-87c6-0cc90befd15a",
  "message": "✅ Assignment 'Maths Intro' created successfully with attachment!",
  "assignment": {
    "id": "xyz789",
    "courseName": "Math 101",
    "title": "Maths Intro",
    "state": "PUBLISHED",
    "hasAttachment": true,
    "attachmentUrl": "https://storage.example.com/files/abc123.pdf",
    "creationTime": "2025-12-03T10:30:00Z"
  }
}
```

## 📊 Complete Flow Diagram

```
User: "Create assignment for Math 101"
   ↓
AI: "What's the title?"
   ↓
User: "Maths Intro"
   ↓
AI: "Would you like to attach a file? (yes/no)"
   ↓
   Returns:
   {
     ongoingAction: {
       action: "CREATE_ASSIGNMENT",
       collectedParameters: {
         courseName: "Math 101",
         title: "Maths Intro",
         hasAttachment: false  ← Initially false
       }
     }
   }
   ↓
User: "yes"
   ↓
AI: "Please upload the file below"
   Returns:
   {
     ongoingAction: {
       action: "CREATE_ASSIGNMENT",
       collectedParameters: {
         courseName: "Math 101",
         title: "Maths Intro",
         hasAttachment: true  ← Now true!
       }
     }
   }
   ↓
Frontend shows file upload UI ✅
   ↓
User selects file → Clicks "Upload & Create"
   ↓
Frontend uploads to /api/upload
   ↓
Gets file URL back
   ↓
Frontend sends to AI:
   message: "File uploaded: https://..."
   fileUrl: "https://..."
   ↓
AI creates assignment with attachment
   ↓
Returns success message with assignment details
```

## 🎨 UI Display

When `hasAttachment: true` in `collectedParameters`, the chat shows:

```
┌─────────────────────────────────────────────────┐
│ ⚠️ Attachment Required | Upload File            │
├─────────────────────────────────────────────────┤
│                                                 │
│  ℹ️ Please upload a file to attach             │
│                                                 │
│  Assignment Details:                            │
│  • Course: Math 101                             │
│  • Title: Maths Intro                           │
│                                                 │
│  📎 Select File to Attach                       │
│  [Choose File] ← File input appears!            │
│                                                 │
│  Supported: PDF, Word, Excel...                 │
│                                                 │
│  [Upload & Create Assignment]  [Cancel]         │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🔍 Debug Information

From your console logs:

```javascript
[AI DEBUG] API response data: {
  conversationId: "8aec7977-7fa3-493a-87c6-0cc90befd15a",
  message: "Would you like to attach a file to this assignment? (yes/no)...",
  ongoingAction: {
    action: 'CREATE_ASSIGNMENT',
    missingParameters: ['attachmentUrl'],  // ← Waiting for file
    collectedParameters: {
      courseName: "Math 101",
      title: "Maths Intro",
      hasAttachment: true  // ← This triggers file upload UI!
    }
  }
}
```

## ✅ What's Implemented

1. ✅ Frontend detects `ongoingAction` format
2. ✅ Shows file upload UI when `hasAttachment: true`
3. ✅ Allows file selection
4. ✅ Shows file preview (name and size)
5. ✅ Uploads file to `/api/upload`
6. ✅ Sends file URL back to AI
7. ✅ Displays success/error messages
8. ✅ Cancel option available

## 🚀 Testing

1. Start conversation: "Create assignment for Math 101"
2. Provide title: "Maths Intro"
3. When asked about attachment, say: "yes"
4. **File upload UI should now appear!** ✅
5. Select a file (PDF, Word, etc.)
6. Click "Upload & Create Assignment"
7. File uploads → AI creates assignment → Success!

## 📝 Backend TODO

### High Priority
- [ ] Ensure `/api/upload` endpoint exists and works
- [ ] Handle `fileUrl` parameter in AI message handler
- [ ] Create assignment with attachment URL
- [ ] Store attachment data in database

### Medium Priority
- [ ] Add file type validation on backend
- [ ] Add file size limits (recommend 50MB)
- [ ] Implement file storage (S3, Azure, etc.)
- [ ] Generate secure file URLs

### Low Priority
- [ ] Add virus scanning for uploaded files
- [ ] Implement file cleanup for old/unused files
- [ ] Add file compression for large files

## 🎯 Key Points

1. **Detection:** Frontend looks for `ongoingAction.collectedParameters.hasAttachment === true`
2. **Upload:** File is uploaded to `/api/upload` first
3. **Completion:** File URL is sent back to AI to complete assignment creation
4. **Conversation:** Uses `conversationId` to maintain context

## Related Documentation

- [AI_ASSIGNMENT_ATTACHMENTS.md](./AI_ASSIGNMENT_ATTACHMENTS.md) - Full documentation
- [ASSIGNMENT_ATTACHMENT_QUICKSTART.md](./ASSIGNMENT_ATTACHMENT_QUICKSTART.md) - Quick reference

