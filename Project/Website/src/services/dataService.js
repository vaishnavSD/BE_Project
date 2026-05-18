import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

class DataService {
  constructor() {
    this.isOnline = true;
  }

  getConnectionStatus() {
    return this.isOnline;
  }

  async getScrapRates() {
    try {
      const response = await apiClient.get('/scrapDetails/get');
      this.isOnline = true;
      
      const backendData = response.data || [];
      const rates = backendData.map((item) => ({
        id: item.id?.toString() || Math.random().toString(),
        type: item.type || item.scrap_type || 'Unknown',
        category: item.category || 'general',
        price: parseFloat(item.price) || 0,
        unit: item.unit || 'kg',
        lastUpdated: item.updated_at || new Date().toISOString()
      }));
      
      return rates.length > 0 ? rates : this.getFallbackScrapRates();
    } catch (error) {
      console.log('Backend unavailable, using fallback data');
      this.isOnline = false;
      return this.getFallbackScrapRates();
    }
  }

  async getTimeSlots(date) {
    try {
      const response = await apiClient.get(`/timeSlots?date=${date}`);
      this.isOnline = true;
      return response.data || this.getFallbackTimeSlots();
    } catch (error) {
      console.log('Backend unavailable, using default time slots');
      this.isOnline = false;
      return this.getFallbackTimeSlots();
    }
  }

  async submitUserRequest(requestData) {
    try {
      const response = await apiClient.post('/userRequests/add', requestData);
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
    } catch (error) {
      console.log('Backend unavailable for request submission');
      this.isOnline = false;
      
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

  getFallbackScrapRates() {
    return [
      { id: '1', type: 'Newspaper', category: 'paper', price: 12, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '2', type: 'Iron', category: 'metal', price: 25, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '3', type: 'Plastic Bottles', category: 'plastic', price: 8, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '4', type: 'Cardboard', category: 'paper', price: 10, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '5', type: 'Aluminum', category: 'metal', price: 45, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '6', type: 'Books', category: 'paper', price: 11, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '7', type: 'Steel', category: 'metal', price: 30, unit: 'kg', lastUpdated: new Date().toISOString() },
      { id: '8', type: 'PET Bottles', category: 'plastic', price: 10, unit: 'kg', lastUpdated: new Date().toISOString() },
    ];
  }

  getFallbackTimeSlots() {
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
