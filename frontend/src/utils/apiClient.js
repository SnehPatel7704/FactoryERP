const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
      const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      return Promise.reject(new Error(errorData.error || errorData.message));
    }

    if (response.status === 204) {
      return Promise.resolve(null);
    }
    
    // The backend wrapper adds a `success` boolean and wraps the data
    // We can return the whole object and let the caller handle it.
    return response.json();

  } catch (error) {
    console.error('API call failed:', error);
    return Promise.reject(error);
  }
};

const apiClient = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export { apiClient };
export default apiClient;
