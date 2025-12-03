# 📎 AI Assignment Creation with File Attachments

## Overview

Teachers can now create assignments via AI with optional file attachments! The AI will ask if you want to attach a file, and if you say yes, you'll get a beautiful upload interface.

## 🎯 How It Works

### Step-by-Step Flow

#### **Step 1: AI Asks for Course Name**
```
AI: What's the course name for this assignment?
Teacher: Math 101
```

#### **Step 2: AI Asks for Assignment Title**
```
AI: What should the assignment title be?
Teacher: Homework Chapter 5
```

#### **Step 3: ✨ NEW! AI Asks About File Attachment**
```
AI: Would you like to attach a file to this assignment?

📎 You can attach:
• PDF documents
• Word documents
• Images
• Spreadsheets
• Any other files

Just say "yes" or "no".
```

#### **If Teacher Says "NO"**
```json
{
  "assignment": {
    "courseName": "Math 101",
    "title": "Homework Chapter 5",
    "hasAttachment": false
  }
}
```
Assignment is created immediately without attachment.

#### **If Teacher Says "YES"**
```json
{
  "assignment": {
    "courseName": "Math 101",
    "title": "Homework Chapter 5",
    "hasAttachment": true,
    "attachmentUrl": "pending"
  }
}
```
Frontend shows file upload interface!

## 🎨 File Upload UI

When `hasAttachment: true` and `attachmentUrl: "pending"`, the chat displays:

```
┌─────────────────────────────────────────┐
│ ⚠️ Attachment Required                  │
│ Homework Chapter 5                      │
├─────────────────────────────────────────┤
│ ℹ️ Please upload a file to attach      │
│                                         │
│ Assignment Details:                     │
│ • Course: Math 101                      │
│ • Title: Homework Chapter 5             │
│ • Due Date: Dec 10, 2025               │
│ • Max Points: 100                       │
│                                         │
│ 📎 Select File to Attach                │
│ [Choose File]                           │
│                                         │
│ Supported: PDF, Word, Excel, Images...  │
│                                         │
│ ✅ File selected: homework.pdf (2.5 MB) │
│                                         │
│ [Upload & Create Assignment] [Cancel]   │
└─────────────────────────────────────────┘
```

## 💻 Technical Implementation

### Frontend State Management

```javascript
const [pendingAttachment, setPendingAttachment] = useState(null);
const [uploadingFile, setUploadingFile] = useState(false);
```

### Response Detection

```javascript
if (response.assignment && response.assignment.hasAttachment && 
    response.assignment.attachmentUrl === 'pending') {
  // Show file upload UI
}
```

### File Upload Handler

```javascript
const handleFileUpload = async () => {
  // 1. Create FormData
  const formData = new FormData();
  formData.append('file', pendingAttachment.file);
  
  // 2. Upload file to backend
  const uploadRes = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const uploadData = await uploadRes.json();
  const fileUrl = uploadData.url;
  
  // 3. Create assignment with file URL
  const assignmentPayload = {
    ...pendingAttachment.assignmentData,
    hasAttachment: true,
    attachmentUrl: fileUrl
  };
  
  // 4. Send to backend
  await fetch('/api/assignments', {
    method: 'POST',
    body: JSON.stringify(assignmentPayload)
  });
};
```

## 📊 Data Structure

### Backend Response (When Attachment Requested)

```json
{
  "success": true,
  "message": "Great! Please upload the file below.",
  "response": {
    "message": "I'll create that assignment. Please upload the file.",
    "assignment": {
      "courseName": "Math 101",
      "courseId": "abc123",
      "title": "Homework Chapter 5",
      "description": "Complete all exercises from Chapter 5",
      "dueDate": "2025-12-10T23:59:59Z",
      "maxPoints": 100,
      "hasAttachment": true,
      "attachmentUrl": "pending"
    }
  }
}
```

### Backend Response (No Attachment)

```json
{
  "success": true,
  "message": "Assignment created successfully!",
  "response": {
    "message": "Assignment created in Math 101!",
    "assignment": {
      "id": "xyz789",
      "courseName": "Math 101",
      "title": "Homework Chapter 5",
      "state": "PUBLISHED",
      "hasAttachment": false,
      "creationTime": "2025-12-03T10:30:00Z"
    }
  }
}
```

### Frontend Payload (After File Upload)

```json
{
  "courseName": "Math 101",
  "courseId": "abc123",
  "title": "Homework Chapter 5",
  "description": "Complete all exercises from Chapter 5",
  "dueDate": "2025-12-10T23:59:59Z",
  "maxPoints": 100,
  "hasAttachment": true,
  "attachmentUrl": "https://storage.example.com/files/homework-ch5.pdf"
}
```

