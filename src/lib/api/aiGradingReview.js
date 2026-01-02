import { getToken } from '../auth/tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Get AI grade details by review token
 * @param {string} token - Review token from email
 * @returns {Promise<Object>} Grade details
 */
export const getGradeByToken = async (token) => {
  console.log('[AI REVIEW] Fetching grade with token:', token);
  
  // Get JWT token if user is logged in (optional)
  const authToken = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Include Authorization header if user is logged in
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('[AI REVIEW] Including auth token from logged-in user');
  } else {
    console.log('[AI REVIEW] No auth token - using review token only');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/ai-grading/grade/${token}`, {
    headers
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch grade' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('[AI REVIEW] Grade data:', data);
  return data;
};

/**
 * Approve AI-generated grade
 * @param {string} token - Review token
 * @returns {Promise<Object>} Approval result
 */
export const approveGradeByToken = async (token) => {
  console.log('[AI REVIEW] Approving grade with token:', token);
  
  // Get JWT token if user is logged in (optional)
  const authToken = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Include Authorization header if user is logged in
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('[AI REVIEW] Including auth token from logged-in user');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/ai-grading/approve/${token}`, {
    method: 'POST',
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve grade' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('[AI REVIEW] Approval result:', data);
  return data;
};

/**
 * Reject AI-generated grade
 * @param {string} token - Review token
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection result
 */
export const rejectGradeByToken = async (token, reason) => {
  console.log('[AI REVIEW] Rejecting grade with token:', token);
  
  // Get JWT token if user is logged in (optional)
  const authToken = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Include Authorization header if user is logged in
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('[AI REVIEW] Including auth token from logged-in user');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/ai-grading/reject/${token}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reject grade' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('[AI REVIEW] Rejection result:', data);
  return data;
};

