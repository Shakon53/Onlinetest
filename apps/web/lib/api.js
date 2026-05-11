const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lms_token') : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function saveSession({ token, user }) {
  if (token) localStorage.setItem('lms_token', token);
  localStorage.setItem('lms_user', JSON.stringify(user));
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('lms_user');
  return stored ? JSON.parse(stored) : null;
}

export function logout() {
  localStorage.removeItem('lms_token');
  localStorage.removeItem('lms_user');
}