## 🎨 UI Components

### File Upload Card

```jsx
<Card className="mb-3 shadow-sm border-warning">
  <Card.Body>
    <Alert variant="info">
      📎 Please upload a file to attach to this assignment.
    </Alert>
    
    {/* Assignment Details */}
    <div className="mb-3">
      <strong>Assignment Details:</strong>
      <ul>
        <li>Course: {assignment.courseName}</li>
        <li>Title: {assignment.title}</li>
        <li>Due Date: {assignment.dueDate}</li>
      </ul>
    </div>
    
    {/* File Input */}
    <Form.Control
      type="file"
      accept=".pdf,.doc,.docx,..."
      onChange={handleFileSelect}
    />
    
    {/* Selected File Display */}
    {selectedFile && (
      <Alert variant="success">
        ✅ File selected: {file.name} ({fileSize} MB)
      </Alert>
    )}
    
    {/* Action Buttons */}
    <Button onClick={handleUpload} disabled={uploading}>
      {uploading ? 'Uploading...' : 'Upload & Create'}
    </Button>
    <Button variant="outline-secondary" onClick={handleCancel}>
      Cancel
    </Button>
  </Card.Body>
</Card>
```

### Assignment Display (With Attachment)

```jsx
<ListGroup.Item>
  <strong>Attachment:</strong>{" "}
  <a href={assignment.attachmentUrl} target="_blank">
    📎 View Attached File
  </a>
</ListGroup.Item>
```

## 📝 Supported File Types

| Category | Extensions | MIME Types |
|----------|-----------|------------|
| Documents | `.pdf`, `.doc`, `.docx` | `application/pdf`, `application/msword` |
| Spreadsheets | `.xls`, `.xlsx`, `.csv` | `application/vnd.ms-excel` |
| Presentations | `.ppt`, `.pptx` | `application/vnd.ms-powerpoint` |
| Images | `.jpg`, `.jpeg`, `.png`, `.gif` | `image/*` |
| Text | `.txt` | `text/plain` |

**File Size Limit:** 50 MB

## 🔄 Complete Flow Example

### Conversation Example

```
Teacher: Create an assignment for Math 101

AI: What should the assignment title be?

Teacher: Chapter 5 Homework

AI: Would you like to attach a file to this assignment?

📎 You can attach:
• PDF documents
• Word documents  
• Images
• Spreadsheets

Just say "yes" or "no".

Teacher: yes

AI: Great! Please upload the file below.

[File Upload UI appears]

Teacher: [Selects homework-ch5.pdf]

[Clicks "Upload & Create Assignment"]

AI: ✅ Assignment "Chapter 5 Homework" created successfully with attachment!
```

## 🚀 Backend Requirements

### 1. File Upload Endpoint

**Endpoint:** `POST /api/upload`

```javascript
// Request
const formData = new FormData();
formData.append('file', file);

// Response
{
  "success": true,
  "url": "https://storage.example.com/files/abc123.pdf",
  "fileUrl": "https://storage.example.com/files/abc123.pdf",
  "filename": "homework-ch5.pdf",
  "size": 2621440
}
```

### 2. Assignment Creation Endpoint

**Endpoint:** `POST /api/assignments`

```javascript
// Request
{
  "courseId": "abc123",
  "courseName": "Math 101",
  "title": "Chapter 5 Homework",
  "description": "Complete all exercises",
  "dueDate": "2025-12-10T23:59:59Z",
  "maxPoints": 100,
  "hasAttachment": true,
  "attachmentUrl": "https://storage.example.com/files/abc123.pdf"
}

// Response
{
  "success": true,
  "assignment": {
    "id": "xyz789",
    "title": "Chapter 5 Homework",
    "state": "PUBLISHED",
    "hasAttachment": true,
    "attachmentUrl": "https://storage.example.com/files/abc123.pdf"
  }
}
```

### 3. Database Schema (JSONB Column)

```sql
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  max_points INTEGER DEFAULT 100,
  attachment_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Example JSONB data
{
  "hasAttachment": true,
  "attachmentUrl": "https://storage.example.com/files/abc123.pdf",
  "fileName": "homework-ch5.pdf",
  "fileSize": 2621440,
  "fileType": "application/pdf",
  "uploadedAt": "2025-12-03T10:30:00Z"
}
```

## 🎯 AI Conversation Logic

### Backend AI Handler

```javascript
// When creating assignment
if (step === 'ask_attachment') {
  return {
    message: `Would you like to attach a file to this assignment?

📎 You can attach:
• PDF documents
• Word documents
• Images
• Spreadsheets
• Any other files

