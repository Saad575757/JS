/**
 * AI Configuration API utilities
 */

import { getToken } from '@/lib/auth/tokenManager';

const API_BASE_URL = 'https://class.xytek.ai/api';

/**
 * Get user's AI configuration
 */
export async function getAIConfig() {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/ai-config`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch AI configuration');
  return response.json();
}

/**
 * Create or update AI configuration
 */
export async function saveAIConfig(config) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/ai-config`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) throw new Error('Failed to save AI configuration');
  return response.json();
}

/**
 * Delete AI configuration
 */
export async function deleteAIConfig() {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/ai-config`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to delete AI configuration');
  return response.json();
}

/**
 * Test AI configuration
 */
export async function testAIConfig() {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/ai-config/test`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to test AI configuration');
  return response.json();
}

