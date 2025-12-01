import { getToken } from '@/lib/auth/tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper function to make authenticated API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ==================== COURSES ====================

export const getCourses = async () => {
  return apiCall('/api/courses');
};

export const createCourse = async (courseData) => {
  return apiCall('/api/courses', {
    method: 'POST',
    body: JSON.stringify(courseData),
  });
};

export const getCourse = async (courseId) => {
  return apiCall(`/api/courses/${courseId}`);
};

export const getCourseStudents = async (courseId) => {
  return apiCall(`/api/courses/${courseId}/students`);
};

export const updateCourse = async (courseId, courseData) => {
  return apiCall(`/api/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(courseData),
  });
};

export const deleteCourse = async (courseId) => {
  return apiCall(`/api/courses/${courseId}`, {
    method: 'DELETE',
  });
};

// ==================== ASSIGNMENTS ====================

export const getAssignmentsByCourse = async (courseId) => {
  return apiCall(`/api/assignments/course/${courseId}`);
};

export const createAssignment = async (assignmentData) => {
  return apiCall('/api/assignments', {
    method: 'POST',
    body: JSON.stringify(assignmentData),
  });
};

export const getAssignment = async (assignmentId) => {
  return apiCall(`/api/assignments/${assignmentId}`);
};

export const updateAssignment = async (assignmentId, assignmentData) => {
  return apiCall(`/api/assignments/${assignmentId}`, {
    method: 'PUT',
    body: JSON.stringify(assignmentData),
  });
};

export const deleteAssignment = async (assignmentId) => {
  return apiCall(`/api/assignments/${assignmentId}`, {
    method: 'DELETE',
  });
};

export const getUpcomingAssignments = async (days = 7) => {
  return apiCall(`/api/assignments/upcoming?days=${days}`);
};

// ==================== ANNOUNCEMENTS ====================

export const getAnnouncementsByCourse = async (courseId) => {
  return apiCall(`/api/announcements/course/${courseId}`);
};

export const getAllAnnouncements = async (limit = 50, offset = 0) => {
  return apiCall(`/api/announcements?limit=${limit}&offset=${offset}`);
};

export const createAnnouncement = async (announcementData) => {
  return apiCall('/api/announcements', {
    method: 'POST',
    body: JSON.stringify(announcementData),
  });
};

export const getAnnouncement = async (announcementId) => {
  return apiCall(`/api/announcements/${announcementId}`);
};

export const updateAnnouncement = async (announcementId, announcementData) => {
  return apiCall(`/api/announcements/${announcementId}`, {
    method: 'PUT',
    body: JSON.stringify(announcementData),
  });
};

export const deleteAnnouncement = async (announcementId) => {
  return apiCall(`/api/announcements/${announcementId}`, {
    method: 'DELETE',
  });
};

