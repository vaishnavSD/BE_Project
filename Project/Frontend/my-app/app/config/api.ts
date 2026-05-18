import axios from 'axios';

// Backend API base URLs - Environment-based configuration
export const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api', // Primary API URL
  'http://10.136.44.142:5000/api',       // Android Emulator
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

// Global cache for last working endpoint and client
let globalLastWorkingEndpoint: string | null = null;
let globalWorkingClient: any = null;

// Robust API client that tries multiple endpoints
export const createRobustApiClient = () => {
  const makeRequest = async (method: string, url: string, data?: any) => {
    // If we have a working client, try it first
    if (globalWorkingClient && globalLastWorkingEndpoint) {
      try {
        console.log(`🔄 Using cached endpoint: ${globalLastWorkingEndpoint}${url}`);
        const response = await globalWorkingClient.request({
          method,
          url,
          data,
        });
        return response;
      } catch (error: any) {
        console.log(`⚠️ Cached endpoint failed, trying alternatives...`);
        // Clear cache and try all endpoints
        globalWorkingClient = null;
        globalLastWorkingEndpoint = null;
      }
    }
    
    const errors: any[] = [];
    
    // Try last working endpoint first if available
    const endpointsToTry = globalLastWorkingEndpoint 
      ? [globalLastWorkingEndpoint, ...API_BASE_URLS.filter(u => u !== globalLastWorkingEndpoint)]
      : API_BASE_URLS;
    
    for (const baseURL of endpointsToTry) {
      try {
        const client = axios.create({
          baseURL,
          timeout: 8000, // Increased timeout to 8 seconds
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const response = await client.request({
          method,
          url,
          data,
        });
        
        // Cache successful endpoint and client globally
        globalLastWorkingEndpoint = baseURL;
        globalWorkingClient = client;
        console.log(`✅ API connected: ${baseURL}`);
        return response;
      } catch (error: any) {
        const errorDetail = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
        console.log(`❌ Failed ${baseURL}${url}: ${errorDetail}`);
        errors.push({ 
          baseURL, 
          error: errorDetail, 
          code: error.code,
          status: error.response?.status,
          fullError: error.response?.data
        });
        
        // If we get a 400 error (validation error), don't try other endpoints
        if (error.response?.status === 400) {
          console.log('🛑 Validation error from server:', error.response.data);
          throw error; // Throw immediately with the actual error
        }
        continue;
      }
    }
    
    // Log detailed errors
    console.log(`📡 All ${errors.length} API endpoints failed:`);
    errors.forEach((e, i) => console.log(`  ${i + 1}. ${e.baseURL}: ${e.error}`));
    
    // Throw error with more details
    const errorMsg = errors[0]?.error || 'Unable to connect to server';
    throw new Error(errorMsg);
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
  USER_REQUESTS_APPROVED: '/userRequests/approved',
  USER_REQUESTS_CALL_AGENT_APPROVE: '/userRequests/:id/call-agent-approve',
  USER_REQUESTS_AGENT_ACCEPT: '/userRequests/:id/agent-accept',
  USER_REQUESTS_BY_CALL_AGENT: '/userRequests/call-agent/:callAgentId',
  USER_REQUESTS_AGENT_PENDING: '/userRequests/agent/:agentId/pending',
  USER_REQUESTS_COLLECT: '/userRequests/:id/collect',
  
  // Collection endpoints
  COLLECTION: '/collection',
  COLLECTION_ADD: '/collection/add',
  COLLECTION_GET: '/collection/get',
  COLLECTION_BY_AGENT: '/collection/agent/:agent_MobileNo',
  
  // Reports endpoints
  REPORTS: '/reports',
  REPORTS_AGENTS_LIST: '/reports/agents-list',
  REPORTS_FILTERED: '/reports/filtered-report',
  
  // Factory endpoints
  FACTORY_DASHBOARD_STATS: '/factory/dashboard/stats',
  FACTORY_PENDING_COLLECTIONS: '/factory/pending',
  FACTORY_COLLECTED_COLLECTIONS: '/factory/collected',
  FACTORY_COLLECTION_DETAILS: '/factory/collection',
  FACTORY_APPROVE_COLLECTION: '/factory/collection',
};

// Response interceptor
if (apiClient.interceptors) {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );
}

export default apiClient;
