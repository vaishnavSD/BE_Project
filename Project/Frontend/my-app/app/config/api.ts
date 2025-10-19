import axios from 'axios';

// Backend API base URLs
export const API_BASE_URLS = [
  'http://10.119.10.133:5000/api',  // Current Wi-Fi IP
  'http://10.66.57.142:5000/api',   // Previous Wi-Fi IP
  'http://10.177.131.162:5000/api', // Ethernet IP
  'http://192.168.1.100:5000/api',  // Common router IP
  'http://localhost:5000/api',      // Local development
];

export const API_BASE_URL = API_BASE_URLS[0];

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Robust API client that tries multiple endpoints
export const createRobustApiClient = () => {
  const makeRequest = async (method: string, url: string, data?: any) => {
    const errors: any[] = [];
    
    for (const baseURL of API_BASE_URLS) {
      try {
        console.log(`Trying API: ${baseURL}${url}`);
        
        const client = axios.create({
          baseURL,
          timeout: 8000,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const response = await client.request({
          method,
          url,
          data,
        });
        
        console.log(`Success with: ${baseURL}${url}`);
        return response;
      } catch (error: any) {
        console.log(`Failed with ${baseURL}${url}:`, error.message);
        errors.push({ baseURL, error: error.message });
        continue;
      }
    }
    
    console.log('All API endpoints failed:', errors);
    throw new Error('Unable to connect to server');
  };
  
  return {
    get: (url: string) => makeRequest('GET', url),
    post: (url: string, data: any) => makeRequest('POST', url, data),
    put: (url: string, data: any) => makeRequest('PUT', url, data),
    delete: (url: string) => makeRequest('DELETE', url),
  };
};

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  LOGIN: '/user/login',
  REGISTER: '/user/register',
  USERS: '/user',
  
  // Scrap details endpoints
  SCRAP_DETAILS: '/scrapDetails',
  
  // User requests endpoints
  USER_REQUESTS: '/userRequests',
  USER_REQUESTS_GET: '/userRequests/get',
  
  // Collection endpoints
  COLLECTION: '/collection',
  
  // Reports endpoints
  REPORTS: '/reports',
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default apiClient;
