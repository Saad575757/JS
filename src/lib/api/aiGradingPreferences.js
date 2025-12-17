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

// ==================== GLOBAL AI GRADING PREFERENCES ====================

/**
 * Get teacher's global AI grading preferences
 * @returns {Promise<Object>} AI grading preferences
 */
export const getAIGradingPreferences = async () => {
  console.log('[AI PREFS] Fetching global AI grading preferences');
  return apiCall('/api/ai-grading/preferences');
};

/**
 * Update teacher's global AI grading preferences
 * @param {Object} preferences - AI grading preferences
 * @param {boolean} preferences.aiGradingEnabled - Enable/disable AI grading globally
 * @param {string} preferences.defaultGradingMode - "manual" or "auto"
 * @param {string} preferences.defaultAiInstructions - Default custom instructions
 * @param {boolean} preferences.autoApplyToNewAssignments - Auto-apply to new assignments
 * @returns {Promise<Object>} Updated preferences
 */
export const updateAIGradingPreferences = async (preferences) => {
  console.log('[AI PREFS] Updating global preferences:', preferences);
  return apiCall('/api/ai-grading/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
};

/**
 * Apply global AI settings to all existing assignments
 * @returns {Promise<Object>} Application result
 */
export const applyAISettingsToAllAssignments = async () => {
  console.log('[AI PREFS] Applying settings to all assignments');
  return apiCall('/api/ai-grading/preferences/apply-to-all', {
    method: 'POST',
  });
};

