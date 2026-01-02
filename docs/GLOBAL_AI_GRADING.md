# Global AI Grading Feature 🌍🤖

## Overview

The **Global AI Grading** feature allows teachers to configure AI grading preferences **once** and have them automatically apply to **all assignments**. No need to configure each assignment individually!

---

## Why Global Settings?

### Before (Per-Assignment):
- ❌ Configure AI settings for each assignment
- ❌ Repetitive setup for similar assignments
- ❌ Inconsistent grading across assignments
- ❌ Time-consuming management

### Now (Global Settings):
- ✅ Configure once, apply everywhere
- ✅ Consistent grading across all assignments
- ✅ Save time on setup
- ✅ Easy to update all assignments at once
- ✅ Auto-apply to new assignments

---

## Features

### 🌐 Global Preferences
Set your AI grading preferences that apply to all assignments:
- **Enable/Disable AI Grading** globally
- **Default Grading Mode** (Manual Review or Automatic)
- **Default AI Instructions** (your custom grading criteria)
- **Auto-Apply to New Assignments** (automatic for new assignments)

### 🔄 Apply to Existing Assignments
One-click button to apply your global settings to all existing assignments.

### 📊 Pending AI Grades Review
Still accessible for reviewing AI-suggested grades in Manual Review mode.

---

## How to Use

### Step 1: Open Global AI Settings

1. Navigate to any class
2. Go to **Assignments** tab
3. Click **"AI Settings"** button (top right)

### Step 2: Configure Global Preferences

#### Enable AI Grading
Toggle **"Enable AI Grading"** to ON

#### Choose Default Grading Mode

**Manual Review** (Recommended):
- AI suggests grades
- You review and approve each one
- Full control before students see grades

**Automatic**:
- AI grades instantly upon submission
- Students get immediate feedback
- Best for objective assignments

#### Add Default AI Instructions
Provide instructions that will guide AI grading for all assignments:

```
Example Instructions:
- "Focus on clarity, examples, and proper citations"
- "Give partial credit for showing work"
- "Penalize late submissions by 10 points"
- "Check for proper code comments and documentation"
```

#### Auto-Apply to New Assignments
✅ Check this to automatically enable AI grading for all new assignments you create

### Step 3: Apply to Existing Assignments (Optional)

Click **"Apply to All"** to update all your existing assignments with these global settings.

### Step 4: Save

Click **"Save Global Settings"** - Done! 🎉

---

## UI Layout

### Assignments Tab Header:
```
┌────────────────────────────────────────────────┐
│ 📋 Assignments                                 │
│                                                │
│  [🤖 AI Settings] [🤖 Pending AI Grades]      │
│  [➕ Create Assignment]                        │
└────────────────────────────────────────────────┘
```

### Global AI Settings Modal:
```
┌──────────────────────────────────────────┐
│  ⚙️ Global AI Grading Settings          │
├──────────────────────────────────────────┤
│                                          │
│  ℹ️ Configure AI grading once for all   │
│     your assignments automatically      │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🤖 Enable AI Grading        [✓]   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Default Grading Mode:                  │
│  ┌──────────────┐  ┌─────────────────┐│
│  │ ● Manual     │  │ ○ Automatic     ││
│  │   Review     │  │                 ││
│  └──────────────┘  └─────────────────┘│
│                                          │
│  Default AI Instructions:               │
│  ┌────────────────────────────────────┐ │
│  │ Focus on clarity and examples...  │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ☑️ Auto-apply to new assignments       │
│                                          │
│  ⚠️ Apply to Existing Assignments       │
│     [🔄 Apply to All]                   │
│                                          │
│  ℹ️ Manual Review: AI suggests,         │
│     you approve before students see     │
│                                          │
│          [Cancel]  [💾 Save Settings]   │
└──────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Get Global AI Preferences
```http
GET /api/ai-grading/preferences
Authorization: Bearer <teacher_token>

