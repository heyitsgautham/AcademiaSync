/**
 * API Client for making requests to backend services
 * Automatically includes access token from NextAuth session
 */

import { getSession } from "next-auth/react";

const COURSE_SERVICE_URL = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'http://localhost:5001';

/**
 * Make an API request with automatic token handling from NextAuth session
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add custom headers from options
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  // Get backend access token from NextAuth session
  const session = await getSession();
  if (session && (session as any).backendAccessToken) {
    headers['Authorization'] = `Bearer ${(session as any).backendAccessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Course Service API Client
 */
export const courseApi = {
  // Courses
  getCourses: () =>
    apiRequest<any[]>(`${COURSE_SERVICE_URL}/api/teacher/courses`),

  getCourse: (id: number | string) =>
    apiRequest<any>(`${COURSE_SERVICE_URL}/api/teacher/courses/${id}`),

  createCourse: (data: { title: string; description: string; weeks?: number }) =>
    apiRequest<any>(`${COURSE_SERVICE_URL}/api/teacher/courses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCourse: (id: number | string, data: { title: string; description: string; weeks?: number }) =>
    apiRequest<any>(`${COURSE_SERVICE_URL}/api/teacher/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCourse: (id: number | string) =>
    apiRequest<void>(`${COURSE_SERVICE_URL}/api/teacher/courses/${id}`, {
      method: 'DELETE',
    }),

  // Assignments
  getAssignments: (courseId: number | string) =>
    apiRequest<any[]>(`${COURSE_SERVICE_URL}/api/teacher/courses/${courseId}/assignments`),

  getAssignment: (id: number | string) =>
    apiRequest<any>(`${COURSE_SERVICE_URL}/api/teacher/assignments/${id}`),

  createAssignment: (courseId: number | string, data: { title: string; description: string; due_date?: string }) =>
    apiRequest<any>(`${COURSE_SERVICE_URL}/api/teacher/courses/${courseId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAssignment: (id: number | string, data: { title: string; description: string; due_date?: string }) =>
    apiRequest<any>(`${COURSE_SERVICE_URL}/api/teacher/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAssignment: (id: number | string) =>
    apiRequest<void>(`${COURSE_SERVICE_URL}/api/teacher/assignments/${id}`, {
      method: 'DELETE',
    }),
};
