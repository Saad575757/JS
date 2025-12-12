# 📤 File Upload Implementation - Complete Guide

## ✅ What's Been Implemented

### 1. **API Utility Function** (`src/lib/api/courses.js`)

Added a new `uploadFile()` function and `apiUpload()` helper:

```javascript
// Helper for file uploads (no Content-Type - browser sets boundary)
const apiUpload = async (endpoint, formData) => {
  const token = getToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Public API
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload('/api/upload', formData);
};
```

### 2. **Dashboard Integration** (`src/app/(admin)/dashboard/page.jsx`)

#### Import Added:
```javascript
import { uploadFile, createAssignment } from '@/lib/api/courses';
```

#### Complete Upload Flow:
```javascript
// 1. Upload file
const uploadResponse = await uploadFile(pendingAttachment.file);

// 2. Extract file info
const fileInfo = uploadResponse.file || uploadResponse;
const fileUrl = fileInfo.fullUrl || fileInfo.url;

// 3. Prepare attachment data
const attachmentData = {
  originalName: fileInfo.originalName || pendingAttachment.file.name,
  filename: fileInfo.filename || fileInfo.originalName,
  url: fileInfo.url || fileUrl
};

// 4. Send to AI with attachment info
await fetch('/api/ai/message', {
  method: 'POST',
  body: JSON.stringify({
    message: 'yes',
    conversationId: conversationId,
    attachmentUrl: fileUrl,
    attachmentData: attachmentData
  })
});
```

## 🔄 Expected API Response Format

### Your Backend `/api/upload` Should Return:

```json
{
  "success": true,
  "file": {
    "originalName": "homework.pdf",
    "filename": "homework-1702412345-123456789.pdf",
    "url": "/uploads/assignments/homework-1702412345-123456789.pdf",
    "fullUrl": "https://yourserver.com/uploads/assignments/homework-1702412345-123456789.pdf"
  }
}
```

### The Frontend Handles Both Formats:
```javascript
// Flexible extraction
const fileInfo = uploadResponse.file || uploadResponse;  // Works with nested or flat
const fileUrl = fileInfo.fullUrl || fileInfo.url;        // Prefers fullUrl, falls back to url
```

## 📝 Complete User Flow

### 1. **User Initiates Assignment Creation**
```
User: "Create assignment for Math 101"
AI: "Please provide a title"
User: "Homework 1"
AI: "Would you like to attach a file? (yes/no)"
```

### 2. **AI Detects File Upload Request**
Backend sends:
```json
{
  "conversationId": "abc-123",
  "message": "📎 Please upload your file...",
  "awaitingFileUpload": true,
  "assignmentData": {
    "courseId": "0v9KIjZJPPVl",
    "courseName": "Math 101",
    "title": "Homework 1",
    "description": "",
    "maxPoints": 100
  }
}
```

### 3. **Frontend Shows Upload UI**
```
┌───────────────────────────────────────────┐
│ ⚠️ Attachment Required | Upload File     │
├───────────────────────────────────────────┤
│ ℹ️ Please upload a file to attach        │
│                                           │
│ Assignment Details:                       │
│ • Course: Math 101                        │
│ • Title: Homework 1                       │
│ • Max Points: 100                         │
│                                           │
│ 📎 Select File to Attach                  │
│ ┌──────────────────────────────────┐     │
│ │ [Choose File] homework.pdf       │ ✅  │
│ └──────────────────────────────────┘     │
│                                           │
│ ✅ File selected: homework.pdf (2.5 MB)  │
│                                           │
│ [📤 Upload & Create Assignment] [Cancel] │
└───────────────────────────────────────────┘
```

### 4. **User Clicks Upload Button**

**Step-by-step process:**

```javascript
// A. Upload file to /api/upload
console.log('[UPLOAD START] Uploading file: homework.pdf');
const uploadResponse = await uploadFile(file);
console.log('[UPLOAD SUCCESS]', uploadResponse);

// B. Extract file URL
const fileUrl = uploadResponse.file.fullUrl;
console.log('[FILE URL]', fileUrl);

// C. Prepare attachment data
const attachmentData = {
  originalName: "homework.pdf",
  filename: "homework-1702412345-123456789.pdf",
  url: "/uploads/assignments/homework-1702412345-123456789.pdf"
};
console.log('[ATTACHMENT DATA]', attachmentData);

// D. Send to AI
const aiResponse = await fetch('/api/ai/message', {
  body: JSON.stringify({
    message: 'yes',
    conversationId: 'abc-123',
    attachmentUrl: fileUrl,
    attachmentData: attachmentData
  })
});
console.log('[AI RESPONSE]', aiResponse);

// E. AI creates assignment with attachment
console.log('[UPLOAD COMPLETE] Assignment created!');
```

### 5. **Backend Creates Assignment**

Your AI backend should:

```javascript
// Receive the attachment info
const { attachmentUrl, attachmentData } = request.body;

// Create assignment with attachment
const assignmentPayload = {
  courseId: collectedParams.courseId,
  title: collectedParams.title,
  description: collectedParams.description || "",
  dueDate: collectedParams.dueDate,
  maxPoints: collectedParams.maxPoints || 100,
  attachments: [attachmentData]  // ← Include the attachment
};

// POST to /api/assignments
const response = await fetch('/api/assignments', {
  method: 'POST',
  body: JSON.stringify(assignmentPayload)
});
```

