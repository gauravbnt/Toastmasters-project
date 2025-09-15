import axios from 'axios'
import toast from 'react-hot-toast'

// Backend server URL without /api prefix
const API_BASE_URL = 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('tm_token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
)

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    const errorData = {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        data: error.config?.data,
        headers: error.config?.headers
      },
      responseHeaders: error.response?.headers
    };
    
    console.error('API Error Details:', JSON.stringify(errorData, null, 2));
    
    // Show more detailed error message in toast
    if (error.response?.data) {
      const errorMessage = error.response.data.message || 
                         error.response.data.error || 
                         'An error occurred';
      toast.error(`Error (${error.response.status}): ${errorMessage}`);
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth data from localStorage
      localStorage.removeItem('tm_token');
      localStorage.removeItem('tm_user');
      
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        // Use window.location instead of useNavigate since this is outside of React component
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }
    
    const message = error.response?.data?.message || 
                  error.message || 
                  'An error occurred';
    
    toast.error(message);
    return Promise.reject(error);
  }
)

export default api
