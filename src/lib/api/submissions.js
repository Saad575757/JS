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

// ==================== SUBMISSIONS ====================

/**
 * Submit an assignment
 * @param {Object} submissionData - Submission data
 * @param {number} submissionData.assignmentId - Assignment ID
 * @param {string} submissionData.submissionText - Optional submission text
 * @param {Array} submissionData.attachments - Array of attachment objects
 * @returns {Promise<Object>} Created submission
 */
export const submitAssignment = async (submissionData) => {
  console.log('[API] Submitting assignment:', submissionData);
  return apiCall('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(submissionData),
  });
};

/**
 * Get all submissions by the logged-in student
 * @returns {Promise<Array>} List of submissions
 */
export const getMySubmissions = async () => {
  console.log('[API] Fetching my submissions');
  return apiCall('/api/submissions/my-submissions');
};

/**
 * Get student's submission for a specific assignment
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} Submission details
 */
export const getMySubmissionForAssignment = async (assignmentId) => {
  console.log('[API] Fetching my submission for assignment:', assignmentId);
  try {
    const response = await apiCall(`/api/submissions/assignment/${assignmentId}`);
    console.log('[API] Submission response for assignment', assignmentId, ':', response);
    return response;
  } catch (error) {
    // If 404 or no submission found, return null instead of throwing
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.log('[API] No submission found for assignment:', assignmentId);
      return null;
    }
    throw error;
  }
};

/**
 * Update a submission (if allowed)
 * @param {number} submissionId - Submission ID
 * @param {Object} submissionData - Updated submission data
 * @returns {Promise<Object>} Updated submission
 */
export const updateSubmission = async (submissionId, submissionData) => {
  console.log('[API] Updating submission:', submissionId);
  return apiCall(`/api/submissions/${submissionId}`, {
    method: 'PUT',
    body: JSON.stringify(submissionData),
  });
};

/**
 * Delete a submission (if allowed)
 * @param {number} submissionId - Submission ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteSubmission = async (submissionId) => {
  console.log('[API] Deleting submission:', submissionId);
  return apiCall(`/api/submissions/${submissionId}`, {
    method: 'DELETE',
  });
};

/**
 * Get all submissions for an assignment (Teachers only)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} All submissions with details
 */
export const getAllSubmissionsForAssignment = async (assignmentId) => {
  console.log('[API] Fetching all submissions for assignment:', assignmentId);
  return apiCall(`/api/submissions/assignment/${assignmentId}/all`);
};

/**
 * Grade a submission (Teachers only)
 * @param {number} submissionId - Submission ID
 * @param {number} grade - Grade value
 * @param {string} feedback - Optional feedback
 * @returns {Promise<Object>} Updated submission
 */
export const gradeSubmission = async (submissionId, grade, feedback = '') => {
  console.log('[API] Grading submission:', submissionId, 'Grade:', grade);
  return apiCall(`/api/submissions/${submissionId}/grade`, {
    method: 'POST',
    body: JSON.stringify({ grade, feedback }),
  });
};