Just say "yes" or "no".`,
    waitingForInput: true,
    context: {
      step: 'waiting_attachment_response',
      assignmentData: {...}
    }
  };
}

// When user responds
if (context.step === 'waiting_attachment_response') {
  const userResponse = message.toLowerCase();
  
  if (userResponse.includes('yes')) {
    return {
      message: "Great! Please upload the file below.",
      assignment: {
        ...context.assignmentData,
        hasAttachment: true,
        attachmentUrl: 'pending'
      }
    };
  } else {
    // Create assignment without attachment
    const created = await createAssignment({
      ...context.assignmentData,
      hasAttachment: false
    });
    
    return {
      message: "Assignment created successfully!",
      assignment: created
    };
  }
}
```

## ✨ Features

### 1. **Smart File Detection**
- Shows file name and size after selection
- Validates file type
- Checks file size (max 50MB)

### 2. **Progress Indication**
```jsx
{uploading ? (
  <>
    <Spinner size="sm" /> Uploading...
  </>
) : (
  'Upload & Create Assignment'
)}
```

### 3. **Error Handling**
```javascript
try {
  await uploadFile();
  await createAssignment();
} catch (error) {
  alert('Failed to upload: ' + error.message);
}
```

### 4. **Cancellation**
User can cancel at any time:
```javascript
<Button onClick={() => {
  setPendingAttachment(null);
  showMessage('Assignment creation cancelled');
}}>
  Cancel
</Button>
```

## 🎨 Visual States

### 1. **Waiting for File**
- Yellow badge: "Attachment Required"
- Info alert: "Please upload a file"
- File input enabled
- Upload button disabled

### 2. **File Selected**
- Green alert: "✅ File selected: homework.pdf (2.5 MB)"
- Upload button enabled
- Shows file details

### 3. **Uploading**
- Upload button shows spinner
- All controls disabled
- "Uploading..." text

### 4. **Success**
- Success message in chat
- Shows created assignment details
- Attachment link visible

## 📱 Responsive Design

### Desktop
```css
.file-upload-card {
  max-width: 600px;
  margin: 0 auto;
}
```

### Mobile
- Full-width file input
- Stacked buttons
- Touch-friendly controls

## 🔒 Security Considerations

### 1. **File Type Validation**
```javascript
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'image/*'
];
```

### 2. **File Size Limit**
```javascript
if (file.size > 50 * 1024 * 1024) {
  alert('File too large. Max 50MB.');
  return;
}
```

### 3. **Authentication**
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 4. **Sanitize Filenames**
Backend should sanitize uploaded filenames to prevent directory traversal attacks.

## 📊 State Flow Diagram

```
┌─────────────────┐
│ AI asks about   │
│ attachment      │
└────────┬────────┘
         │
    ┌────▼────┐
    │ User    │
    │ Answer? │
    └────┬────┘
         │
    ┌────▼────────────────┐
    │                     │
┌───▼──┐            ┌────▼───┐
│ YES  │            │  NO    │
└───┬──┘            └────┬───┘
    │                    │
    │                    │
┌───▼─────────┐    ┌────▼──────────┐
│ Show upload │    │ Create without│
│ UI with     │    │ attachment    │
│ "pending"   │    └───────────────┘
└───┬─────────┘
    │
┌───▼──────┐
│ User     │
│ uploads  │
│ file     │
└───┬──────┘
    │
┌───▼──────────┐
│ Upload file  │
│ to /api/     │
│ upload       │
└───┬──────────┘
    │
┌───▼──────────┐
│ Create       │
│ assignment   │
│ with URL     │
└──────────────┘
```

## 🎯 Testing Checklist

- [ ] AI asks about attachment correctly
- [ ] "Yes" response shows upload UI
- [ ] "No" response creates assignment immediately
- [ ] File selection shows preview
- [ ] Upload button disabled until file selected
- [ ] Upload progress indicator works
- [ ] Success message appears after creation
- [ ] Attachment link works in created assignment
- [ ] Cancel button works at any step
- [ ] File type validation works
- [ ] File size validation works
- [ ] Error handling works for upload failures
- [ ] Error handling works for creation failures

## 📂 Files Modified

1. **`src/app/(admin)/dashboard/page.jsx`**
   - Added `pendingAttachment` state
   - Added `uploadingFile` state
   - Added file upload UI component
   - Added attachment display in assignment view
   - Added upload handler logic

## Related Documentation

- [Classes System](./CLASSES_SYSTEM.md)
- [RBAC System](./RBAC_SYSTEM.md)
- [Chat Formatting](./CHAT_FORMATTING.md)

