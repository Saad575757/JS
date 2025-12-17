'use client';
import { useState, useEffect } from 'react';
import { 
  Modal, Button, Form, Alert, Badge, 
  Spinner, Card, InputGroup 
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  getAIGradingPreferences,
  updateAIGradingPreferences,
  applyAISettingsToAllAssignments
} from '@/lib/api/aiGradingPreferences';
import { generateRubricSuggestions } from '@/lib/api/aiGrading';

export default function GlobalAISettings({ 
  show, 
  onHide,
  onSettingsUpdated 
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applyingToAll, setApplyingToAll] = useState(false);
  const [preferences, setPreferences] = useState({
    aiGradingEnabled: false,
    defaultGradingMode: 'manual',
    defaultAiInstructions: '',
    autoApplyToNewAssignments: true
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (show) {
      loadPreferences();
    }
  }, [show]);

  const loadPreferences = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[GLOBAL AI] Loading preferences...');
      const data = await getAIGradingPreferences();
      console.log('[GLOBAL AI] Loaded:', data);
      
      if (data.preferences) {
        // Map backend field names to frontend
        setPreferences({
          aiGradingEnabled: data.preferences.ai_grading_enabled ?? false,
          defaultGradingMode: data.preferences.default_grading_mode ?? 'manual',
          defaultAiInstructions: data.preferences.default_ai_instructions ?? '',
          autoApplyToNewAssignments: data.preferences.auto_apply_to_new_assignments ?? true
        });
      }
    } catch (err) {
      console.error('[GLOBAL AI] Load error:', err);
      // If no preferences exist yet, use defaults
      if (!err.message.includes('404') && !err.message.includes('not found')) {
        setError(`Failed to load preferences: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateAIGradingPreferences(preferences);
      setSuccess('Global AI grading preferences saved successfully!');
      onSettingsUpdated?.(preferences);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('[GLOBAL AI] Save error:', err);
      setError(`Failed to save preferences: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToAll = async () => {
    if (!confirm('This will apply your global AI grading settings to all existing assignments. Continue?')) {
      return;
    }

    setApplyingToAll(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await applyAISettingsToAllAssignments();
      console.log('[GLOBAL AI] Applied to all:', result);
      
      setSuccess(
        `Successfully applied AI grading to ${result.appliedCount} assignment(s)!` +
        (result.skippedCount > 0 ? ` (${result.skippedCount} skipped)` : '')
      );
      
      onSettingsUpdated?.(preferences);
    } catch (err) {
      console.error('[GLOBAL AI] Apply error:', err);
      setError(`Failed to apply settings: ${err.message}`);
    } finally {
      setApplyingToAll(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <IconifyIcon icon="ri:settings-3-line" className="me-2" />
          Global AI Grading Settings
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Info Alert */}
        <Alert variant="info" className="mb-3">
          <IconifyIcon icon="ri:information-line" className="me-2" />
          <strong>Global Settings:</strong> Configure AI grading preferences once and they&apos;ll apply to all your assignments automatically.
        </Alert>

        {/* Error/Success Alerts */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <IconifyIcon icon="ri:error-warning-line" className="me-2" />
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            <IconifyIcon icon="ri:checkbox-circle-line" className="me-2" />
            {success}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2 text-muted">Loading preferences...</p>
          </div>
        ) : (
          <Form>
            {/* Enable AI Grading Globally */}
            <Card className="mb-4 border-primary">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="mb-1">
                      <IconifyIcon icon="ri:robot-line" className="me-2" />
                      Enable AI Grading
                    </h5>
                    <p className="text-muted small mb-0">
                      Turn on AI-powered grading for all your assignments
                    </p>
                  </div>
                  <Form.Check
                    type="switch"
                    checked={preferences.aiGradingEnabled}
                    onChange={(e) => setPreferences({ ...preferences, aiGradingEnabled: e.target.checked })}
                    style={{ fontSize: '1.5rem' }}
                  />
                </div>
              </Card.Body>
            </Card>

            {preferences.aiGradingEnabled && (
              <>
                {/* Default Grading Mode */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                    <strong>Default Grading Mode</strong>
                  </Form.Label>
                  <div className="d-flex gap-3">
                    <Card 
                      className={`flex-fill cursor-pointer ${preferences.defaultGradingMode === 'manual' ? 'border-primary' : ''}`}
                      onClick={() => setPreferences({ ...preferences, defaultGradingMode: 'manual' })}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body>
                        <Form.Check
                          type="radio"
                          name="mode"
                          checked={preferences.defaultGradingMode === 'manual'}
                          onChange={() => setPreferences({ ...preferences, defaultGradingMode: 'manual' })}
                          label={
                            <div>
                              <strong>Manual Review</strong>
                              <div className="small text-muted">
                                AI suggests grades, you approve/reject
                              </div>
                            </div>
                          }
                        />
                      </Card.Body>
                    </Card>
                    <Card 
                      className={`flex-fill cursor-pointer ${preferences.defaultGradingMode === 'auto' ? 'border-primary' : ''}`}
                      onClick={() => setPreferences({ ...preferences, defaultGradingMode: 'auto' })}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body>
                        <Form.Check
                          type="radio"
                          name="mode"
                          checked={preferences.defaultGradingMode === 'auto'}
                          onChange={() => setPreferences({ ...preferences, defaultGradingMode: 'auto' })}
                          label={
                            <div>
                              <strong>Automatic</strong>
                              <div className="small text-muted">
                                AI grades automatically (instant feedback)
                              </div>
                            </div>
                          }
                        />
                      </Card.Body>
                    </Card>
                  </div>
                </Form.Group>

                {/* Default AI Instructions */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    <IconifyIcon icon="ri:file-text-line" className="me-2" />
                    <strong>Default AI Instructions</strong>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={preferences.defaultAiInstructions}
                    onChange={(e) => setPreferences({ ...preferences, defaultAiInstructions: e.target.value })}
                    placeholder="E.g., Focus on clarity and providing examples. Check for proper citations. Give partial credit for attempted solutions..."
                  />
                  <Form.Text className="text-muted">
                    These instructions will guide AI grading for all your assignments. Be specific about what matters most to you.
                  </Form.Text>
                </Form.Group>

                {/* Auto-Apply to New Assignments */}
                <Form.Group className="mb-4">
                  <Card className="bg-light">
                    <Card.Body>
                      <Form.Check
                        type="checkbox"
                        checked={preferences.autoApplyToNewAssignments}
                        onChange={(e) => setPreferences({ ...preferences, autoApplyToNewAssignments: e.target.checked })}
                        label={
                          <div>
                            <strong>Auto-apply to new assignments</strong>
                            <div className="small text-muted">
                              Automatically enable AI grading with these settings for all new assignments you create
                            </div>
                          </div>
                        }
                      />
                    </Card.Body>
                  </Card>
                </Form.Group>

                {/* Apply to Existing Assignments */}
                <Card className="mb-3 border-warning bg-light">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>
                          <IconifyIcon icon="ri:refresh-line" className="me-2" />
                          Apply to Existing Assignments
                        </strong>
                        <div className="small text-muted">
                          Update all your existing assignments with these global settings
                        </div>
                      </div>
                      <Button
                        variant="warning"
                        onClick={handleApplyToAll}
                        disabled={applyingToAll}
                      >
                        {applyingToAll ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <IconifyIcon icon="ri:refresh-line" className="me-1" />
                            Apply to All
                          </>
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                {/* Mode-specific Info */}
                {preferences.defaultGradingMode === 'auto' ? (
                  <Alert variant="warning">
                    <IconifyIcon icon="ri:alert-line" className="me-2" />
                    <strong>Automatic Mode:</strong> Grades will be applied immediately after submission. 
                    Students will see their grades instantly. Make sure your grading criteria are clear!
                  </Alert>
                ) : (
                  <Alert variant="info">
                    <IconifyIcon icon="ri:information-line" className="me-2" />
                    <strong>Manual Review:</strong> AI will analyze submissions and suggest grades. 
                    You&apos;ll review and approve each grade before students see them.
                  </Alert>
                )}
              </>
            )}
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            <>
              <IconifyIcon icon="ri:save-line" className="me-2" />
              Save Global Settings
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

