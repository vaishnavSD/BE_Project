import { createRobustApiClient } from '../config/api';
import { storageService, STORAGE_KEYS } from './storageService';

export interface ScrapRate {
  id: string;
  type: string;
  category: string;
  price: number;
  unit: string;
  lastUpdated: string;
}

export interface UserRequest {
  id?: string;
  name: string;
  mobile_No: string;
  email: string;
  address: string;
  pickUp_Date: string;
  time_slot: string;
  description: string;
  status?: string;
  createdAt?: string;
}

export interface TimeSlot {
  id: string;
  slot: string;
  available: boolean;
}

class DataService {
  private apiClient = createRobustApiClient();
  private isOnline = true;

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  // Fetch scrap rates from backend
  async getScrapRates(): Promise<ScrapRate[]> {
    try {
      const response = await this.apiClient.get('/scrapDetails/get');
      this.isOnline = true;
      
      // Transform backend data to match our interface
      const backendData = response.data || [];
      const rates = backendData.map((item: any) => ({
        id: item.id?.toString() || Math.random().toString(),
        type: item.type || item.scrap_type || 'Unknown',
        category: item.category || 'general',
        price: parseFloat(item.price) || 0,
        unit: item.unit || 'kg',
        lastUpdated: item.updated_at || new Date().toISOString()
      }));
      
      // Cache the data for offline use
      await storageService.setItem(STORAGE_KEYS.SCRAP_RATES, rates);
      await storageService.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      
      return rates.length > 0 ? rates : this.getFallbackScrapRates();
    } catch (error) {
      console.log('Backend unavailable, using cached/offline data');
      this.isOnline = false;
      
      // Try to get cached data first
      const cachedRates = await storageService.getItem(STORAGE_KEYS.SCRAP_RATES);
      if (cachedRates && cachedRates.length > 0) {
        return cachedRates;
      }
      
      // Return fallback data if no cache available
      return this.getFallbackScrapRates();
    }
  }

  // Fetch available time slots
  async getTimeSlots(date: string): Promise<TimeSlot[]> {
    try {
      const response = await this.apiClient.get(`/timeSlots?date=${date}`);
      this.isOnline = true;
      return response.data || this.getFallbackTimeSlots();
    } catch (error) {
      console.log('Backend unavailable, using default time slots');
      this.isOnline = false;
      return this.getFallbackTimeSlots();
    }
  }

  // Submit user request
  async submitUserRequest(requestData: UserRequest): Promise<{ success: boolean; message: string; id?: string }> {
    try {
      const response = await this.apiClient.post('/userRequests/add', requestData);
      this.isOnline = true;
      
      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          message: 'Your scrap collection has been booked successfully! We\'ll contact you within 24 hours to confirm the details.',
          id: response.data?.id
        };
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error: any) {
      console.log('Backend unavailable for request submission');
      this.isOnline = false;
      
      // In offline mode, save request locally and inform user
      if (error.message === 'Unable to connect to server') {
        this.saveRequestLocally(requestData);
        return {
          success: true,
          message: 'Your request has been saved offline. We\'ll process it once connection is restored. You\'ll receive a confirmation call within 24 hours.'
        };
      }
      
      let errorMessage = 'Failed to submit booking. Please try again.';
      
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Save request locally when offline
  private async saveRequestLocally(requestData: UserRequest) {
    try {
      const offlineRequests = await storageService.getItem(STORAGE_KEYS.OFFLINE_REQUESTS) || [];
      const requestWithId = {
        ...requestData,
        id: `offline_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'pending_sync'
      };
      
      offlineRequests.push(requestWithId);
      await storageService.setItem(STORAGE_KEYS.OFFLINE_REQUESTS, offlineRequests);
      
      console.log('Request saved locally for later sync:', requestWithId);
    } catch (error) {
      console.log('Error saving request locally:', error);
    }
  }

  // Sync offline requests when connection is restored
  async syncOfflineRequests(): Promise<void> {
    try {
      const offlineRequests = await storageService.getItem(STORAGE_KEYS.OFFLINE_REQUESTS) || [];
      
      if (offlineRequests.length === 0) {
        return;
      }

      console.log(`Syncing ${offlineRequests.length} offline requests...`);
      
      for (const request of offlineRequests) {
        try {
          const response = await this.apiClient.post('/userRequests/add', request);
          if (response.status === 200 || response.status === 201) {
            console.log('Successfully synced offline request:', request.id);
          }
        } catch (error) {
          console.log('Failed to sync request:', request.id, error);
          // Keep the request for next sync attempt
          continue;
        }
      }
      
      // Clear synced requests
      await storageService.removeItem(STORAGE_KEYS.OFFLINE_REQUESTS);
      console.log('Offline requests sync completed');
      
    } catch (error) {
      console.log('Error syncing offline requests:', error);
    }
  }

  // Get user requests
  async getUserRequests(): Promise<UserRequest[]> {
    try {
      const response = await this.apiClient.get('/userRequests/get');
      this.isOnline = true;
      return response.data || [];
    } catch (error) {
      console.log('Backend unavailable, no user requests available');
      this.isOnline = false;
      return [];
    }
  }

  // Fallback data when backend is unavailable
  private getFallbackScrapRates(): ScrapRate[] {
    return [
      { id: '1', type: 'Newspaper', category: 'paper', price: 12, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '2', type: 'Iron', category: 'metal', price: 25, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '3', type: 'Plastic Bottles', category: 'plastic', price: 8, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '4', type: 'Cardboard', category: 'paper', price: 10, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '5', type: 'Aluminum', category: 'metal', price: 45, unit: 'kg', lastUpdated: new Date().toISOString() },
    ];
  }

  private getFallbackTimeSlots(): TimeSlot[] {
    return [
      { id: '1', slot: '8:00 AM - 10:00 AM', available: true },
      { id: '2', slot: '10:00 AM - 12:00 PM', available: true },
      { id: '3', slot: '12:00 PM - 2:00 PM', available: true },
      { id: '4', slot: '2:00 PM - 4:00 PM', available: true },
      { id: '5', slot: '4:00 PM - 6:00 PM', available: true },
    ];
  }
}

export const dataService = new DataService();