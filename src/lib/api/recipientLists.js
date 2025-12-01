/**
 * Recipient Lists API utilities
 */

import { getToken } from '@/lib/auth/tokenManager';

const API_BASE_URL = 'https://class.xytek.ai/api';

/**
 * Get all recipient lists
 */
export async function getRecipientLists(agentId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/recipient-lists?agentId=${agentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch recipient lists');
  return response.json();
}

/**
 * Upload CSV recipient list
 */
export async function uploadRecipientList(agentId, name, csvFile) {
  const token = getToken();
  const formData = new FormData();
  formData.append('csv', csvFile);
  formData.append('name', name);
  formData.append('agentId', agentId);

  const response = await fetch(`${API_BASE_URL}/automation/recipient-lists/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to upload recipient list');
  return response.json();
}

/**
 * Get recipient list by ID
 */
export async function getRecipientList(listId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/recipient-lists/${listId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch recipient list');
  return response.json();
}

/**
 * Delete recipient list
 */
export async function deleteRecipientList(listId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/recipient-lists/${listId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to delete recipient list');
  return response.json();
}