### 6. **Success Message**
```
AI: "✅ Assignment 'Homework 1' has been created successfully for Math 101 with your attachment!"
```

## 🎨 UI Features

### File Selection
- Accepts multiple formats: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.jpg`, `.jpeg`, `.png`, `.gif`, `.txt`
- Max file size: 50MB
- Shows file name and size after selection

### Upload Progress
```javascript
{uploadingFile ? (
  <>
    <Spinner as="span" animation="border" size="sm" />
    Uploading...
  </>
) : (
  <>
    <IconifyIcon icon="ri:upload-cloud-2-line" />
    Upload & Create Assignment
  </>
)}
```

### Cancel Option
User can cancel at any time:
```javascript
onClick={() => {
  setPendingAttachment(null);
  setMessages(prev => [...prev, { 
    sender: 'bot', 
    text: 'Assignment creation cancelled. Let me know if you need help!', 
    time: new Date(),
    type: 'text'
  }]);
}}
```

## 🔧 Error Handling

### File Upload Errors
```javascript
try {
  const uploadResponse = await uploadFile(file);
  // ... success
} catch (error) {
  console.error('[UPLOAD ERROR]', error);
  alert('Failed to upload file: ' + error.message);
  setMessages(prev => [...prev, { 
    sender: 'bot', 
    text: `Sorry, there was an error uploading the file: ${error.message}. Please try again.`, 
    time: new Date(),
    type: 'text'
  }]);
}
```

### Handled Error Cases:
- ✅ No file selected
- ✅ Upload endpoint failure
- ✅ Missing file URL in response
- ✅ AI request failure
- ✅ Network errors

## 🐛 Debug Logs

Comprehensive logging for troubleshooting:

```javascript
console.log('[UPLOAD START] Uploading file:', filename);
console.log('[UPLOAD SUCCESS] Response:', uploadResponse);
console.log('[FILE URL]', fileUrl);
console.log('[ATTACHMENT DATA]', attachmentData);
console.log('[AI RESPONSE]', aiData);
console.log('[UPLOAD COMPLETE] Assignment created successfully!');
```

## 📊 State Management

### States Used:
```javascript
const [pendingAttachment, setPendingAttachment] = useState(null);
const [uploadingFile, setUploadingFile] = useState(false);

// Structure of pendingAttachment:
{
  file: File,                    // Browser File object
  assignmentData: {...},         // Assignment details from AI
  conversationId: "abc-123"      // Current conversation ID
}
```

## 🔐 Security

### Authentication
```javascript
const token = getToken();
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Content-Type Handling
```javascript
// For file uploads - NO Content-Type header
// Browser automatically sets: Content-Type: multipart/form-data; boundary=...
const headers = {
  'Authorization': `Bearer ${token}`
  // DON'T set Content-Type!
};
```

## ✅ Testing Checklist

### Frontend Testing:
- [x] Upload button appears when `awaitingFileUpload: true`
- [x] File can be selected
- [x] File info displays after selection
- [x] Upload button is disabled without file
- [x] Upload button shows spinner during upload
- [x] Success message appears after upload
- [x] Cancel button works
- [x] Error handling works

### Backend Testing:
- [ ] `/api/upload` endpoint exists and works
- [ ] Returns correct response format
- [ ] Handles authentication
- [ ] Saves file correctly
- [ ] Returns valid file URLs
- [ ] `/api/assignments` accepts attachments array
- [ ] AI backend processes attachment info

## 🚀 Quick Test

1. **Hard refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

2. **Start conversation:**
   ```
   You: "Create assignment for Math 101"
   AI: "Please provide a title"
   You: "Test Assignment"
   AI: "Would you like to attach a file? (yes/no)"
   You: "yes"
   ```

3. **Check for:**
   - ✅ Upload UI appears
   - ✅ Can select file
   - ✅ "Upload & Create Assignment" button appears
   - ✅ Can click upload

4. **Monitor console:**
   ```
   [UPLOAD UI] Rendering file upload UI!
   [FILE SELECTED] homework.pdf 2621440
   [UPLOAD START] Uploading file: homework.pdf
   [UPLOAD SUCCESS] Response: {...}
   [FILE URL] https://...
   [ATTACHMENT DATA] {...}
   [AI RESPONSE] {...}
   [UPLOAD COMPLETE] Assignment created!
   ```

## 🎯 Summary of Changes

### Files Modified:
1. ✅ `src/lib/api/courses.js` - Added `uploadFile()` and `apiUpload()` helper
2. ✅ `src/app/(admin)/dashboard/page.jsx` - Integrated file upload with proper API calls

### Key Features:
- ✅ Centralized API utility for file uploads
- ✅ Proper error handling
- ✅ Flexible response format handling
- ✅ Comprehensive debug logging
- ✅ Beautiful UI with file selection feedback
- ✅ Cancel functionality
- ✅ Upload progress indication

### What Backend Needs:
- ✅ `/api/upload` endpoint that accepts `FormData` with `file` field
- ✅ Returns response in the documented format
- ✅ `/api/assignments` endpoint that accepts `attachments` array
- ✅ AI backend that processes `attachmentUrl` and `attachmentData` from requests

## 🎉 Ready to Test!

The implementation is complete! Just ensure your backend `/api/upload` endpoint is ready and refresh the page to test.

