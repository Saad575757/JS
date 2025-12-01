/**
 * Automation API utilities for Xytek Automation API
 */

import { getToken } from '@/lib/auth/tokenManager';

const API_BASE_URL = 'https://class.xytek.ai/api';

/**
 * Get all agents
 */
export async function getAgents() {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/agents`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch agents');
  return response.json();
}

/**
 * Get agent by ID
 */
export async function getAgent(agentId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/agents/${agentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch agent');
  return response.json();
}

/**
 * Create new agent
 */
export async function createAgent(agentData) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/agents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agentData),
  });

  if (!response.ok) throw new Error('Failed to create agent');
  return response.json();
}

/**
 * Update agent
 */
export async function updateAgent(agentId, agentData) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/agents/${agentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agentData),
  });

  if (!response.ok) throw new Error('Failed to update agent');
  return response.json();
}

/**
 * Delete agent
 */
export async function deleteAgent(agentId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/agents/${agentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to delete agent');
  return response.json();
}

/**
 * Toggle agent status
 */
export async function toggleAgentStatus(agentId, status) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/agents/${agentId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) throw new Error('Failed to update agent status');
  return response.json();
}

/**
 * Get Gmail OAuth URL
 */
export async function getGmailAuthUrl(agentId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/agents/${agentId}/gmail/auth`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to get Gmail auth URL');
  return response.json();
}

/**
 * Get agent workflows
 */
export async function getAgentWorkflows(agentId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/agents/${agentId}/workflows`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch workflows');
  return response.json();
}

/**
 * Create workflow
 */
export async function createWorkflow(workflowData) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/workflows`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflowData),
  });

  if (!response.ok) throw new Error('Failed to create workflow');
  return response.json();
}

/**
 * Get workflow by ID
 */
export async function getWorkflow(workflowId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/workflows/${workflowId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch workflow');
  return response.json();
}

/**
 * Update workflow
 */
export async function updateWorkflow(workflowId, workflowData) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/workflows/${workflowId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflowData),
  });

  if (!response.ok) throw new Error('Failed to update workflow');
  return response.json();
}

/**
 * Delete workflow
 */
export async function deleteWorkflow(workflowId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/workflows/${workflowId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to delete workflow');
  return response.json();
}

/**
 * Execute workflow manually with optional data
 */
export async function executeWorkflow(workflowId, data = null) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/workflows/${workflowId}/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify({ data }) : JSON.stringify({}),
  });

  if (!response.ok) throw new Error('Failed to execute workflow');
  return response.json();
}

/**
 * Get agent executions
 */
export async function getAgentExecutions(agentId, params = {}) {
  const token = getToken();
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/automation/agents/${agentId}/executions${queryString ? '?' + queryString : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch executions');
  return response.json();
}

/**
 * Get agent statistics
 */
export async function getAgentStats(agentId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/automation/agents/${agentId}/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

