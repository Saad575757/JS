'use client';
import { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { triggerAIGrading } from '@/lib/api/aiGrading';

/**
 * Button component to trigger AI grading for a specific submission
 * Used in teacher's submission details view
 */
export default function AIGradingButton({ submission, onGradingComplete }) {
  const [loading, setLoading] = useState(false);

  const handleTriggerGrading = async () => {
    if (!submission?.id) return;

    setLoading(true);
    try {
      console.log('[AI GRADING BTN] Triggering for submission:', submission.id);
      const result = await triggerAIGrading(submission.id);
      console.log('[AI GRADING BTN] Result:', result);
      
      alert('AI grading triggered! Check "Pending AI Grades" to review.');
      onGradingComplete?.();
    } catch (err) {
      console.error('[AI GRADING BTN] Error:', err);
      alert(`Failed to trigger AI grading: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if submission already has a grade
  if (submission?.grade !== null && submission?.grade !== undefined) {
    return null;
  }

  return (
    <Button
      variant="outline-primary"
      size="sm"
      onClick={handleTriggerGrading}
      disabled={loading}
      title="Trigger AI Grading"
    >
      {loading ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          Grading...
        </>
      ) : (
        <>
          <IconifyIcon icon="ri:robot-line" className="me-1" />
          AI Grade
        </>
      )}
    </Button>
  );
}

