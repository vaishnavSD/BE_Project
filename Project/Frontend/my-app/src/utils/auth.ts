import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  name: string;
  email: string;
  mobile_No: string;
  address: string;
  role: 'admin' | 'agent';
}

// In-memory cache for user data to provide synchronous access
let userCache: User | null = null;
let cacheInitialized = false;

// Initialize cache from AsyncStorage
const initializeCache = async (): Promise<void> => {
  if (cacheInitialized) return;
  
  try {
    const userStr = await AsyncStorage.getItem('user');
    userCache = userStr ? JSON.parse(userStr) : null;
    cacheInitialized = true;
  } catch (error) {
    console.error('Error initializing user cache:', error);
    userCache = null;
    cacheInitialized = true;
  }
};

// Get current user from cache (synchronous)
export const getCurrentUser = (): User | null => {
  if (!cacheInitialized) {
    // Initialize cache asynchronously but return null for now
    initializeCache();
    return null;
  }
  return userCache;
};

// Async version for when you need to ensure cache is loaded
export const getCurrentUserAsync = async (): Promise<User | null> => {
  await initializeCache();
  return userCache;
};

// Save user to storage and update cache
export const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    userCache = user;
    cacheInitialized = true;
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Remove user from storage and clear cache
export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('user');
    userCache = null;
    cacheInitialized = true;
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Check if user has specific role
export const hasRole = (role: 'admin' | 'agent'): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

// Check if user is admin
export const isAdmin = (): boolean => {
  return hasRole('admin');
};

// Check if user is agent
export const isAgent = (): boolean => {
  return hasRole('agent');
};

// Initialize cache when module loads
initializeCache();