Response:
{
  "success": true,
  "preferences": {
    "teacher_id": 1,
    "ai_grading_enabled": true,
    "default_grading_mode": "manual",
    "default_ai_instructions": "Focus on clarity and examples",
    "auto_apply_to_new_assignments": true
  }
}
```

### 2. Update Global AI Preferences
```http
PUT /api/ai-grading/preferences
Authorization: Bearer <teacher_token>

Body:
{
  "aiGradingEnabled": true,
  "defaultGradingMode": "manual",
  "defaultAiInstructions": "Your custom instructions",
  "autoApplyToNewAssignments": true
}

Response:
{
  "success": true,
  "preferences": { ... },
  "message": "AI grading preferences updated successfully"
}
```

### 3. Apply Settings to All Existing Assignments
```http
POST /api/ai-grading/preferences/apply-to-all
Authorization: Bearer <teacher_token>

Response:
{
  "success": true,
  "message": "Applied AI grading settings to 25 assignment(s)",
  "appliedCount": 25,
  "skippedCount": 0,
  "totalAssignments": 25
}
```

---

## Workflow Examples

### Scenario 1: New Teacher Setting Up AI Grading

1. **Open AI Settings** from Assignments tab
2. **Enable AI Grading** ✓
3. **Choose Manual Review** (to review first few grades)
4. **Add Instructions**: "Focus on code quality and documentation"
5. **Check "Auto-apply to new assignments"** ✓
6. **Click "Save"**
7. Create new assignments - AI grading automatically enabled!

### Scenario 2: Existing Teacher with 50 Assignments

1. **Open AI Settings** from Assignments tab
2. **Enable AI Grading** ✓
3. **Choose Automatic** (confident in AI accuracy)
4. **Add Instructions**: "Penalize late submissions by 10%"
5. **Click "Apply to All"** 
6. Confirm: "This will apply... to all existing assignments"
7. Success! All 50 assignments now have AI grading enabled!

### Scenario 3: Updating Instructions Mid-Semester

1. **Open AI Settings**
2. **Update Instructions**: Add "Give extra credit for creative solutions"
3. **Click "Apply to All"**
4. All assignments updated with new instructions!

---

## Component Architecture

### Files Created/Modified

**New API Utilities:**
- `src/lib/api/aiGradingPreferences.js`
  - `getAIGradingPreferences()`
  - `updateAIGradingPreferences(preferences)`
  - `applyAISettingsToAllAssignments()`

**New Components:**
- `src/components/GlobalAISettings/index.jsx`
  - Global preferences modal
  - Apply to all functionality
  - Real-time validation

**Updated Components:**
- `src/app/(admin)/apps/classes/components/ClassDetailView_New.jsx`
  - Replaced per-assignment AI settings with global button
  - Simplified assignment table (removed per-assignment AI icons)
  - Added global AI settings modal

**Kept Components:**
- `src/components/PendingAIGrades/index.jsx` (still needed for manual review)
- `src/components/SubmissionDetailsModal/AIGradingButton.jsx` (for individual triggers)

---

## State Management

### GlobalAISettings Component State:
```javascript
{
  loading: false,                    // Loading preferences
  saving: false,                     // Saving in progress
  applyingToAll: false,             // Applying to all assignments
  preferences: {
    aiGradingEnabled: false,        // Global enable/disable
    defaultGradingMode: 'manual',   // 'manual' or 'auto'
    defaultAiInstructions: '',      // Custom instructions
    autoApplyToNewAssignments: true // Auto-apply toggle
  },
  error: null,                       // Error messages
  success: null                      // Success messages
}
```

---

## Benefits

### For Teachers:
- ⏰ **Save Time**: Configure once instead of per-assignment
- 🎯 **Consistency**: Same grading criteria across all assignments
- 🔄 **Easy Updates**: Change all assignments at once
- 🚀 **Automation**: New assignments automatically configured
- 💪 **Control**: Full oversight with manual review mode

### For Students:
- 📊 **Consistent Feedback**: Same quality across all assignments
- ⚡ **Fast Feedback**: Instant grading in automatic mode
- 📝 **Detailed Analysis**: AI provides thorough feedback
- 🎓 **Learning**: Clear expectations from consistent criteria

### For Institutions:
- 📈 **Scalability**: Easy to roll out to all teachers
- 🔒 **Standardization**: Consistent grading practices
- 💰 **Cost-Effective**: Reduce grading workload
- 📊 **Analytics**: Track AI grading usage and accuracy

---

## Best Practices

### 1. Start with Manual Review
Begin with manual review mode to:
- Understand how AI grades
- Verify accuracy for your subject
- Build confidence
- Switch to auto mode when ready

### 2. Write Clear Instructions
Be specific in your AI instructions:
```
Good: "Focus on code efficiency, readability, and proper 
       documentation. Give partial credit for attempted 
       solutions. Penalize late submissions by 10 points."

