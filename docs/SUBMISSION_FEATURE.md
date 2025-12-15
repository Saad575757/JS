# 📝 Assignment Submission Feature

## Overview

Students can now submit assignments with text and file attachments through a comprehensive submission system.

## 🎯 Features

### For Students:

1. **Submit Assignments**
   - Submit text responses
   - Attach multiple files
   - See submission status in course assignments
   - View all submissions in one place

2. **Submission Status**
   - **Not Submitted** - Shows "Submit" button
   - **Submitted** - Shows green checkmark badge
   - **Graded** - Shows grade/points

3. **File Upload**
   - Multiple files supported
   - Drag & drop interface
   - Supported formats: PDF, Word, Excel, PowerPoint, Images, ZIP
   - Max 50MB per file
   - Real-time upload progress

## 📡 API Endpoints

### Submit Assignment
```http
POST /api/submissions
Content-Type: application/json

{
  "assignmentId": 123,
  "submissionText": "My submission response...",
  "attachments": [
    {
      "originalName": "homework.pdf",
      "filename": "homework-123456.pdf",
      "url": "/uploads/...",
      "fullUrl": "https://...",
      "size": 1234567,
      "mimetype": "application/pdf"
    }
  ]
}
```

### Get My Submissions
```http
GET /api/submissions/my-submissions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "submissions": [
    {
      "id": 1,
      "assignment_id": 123,
      "assignment_title": "Homework 1",
      "course_name": "Math 101",
      "submission_text": "...",
      "attachments": [...],
      "submitted_at": "2025-12-15T...",
      "status": "submitted",
      "grade": null,
      "max_points": 100
    }
  ]
}
```

### Get My Submission for Assignment
```http
GET /api/submissions/assignment/:assignmentId
Authorization: Bearer <token>
```

## 🗂️ File Structure

```
src/
├── lib/
│   └── api/
│       └── submissions.js          # API functions
├── components/
│   ├── SubmissionModal/
│   │   └── index.jsx              # Submit assignment modal
│   └── MySubmissions/
│       └── index.jsx              # View all submissions
└── app/
    └── (admin)/
        └── my-submissions/
            └── page.jsx           # My Submissions page
```

## 💡 Usage

### In Class Detail View (Integrated):

```javascript
import SubmissionModal from '@/components/SubmissionModal';
import { getMySubmissionForAssignment } from '@/lib/api/submissions';

// Check if student has submitted
const submission = await getMySubmissionForAssignment(assignmentId);

// Show submit button or submitted badge
{hasSubmission ? (
  <Badge bg="success">Submitted</Badge>
) : (
  <Button onClick={() => setShowSubmissionModal(true)}>
    Submit
  </Button>
)}

// Submission Modal
<SubmissionModal
  show={showSubmissionModal}
  onHide={() => setShowSubmissionModal(false)}
  assignment={selectedAssignment}
  onSubmitSuccess={(submission) => {
    console.log('Submitted:', submission);
  }}
/>
```

### Standalone Submissions Page:

```javascript
import MySubmissions from '@/components/MySubmissions';

export default function MySubmissionsPage() {
  return <MySubmissions />;
}
```

## 🎨 Submission Modal Features

- **Assignment Details Display**
  - Title, description
  - Due date
  - Max points

- **Text Editor**
  - Multi-line text area
  - Optional (can submit files only)

- **File Uploader**
  - Multiple file selection
  - Upload progress indicator
  - File preview with name, size, type
  - Remove file option
  - Error handling

- **Validation**
  - Must provide text OR files (at least one)
  - File size limits
  - File type validation

- **Success Feedback**
  - Success message
  - Auto-close after submission
  - Updates parent component

## 📊 My Submissions Component

Displays all student submissions in a table:

| Assignment | Course | Submitted | Status | Grade | Actions |
|------------|--------|-----------|--------|-------|---------|
| Homework 1 | Math 101 | 2h ago | Submitted | Not graded | 👁️ |
| Quiz 1 | English 101 | 1d ago | Graded | 95/100 | 👁️ 📎 |

**Features:**
- Sortable columns
- Search/filter
- Status badges (Submitted, Graded, Late)
- Grade display
- Attachment count
- View details button
- Refresh button

## 🔧 API Utilities

### `src/lib/api/submissions.js`

```javascript
// Submit assignment
await submitAssignment({
  assignmentId: 123,
  submissionText: "My answer...",
  attachments: [...]
});

// Get all my submissions
const submissions = await getMySubmissions();

// Get specific submission
const submission = await getMySubmissionForAssignment(assignmentId);

// Update submission (if allowed)
await updateSubmission(submissionId, { submissionText: "Updated..." });

// Delete submission (if allowed)
await deleteSubmission(submissionId);
```

## 🚀 How to Test

### As a Student:

1. **Navigate to a Course**
   - Go to Classes → Select a course
   - Click "Assignments" tab

2. **Submit an Assignment**
   - Click "Submit" button on an assignment
   - Enter text or upload files (or both)
   - Click "Submit Assignment"
   - See success message

3. **View Submission Status**
   - See "Submitted" badge on submitted assignments
   - Can't submit again (badge replaces button)

4. **View All Submissions**
   - Go to "My Submissions" page
   - See all submitted assignments
   - Check grades when available

## 📝 Backend Requirements

Your backend should:

1. **Store Submissions**
   - Link to assignment_id and user_id
   - Save submission_text (TEXT)
   - Save attachments (JSONB array)
   - Track submitted_at timestamp
   - Store status (submitted, graded, late)
   - Store grade (nullable)

2. **API Endpoints**
   ```sql
   POST   /api/submissions              -- Create submission
   GET    /api/submissions/my-submissions -- List user's submissions
   GET    /api/submissions/assignment/:id -- Get submission for assignment
   PUT    /api/submissions/:id          -- Update submission
   DELETE /api/submissions/:id          -- Delete submission
   ```

3. **Validation**
   - Check assignment exists
   - Check student is enrolled in course
   - Check submission deadline (if enforcing)
   - Validate file attachments
   - Prevent duplicate submissions (or allow resubmission)

4. **Response Format**
   ```json
   {
     "success": true,
     "submission": {
       "id": 1,
       "assignment_id": 123,
       "user_id": 456,
       "submission_text": "...",
       "attachments": [...],
       "submitted_at": "2025-12-15T...",
       "status": "submitted",
       "grade": null
     }
   }
   ```

## 🎉 Summary

**Implemented:**
- ✅ Submission API utilities
- ✅ Submission modal component
- ✅ File upload with multiple files
- ✅ My Submissions list component
- ✅ Integration with Class Detail View
- ✅ Submission status tracking
- ✅ Real-time UI updates

**Students can now:**
- ✅ Submit assignments with text and files
- ✅ See submission status
- ✅ View all their submissions
- ✅ Track grades

**Ready to use!** 🚀

