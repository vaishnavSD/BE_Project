import axios from 'axios';

// Backend API base URLs
export const API_BASE_URLS = [
  'http://10.249.247.190:5000/api', // Current Wi-Fi IP (for Android/mobile)
  'http://localhost:5000/api',      // Local development (for web/simulator)
  'http://10.119.10.133:5000/api',  // Previous Wi-Fi IP
  'http://10.66.57.142:5000/api',   // Previous Wi-Fi IP
  'http://10.177.131.162:5000/api', // Ethernet IP
  'http://192.168.1.100:5000/api',  // Common router IP
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
  let lastWorkingEndpoint: string | null = null;
  
  const makeRequest = async (method: string, url: string, data?: any) => {
    const errors: any[] = [];
    
    // Try last working endpoint first if available
    const endpointsToTry = lastWorkingEndpoint 
      ? [lastWorkingEndpoint, ...API_BASE_URLS.filter(url => url !== lastWorkingEndpoint)]
      : API_BASE_URLS;
    
    for (const baseURL of endpointsToTry) {
      try {
        const client = axios.create({
          baseURL,
          timeout: 3000, // Reduced timeout for faster fallback
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const response = await client.request({
          method,
          url,
          data,
        });
        
        // Cache successful endpoint
        lastWorkingEndpoint = baseURL;
        console.log(`✅ API connected: ${baseURL}`);
        return response;
      } catch (error: any) {
        errors.push({ baseURL, error: error.message });
        continue;
      }
    }
    
    // Only log summary when all fail
    console.log(`📡 All ${errors.length} API endpoints unavailable - using offline mode`);
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
