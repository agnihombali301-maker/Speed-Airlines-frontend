const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('token');
}

/**
 * Single API caller. Always sends token when present: in Authorization header,
 * and for POST/PUT in body as 'token', and for GET in query as ?token=.
 * Backend reads from body, query, or header so auth works even if proxy strips headers.
 */
export async function api(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + String(token).trim();
    headers['X-Auth-Token'] = token;
  }
  let finalUrl = url;
  let finalBody = options.body;
  if (token) {
    const sep = url.includes('?') ? '&' : '?';
    finalUrl = `${url}${sep}token=${encodeURIComponent(token)}`;
    if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method) && options.body) {
      try {
        const parsed = JSON.parse(options.body);
        parsed.token = token;
        finalBody = JSON.stringify(parsed);
      } catch (_) {}
    }
  }
  const res = await fetch(`${API_BASE}${finalUrl}`, { ...options, headers, body: finalBody });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
    }
    const msg = data.error || (res.status === 401 || res.status === 422 ? 'Your session may have expired. Please sign in again.' : res.statusText);
    throw new Error(msg);
  }
  return data;
}

export const auth = {
  questions: () => api('/auth/questions'),
  forgotPasswordQuestions: (username) => api('/auth/forgot-password-questions?username=' + encodeURIComponent(username)),
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => api('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  changePassword: (body) => api('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  me: () => {
    const token = getToken();
    if (!token) return Promise.reject(new Error('Please sign in again.'));
    return api('/auth/me', { method: 'POST', body: JSON.stringify({ token }) });
  },
};

export const flights = {
  list: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api(q ? '/flights?' + q : '/flights');
  },
  get: (id) => api(`/flights/${id}`),
  destinations: () => api('/flights/destinations'),
};

export const bookings = {
  list: () => api('/bookings/'),
  create: (body) => api('/bookings/', { method: 'POST', body: JSON.stringify(body) }),
  get: (id) => api(`/bookings/${id}`),
};

export const admin = {
  users: () => api('/admin/users'),
  user: (id, method, body) => api(`/admin/users/${id}`, { method: method || 'GET', ...(body && { body: JSON.stringify(body) }) }),
  createFlight: (body) => api('/admin/flights', { method: 'POST', body: JSON.stringify(body) }),
  updateFlight: (id, body) => api(`/admin/flights/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteFlight: (id) => api(`/admin/flights/${id}`, { method: 'DELETE' }),
  updateBooking: (id, body) => api(`/admin/bookings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBooking: (id) => api(`/admin/bookings/${id}`, { method: 'DELETE' }),
};
