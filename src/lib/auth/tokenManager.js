/**
 * Token and user data management utilities
 */

const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

/**
 * Save authentication token
 * @param {string} token - JWT token
 */
export function saveToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Get authentication token
 * @returns {string|null} JWT token or null
 */
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove authentication token
 */
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Save user data
 * @param {Object} userData - User data object
 */
export function saveUserData(userData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }
}

/**
 * Get user data
 * @returns {Object|null} User data object or null
 */
export function getUserData() {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

/**
 * Remove user data
 */
export function removeUserData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_DATA_KEY);
  }
}

/**
 * Save complete authentication response
 * @param {Object} authResponse - Response from login/signup API
 */
export function saveAuthData(authResponse) {
  if (authResponse.token) {
    saveToken(authResponse.token);
  }
  if (authResponse.user) {
    saveUserData(authResponse.user);
  }
}

/**
 * Clear all authentication data
 */
export function clearAuthData() {
  removeToken();
  removeUserData();
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Get user role
 * @returns {string|null} User role or null
 */
export function getUserRole() {
  const userData = getUserData();
  return userData?.role || null;
}

