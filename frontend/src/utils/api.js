const BASE_URL = 'http://localhost:8080/api';

const finalRequest = async (method, endpoint, body = null) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers();
  if (body) {
    headers.append('Content-Type', 'application/json');
  }

  const options = {
    method,
    headers,
    credentials: 'include', // CRITICAL: ensures session cookies are transmitted cross-origin
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = (data && data.error) ? data.error : 'An error occurred';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${method} ${endpoint}:`, error);
    throw error;
  }
};

export const api = {
  get: (endpoint) => finalRequest('GET', endpoint),
  post: (endpoint, body) => finalRequest('POST', endpoint, body),
  put: (endpoint, body) => finalRequest('PUT', endpoint, body),
  delete: (endpoint) => finalRequest('DELETE', endpoint),
};
