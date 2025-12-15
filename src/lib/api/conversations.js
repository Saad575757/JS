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

// ==================== CONVERSATIONS ====================

/**
 * Get all conversations for the current user
 * @returns {Promise<Array>} List of conversations
 */
export const getAllConversations = async () => {
  return apiCall('/api/conversations');
};

/**
 * Get a specific conversation with all messages
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object>} Conversation with messages
 */
export const getConversation = async (conversationId) => {
  return apiCall(`/api/conversations/${conversationId}`);
};

/**
 * Create a new conversation
 * @param {Object} data - Conversation data (title, etc.)
 * @returns {Promise<Object>} Created conversation
 */
export const createConversation = async (data = {}) => {
  return apiCall('/api/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Rename a conversation (update title)
 * @param {string} conversationId - The conversation ID
 * @param {string} newTitle - The new title
 * @returns {Promise<Object>} Updated conversation
 */
export const renameConversation = async (conversationId, newTitle) => {
  return apiCall(`/api/conversations/${conversationId}/title`, {
    method: 'PATCH',
    body: JSON.stringify({ title: newTitle }),
  });
};

/**
 * Delete a conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteConversation = async (conversationId) => {
  return apiCall(`/api/conversations/${conversationId}`, {
    method: 'DELETE',
  });
};

/**
 * Search conversations
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching conversations
 */
export const searchConversations = async (query) => {
  return apiCall(`/api/conversations/search?q=${encodeURIComponent(query)}`);
};

/**
 * Get conversation statistics
 * @returns {Promise<Object>} Conversation stats
 */
export const getConversationStats = async () => {
  return apiCall('/api/conversations/stats');
};

