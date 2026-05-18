import { dataService, ScrapRate, UserRequest } from '../../../app/services/dataService';
import { storageService, STORAGE_KEYS } from '../../../app/services/storageService';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../../app/services/storageService');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getScrapRates', () => {
    it('should fetch scrap rates from backend successfully', async () => {
      const mockBackendData = [
        { id: 1, type: 'Newspaper', category: 'paper', price: 12, unit: 'kg' },
        { id: 2, type: 'Iron', category: 'metal', price: 25, unit: 'kg' }
      ];

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue({ data: mockBackendData }),
      } as any);

      const rates = await dataService.getScrapRates();

      expect(rates).toHaveLength(2);
      expect(rates[0].type).toBe('Newspaper');
      expect(rates[0].price).toBe(12);
      expect(rates[1].type).toBe('Iron');
      expect(storageService.setItem).toHaveBeenCalledWith(STORAGE_KEYS.SCRAP_RATES, expect.any(Array));
    });

    it('should return cached data when backend is unavailable', async () => {
      const cachedRates: ScrapRate[] = [
        { id: '1', type: 'Cached Item', category: 'test', price: 10, unit: 'kg', lastUpdated: new Date().toISOString() }
      ];

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(new Error('Network error')),
      } as any);

      (storageService.getItem as jest.Mock).mockResolvedValue(cachedRates);

      const rates = await dataService.getScrapRates();

      expect(rates).toEqual(cachedRates);
      expect(storageService.getItem).toHaveBeenCalledWith(STORAGE_KEYS.SCRAP_RATES);
    });

    it('should return fallback data when no cache available', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(new Error('Network error')),
      } as any);

      (storageService.getItem as jest.Mock).mockResolvedValue(null);

      const rates = await dataService.getScrapRates();

      expect(rates.length).toBeGreaterThan(0);
      expect(rates[0]).toHaveProperty('type');
      expect(rates[0]).toHaveProperty('price');
    });

    it('should handle empty backend response', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue({ data: [] }),
      } as any);

      const rates = await dataService.getScrapRates();

      expect(rates.length).toBeGreaterThan(0); // Should return fallback data
    });
  });

  describe('getTimeSlots', () => {
    it('should fetch time slots for a given date', async () => {
      const mockTimeSlots = [
        { id: '1', slot: '8:00 AM - 10:00 AM', available: true },
        { id: '2', slot: '10:00 AM - 12:00 PM', available: false }
      ];

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue({ data: mockTimeSlots }),
      } as any);

      const slots = await dataService.getTimeSlots('2024-01-15');

      expect(slots).toEqual(mockTimeSlots);
    });

    it('should return fallback time slots when backend fails', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(new Error('Network error')),
      } as any);

      const slots = await dataService.getTimeSlots('2024-01-15');

      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]).toHaveProperty('slot');
      expect(slots[0]).toHaveProperty('available');
    });
  });

  describe('submitUserRequest', () => {
    const mockRequest: UserRequest = {
      name: 'John Doe',
      mobile_No: '1234567890',
      email: 'john@example.com',
      address: '123 Main St',
      pickUp_Date: '2024-01-15',
      time_slot: '8:00 AM - 10:00 AM',
      description: 'Test request'
    };

    it('should submit user request successfully', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue({
          status: 200,
          data: { id: '123' }
        }),
      } as any);

      const result = await dataService.submitUserRequest(mockRequest);

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
      expect(result.id).toBe('123');
    });

    it('should save request locally when offline', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(new Error('Unable to connect to server')),
      } as any);

      (storageService.getItem as jest.Mock).mockResolvedValue([]);

      const result = await dataService.submitUserRequest(mockRequest);

      expect(result.success).toBe(true);
      expect(result.message).toContain('saved offline');
      expect(storageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.OFFLINE_REQUESTS,
        expect.arrayContaining([
          expect.objectContaining({
            ...mockRequest,
            status: 'pending_sync'
          })
        ])
      );
    });

    it('should handle validation errors from backend', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue({
          response: {
            data: { errors: 'Invalid email format' }
          }
        }),
      } as any);

      const result = await dataService.submitUserRequest(mockRequest);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid email format');
    });

    it('should handle generic errors', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(new Error('Unknown error')),
      } as any);

      const result = await dataService.submitUserRequest(mockRequest);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to submit booking');
    });
  });

  describe('syncOfflineRequests', () => {
    it('should sync offline requests when connection is restored', async () => {
      const offlineRequests = [
        {
          id: 'offline_1',
          name: 'John',
          mobile_No: '1234567890',
          email: 'john@example.com',
          address: '123 Main St',
          pickUp_Date: '2024-01-15',
          time_slot: '8:00 AM',
          description: 'Test',
          status: 'pending_sync'
        }
      ];

      (storageService.getItem as jest.Mock).mockResolvedValue(offlineRequests);
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue({ status: 200 }),
      } as any);

      await dataService.syncOfflineRequests();

      expect(storageService.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.OFFLINE_REQUESTS);
    });

    it('should handle empty offline requests', async () => {
      (storageService.getItem as jest.Mock).mockResolvedValue([]);

      await dataService.syncOfflineRequests();

      expect(storageService.removeItem).not.toHaveBeenCalled();
    });

    it('should keep failed requests for next sync', async () => {
      const offlineRequests = [
        { id: 'offline_1', name: 'John', mobile_No: '1234567890', email: 'john@example.com', address: '123 Main St', pickUp_Date: '2024-01-15', time_slot: '8:00 AM', description: 'Test' }
      ];

      (storageService.getItem as jest.Mock).mockResolvedValue(offlineRequests);
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(new Error('Network error')),
      } as any);

      await dataService.syncOfflineRequests();

      // Should not remove items if sync failed
      expect(storageService.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('getUserRequests', () => {
    it('should fetch user requests successfully', async () => {
      const mockRequests = [
        { id: '1', name: 'John', status: 'pending' },
        { id: '2', name: 'Jane', status: 'completed' }
      ];

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue({ data: mockRequests }),
      } as any);

      const requests = await dataService.getUserRequests();

      expect(requests).toEqual(mockRequests);
    });

    it('should return empty array when backend fails', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(new Error('Network error')),
      } as any);

      const requests = await dataService.getUserRequests();

      expect(requests).toEqual([]);
    });
  });

  describe('getConnectionStatus', () => {
    it('should return true when online', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue({ data: [] }),
      } as any);

      await dataService.getScrapRates();

      expect(dataService.getConnectionStatus()).toBe(true);
    });

    it('should return false when offline', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(new Error('Network error')),
      } as any);

      (storageService.getItem as jest.Mock).mockResolvedValue(null);

      await dataService.getScrapRates();

      expect(dataService.getConnectionStatus()).toBe(false);
    });
  });
});
