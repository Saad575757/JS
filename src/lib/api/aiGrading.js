import { getToken } from '../auth/tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Generic API call wrapper with authentication
 */
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ==================== AI GRADING ====================

/**
 * Enable or update AI grading settings for an assignment
 * @param {number} assignmentId - Assignment ID
 * @param {Object} settings - AI grading settings
 * @param {boolean} settings.enabled - Enable/disable AI grading
 * @param {string} settings.mode - "manual" or "auto"
 * @param {string} settings.aiInstructions - Optional custom instructions
 * @param {boolean} settings.extractCriteria - Extract grading criteria from assignment
 * @returns {Promise<Object>} Updated settings
 */
export const updateAIGradingSettings = async (assignmentId, settings) => {
  console.log('[AI GRADING] Updating settings for assignment:', assignmentId, settings);
  return apiCall(`/api/ai-grading/settings/${assignmentId}`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

/**
 * Get AI grading settings for an assignment
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} AI grading settings
 */
export const getAIGradingSettings = async (assignmentId) => {
  console.log('[AI GRADING] Fetching settings for assignment:', assignmentId);
  return apiCall(`/api/ai-grading/settings/${assignmentId}`);
};

/**
 * Generate rubric suggestions using AI
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} Generated rubric
 */
export const generateRubricSuggestions = async (assignmentId) => {
  console.log('[AI GRADING] Generating rubric for assignment:', assignmentId);
  return apiCall(`/api/ai-grading/rubric/${assignmentId}`, {
    method: 'POST',
  });
};

/**
 * Get pending AI grades for review (manual mode)
 * @returns {Promise<Object>} List of pending grades
 */
export const getPendingAIGrades = async () => {
  console.log('[AI GRADING] Fetching pending AI grades');
  return apiCall('/api/ai-grading/pending');
};

/**
 * Approve an AI-generated grade
 * @param {number} gradeId - Grade ID
 * @param {string} approvalToken - Approval token
 * @returns {Promise<Object>} Approval confirmation
 */
export const approveAIGrade = async (gradeId, approvalToken) => {
  console.log('[AI GRADING] Approving grade:', gradeId);
  return apiCall(`/api/ai-grading/approve/${gradeId}`, {
    method: 'POST',
    body: JSON.stringify({ approvalToken }),
  });
};

/**
 * Reject an AI-generated grade
 * @param {number} gradeId - Grade ID
 * @param {string} approvalToken - Approval token
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection confirmation
 */
export const rejectAIGrade = async (gradeId, approvalToken, reason = '') => {
  console.log('[AI GRADING] Rejecting grade:', gradeId);
  return apiCall(`/api/ai-grading/reject/${gradeId}`, {
    method: 'POST',
    body: JSON.stringify({ approvalToken, reason }),
  });
};

/**
 * Trigger AI grading for a specific submission (manual mode)
 * @param {number} submissionId - Submission ID
 * @returns {Promise<Object>} AI grading result
 */
export const triggerAIGrading = async (submissionId) => {
  console.log('[AI GRADING] Triggering AI grading for submission:', submissionId);
  return apiCall(`/api/ai-grading/grade/${submissionId}`, {
    method: 'POST',
  });
};

