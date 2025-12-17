'use client';
import { useState, useEffect } from 'react';
import { 
  Modal, Button, Form, Alert, Badge, 
  Spinner, Card, InputGroup 
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  getAIGradingSettings,
  updateAIGradingSettings,
  generateRubricSuggestions
} from '@/lib/api/aiGrading';

export default function AIGradingSettings({ 
  show, 
  onHide, 
  assignment,
  onSettingsUpdated 
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingRubric, setGeneratingRubric] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    mode: 'manual',
    aiInstructions: '',
    extractCriteria: true
  });
  const [rubric, setRubric] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (show && assignment) {
      loadSettings();
    }
  }, [show, assignment]);

  const loadSettings = async () => {
    if (!assignment?.id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getAIGradingSettings(assignment.id);
      console.log('[AI SETTINGS] Loaded:', data);
      
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('[AI SETTINGS] Load error:', err);
      // If no settings exist yet, that's okay - use defaults
      if (!err.message.includes('404') && !err.message.includes('not found')) {
        setError(`Failed to load settings: ${err.message}`);
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
      await updateAIGradingSettings(assignment.id, settings);
      setSuccess('AI grading settings saved successfully!');
      onSettingsUpdated?.(settings);
      
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      console.error('[AI SETTINGS] Save error:', err);
      setError(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateRubric = async () => {
    setGeneratingRubric(true);
    setError(null);

    try {
      const data = await generateRubricSuggestions(assignment.id);
      console.log('[AI RUBRIC] Generated:', data);
      
      setRubric(data.rubric);
      setSuccess('Rubric generated successfully!');
    } catch (err) {
      console.error('[AI RUBRIC] Generate error:', err);
      setError(`Failed to generate rubric: ${err.message}`);
    } finally {
      setGeneratingRubric(false);
    }
  };

  if (!assignment) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <IconifyIcon icon="ri:robot-line" className="me-2" />
          AI Grading Settings
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Assignment Info */}
        <Card className="mb-3 bg-light">
          <Card.Body>
            <h6 className="mb-1">{assignment.title}</h6>
            <small className="text-muted">
              {assignment.description || 'No description'}
            </small>
          </Card.Body>
        </Card>

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
            <p className="mt-2 text-muted">Loading settings...</p>
          </div>
        ) : (
          <Form>
            {/* Enable AI Grading */}
            <Form.Group className="mb-4">
              <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                <div>
                  <strong>Enable AI Grading</strong>
                  <div className="small text-muted">
                    Let AI automatically grade student submissions
                  </div>
                </div>
                <Form.Check
                  type="switch"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  style={{ fontSize: '1.5rem' }}
                />
              </div>
            </Form.Group>

            {settings.enabled && (
              <>
                {/* Grading Mode */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <IconifyIcon icon="ri:settings-3-line" className="me-2" />
                    <strong>Grading Mode</strong>
                  </Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      label={
                        <div>
                          <strong>Manual Review</strong>
                          <div className="small text-muted">
                            AI suggests grades, you approve/reject
                          </div>
                        </div>
                      }
                      name="mode"
                      checked={settings.mode === 'manual'}
                      onChange={() => setSettings({ ...settings, mode: 'manual' })}
                      className="border p-3 rounded flex-fill"
                    />
                    <Form.Check
                      type="radio"
                      label={
                        <div>
                          <strong>Automatic</strong>
                          <div className="small text-muted">
                            AI grades automatically (instant feedback)
                          </div>
                        </div>
                      }
                      name="mode"
                      checked={settings.mode === 'auto'}
                      onChange={() => setSettings({ ...settings, mode: 'auto' })}
                      className="border p-3 rounded flex-fill"
                    />
                  </div>
                </Form.Group>

                {/* Extract Criteria */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label={
                      <div>
                        <strong>Extract Grading Criteria</strong>
                        <div className="small text-muted">
                          AI will analyze assignment description to identify grading criteria
                        </div>
                      </div>
                    }
                    checked={settings.extractCriteria}
                    onChange={(e) => setSettings({ ...settings, extractCriteria: e.target.checked })}
                  />
                </Form.Group>

                {/* Custom AI Instructions */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <IconifyIcon icon="ri:file-text-line" className="me-2" />
                    <strong>Custom AI Instructions (Optional)</strong>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={settings.aiInstructions}
                    onChange={(e) => setSettings({ ...settings, aiInstructions: e.target.value })}
                    placeholder="E.g., Focus on code quality, check for proper documentation, penalize late submissions by 10%..."
                  />
                  <Form.Text className="text-muted">
                    Provide specific instructions for the AI grader
                  </Form.Text>
                </Form.Group>

                {/* Generate Rubric */}
                <Card className="mb-3 border-primary">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>
                          <IconifyIcon icon="ri:lightbulb-line" className="me-2" />
                          AI Rubric Generator
                        </strong>
                        <div className="small text-muted">
                          Generate a grading rubric based on your assignment
                        </div>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleGenerateRubric}
                        disabled={generatingRubric}
                      >
                        {generatingRubric ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <IconifyIcon icon="ri:magic-line" className="me-1" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>

                    {rubric && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <strong className="d-block mb-2">Generated Rubric:</strong>
                        {rubric.criteria && rubric.criteria.map((criterion, idx) => (
                          <div key={idx} className="mb-2">
                            <Badge bg="primary" className="me-2">{criterion.points} pts</Badge>
                            <strong>{criterion.name}</strong>
                            <div className="small text-muted">{criterion.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Warning for Auto Mode */}
                {settings.mode === 'auto' && (
                  <Alert variant="warning">
                    <IconifyIcon icon="ri:alert-line" className="me-2" />
                    <strong>Automatic Mode:</strong> Grades will be applied immediately after submission. 
                    Students will see their grades instantly. Make sure your grading criteria are clear!
                  </Alert>
                )}

                {/* Info for Manual Mode */}
                {settings.mode === 'manual' && (
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
              Save Settings
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

