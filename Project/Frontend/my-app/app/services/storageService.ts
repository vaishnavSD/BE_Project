// Simple storage service for offline functionality
// In a real app, you'd use AsyncStorage from @react-native-async-storage/async-storage

interface StorageData {
  scrapRates?: any[];
  userRequests?: any[];
  lastUpdated?: string;
}

class StorageService {
  private storage: StorageData = {};

  // Save data to local storage
  async setItem(key: string, value: any): Promise<void> {
    try {
      this.storage[key as keyof StorageData] = value;
      console.log(`Saved ${key} to local storage`);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Get data from local storage
  async getItem(key: string): Promise<any> {
    try {
      return this.storage[key as keyof StorageData] || null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  // Remove data from local storage
  async removeItem(key: string): Promise<void> {
    try {
      delete this.storage[key as keyof StorageData];
      console.log(`Removed ${key} from local storage`);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }

  // Clear all storage
  async clear(): Promise<void> {
    try {
      this.storage = {};
      console.log('Cleared all local storage');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Check if data exists
  async hasItem(key: string): Promise<boolean> {
    try {
      return this.storage[key as keyof StorageData] !== undefined;
    } catch (error) {
      console.error('Error checking storage:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();

// Storage keys
export const STORAGE_KEYS = {
  SCRAP_RATES: 'scrap_rates',
  USER_REQUESTS: 'user_requests',
  OFFLINE_REQUESTS: 'offline_requests',
  LAST_SYNC: 'last_sync',
} as const;