Bad:  "Grade fairly"
```

### 3. Review First Few Grades
Even in manual mode:
- Review first 5-10 grades carefully
- Adjust instructions if needed
- Once satisfied, approve in batches

### 4. Update Instructions as Needed
Don't hesitate to refine:
- Update instructions mid-semester
- Click "Apply to All" to update existing assignments
- Students benefit from improved grading

### 5. Use Auto-Apply for New Assignments
Save time:
- Enable "Auto-apply to new assignments"
- All new assignments automatically configured
- Consistent setup across semester

---

## Security & Privacy

### Authentication:
- ✅ All API calls require teacher authentication
- ✅ Preferences are per-teacher (not shared)
- ✅ Students cannot see or modify AI settings

### Data Privacy:
- ✅ AI instructions stored securely
- ✅ Grading history maintained
- ✅ Audit trail for all changes

### Permissions:
- ✅ Only teachers can access AI settings
- ✅ Only teachers can approve/reject grades
- ✅ Students see only final grades

---

## Troubleshooting

### Issue: Settings not saving
**Solution:**
- Check internet connection
- Verify authentication token is valid
- Check browser console for errors
- Try logging out and back in

### Issue: "Apply to All" not working
**Solution:**
- Ensure you have assignments created
- Check backend API is responding
- Verify permissions (must be teacher)
- Try refreshing the page

### Issue: AI not grading submissions
**Solution:**
- Verify AI grading is enabled in global settings
- Check that assignments have the settings applied
- Ensure backend AI service is running
- Check submission format is supported

---

## Future Enhancements

### Planned Features:
1. **Preset Templates**: Common AI instruction templates
2. **Selective Apply**: Choose which assignments to apply to
3. **Course-Level Settings**: Different settings per course
4. **Department Defaults**: Institution-wide defaults
5. **Analytics Dashboard**: Track AI grading performance

---

## Testing Checklist

### Global Settings:
- [ ] Open global AI settings modal
- [ ] Enable AI grading
- [ ] Switch between manual/auto modes
- [ ] Add custom instructions
- [ ] Toggle auto-apply checkbox
- [ ] Save settings
- [ ] Verify settings persist on reload

### Apply to All:
- [ ] Click "Apply to All" button
- [ ] Confirm dialog appears
- [ ] Verify success message shows count
- [ ] Check individual assignment has settings
- [ ] Create new assignment
- [ ] Verify auto-apply works

### Integration:
- [ ] Verify "AI Settings" button visible
- [ ] Verify per-assignment AI icon removed
- [ ] Test with 0 assignments
- [ ] Test with 50+ assignments
- [ ] Verify pending grades still works

---

## Summary

The **Global AI Grading** feature transforms AI grading from a per-assignment chore into a one-time setup process. Teachers can:

✅ Configure AI grading preferences once  
✅ Apply to all assignments with one click  
✅ Auto-enable for new assignments  
✅ Update all assignments easily  
✅ Maintain full control with manual review  
✅ Save hours of repetitive configuration  

**Result:** More time teaching, less time configuring! 🎓🚀

---

**Documentation Date:** December 17, 2025  
**Version:** 2.0.0 (Global Settings)  
**Status:** ✅ Production Ready

