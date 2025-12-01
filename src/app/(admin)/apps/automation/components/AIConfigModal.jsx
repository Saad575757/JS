'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
  Badge,
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAIConfig, saveAIConfig, testAIConfig } from '@/lib/api/aiConfig';

export default function AIConfigModal({ show, onHide, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Form state
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [isDefault, setIsDefault] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (show) {
      loadConfig();
    }
  }, [show]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getAIConfig();
      if (data.config) {
        setProvider(data.config.provider || 'openai');
        setApiKey(data.config.apiKey || '');
        setModelName(data.config.modelName || 'gpt-4o-mini');
        setIsDefault(data.config.isDefault !== false);
      }
    } catch (err) {
      // No config yet, use defaults
      console.log('No AI config found, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await saveAIConfig({
        provider,
        apiKey,
        modelName,
        isDefault,
      });
      setSuccess('AI configuration saved successfully!');
      setTimeout(() => {
        if (onSaved) onSaved();
        onHide();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const result = await testAIConfig();
      setTestResult(result);
      if (result.success) {
        setSuccess('✅ AI connection successful!');
      }
    } catch (err) {
      setError(err.message);
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const openAIModels = [
    { value: 'gpt-4o', label: 'GPT-4o (Latest, Most Capable)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Affordable) ⭐' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Budget)' },
  ];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="ri:sparkling-line" className="me-2" />
          AI Configuration
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSave}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Alert variant="info" className="mb-4">
            <IconifyIcon icon="ri:information-line" className="me-2" />
            <strong>Your API Key, Your Control</strong>
            <p className="mb-0 mt-2 small">
              Configure your own OpenAI API key for AI-powered automation. 
              Your key is encrypted and securely stored. You're only charged 
              by OpenAI for your usage.
            </p>
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>
              <IconifyIcon icon="ri:robot-2-line" className="me-1" />
              AI Provider
            </Form.Label>
            <Form.Select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              required
            >
              <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <IconifyIcon icon="ri:key-2-line" className="me-1" />
              API Key
            </Form.Label>
            <InputGroup>
              <Form.Control
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                <IconifyIcon
                  icon={showApiKey ? 'ri:eye-off-line' : 'ri:eye-line'}
                />
              </Button>
            </InputGroup>
            <Form.Text className="text-muted">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAI Platform
              </a>
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <IconifyIcon icon="ri:brain-line" className="me-1" />
              Model
            </Form.Label>
            <Form.Select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              required
            >
              {openAIModels.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              GPT-4o Mini is recommended for most use cases (fast & affordable)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="isDefault"
              label="Set as default AI provider for all agents"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
          </Form.Group>

          {testResult && (
            <Alert variant={testResult.success ? 'success' : 'danger'}>
              <strong>Test Result:</strong>
              <pre className="mb-0 mt-2" style={{ fontSize: '0.85rem' }}>
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </Alert>
          )}

          <div className="d-grid">
            <Button
              variant="outline-primary"
              onClick={handleTest}
              disabled={!apiKey || testing}
            >
              {testing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <IconifyIcon icon="ri:flask-line" className="me-2" />
                  Test AI Connection
                </>
              )}
            </Button>
          </div>

          <hr className="my-4" />

          <div className="bg-light p-3 rounded">
            <h6 className="mb-2">
              <IconifyIcon icon="ri:lightbulb-line" className="me-1" />
              Pricing Information
            </h6>
            <small className="text-muted">
              <ul className="mb-0">
                <li>
                  <strong>GPT-4o Mini:</strong> ~$0.15 per 1M input tokens, ~$0.60
                  per 1M output tokens
                </li>
                <li>
                  <strong>GPT-4o:</strong> ~$2.50 per 1M input tokens, ~$10 per 1M
                  output tokens
                </li>
                <li>Typical email reply: 200-500 tokens (~$0.0001-0.0005)</li>
                <li>You control costs by managing your workflows</li>
              </ul>
            </small>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || !apiKey}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:save-line" className="me-2" />
                Save Configuration
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

