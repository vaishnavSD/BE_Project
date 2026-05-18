import { storageService, STORAGE_KEYS } from '../../../app/services/storageService';

describe('StorageService', () => {
  beforeEach(async () => {
    await storageService.clear();
  });

  describe('setItem and getItem', () => {
    it('should store and retrieve data', async () => {
      const testData = { name: 'John', age: 30 };
      
      await storageService.setItem('test_key', testData);
      const retrieved = await storageService.getItem('test_key');
      
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      const result = await storageService.getItem('non_existent_key');
      
      expect(result).toBeNull();
    });

    it('should overwrite existing data', async () => {
      await storageService.setItem('test_key', 'old_value');
      await storageService.setItem('test_key', 'new_value');
      
      const result = await storageService.getItem('test_key');
      
      expect(result).toBe('new_value');
    });

    it('should handle arrays', async () => {
      const testArray = [1, 2, 3, 4, 5];
      
      await storageService.setItem('array_key', testArray);
      const retrieved = await storageService.getItem('array_key');
      
      expect(retrieved).toEqual(testArray);
    });

    it('should handle complex objects', async () => {
      const complexObject = {
        user: {
          name: 'John',
          address: {
            street: '123 Main St',
            city: 'New York'
          }
        },
        items: [1, 2, 3]
      };
      
      await storageService.setItem('complex_key', complexObject);
      const retrieved = await storageService.getItem('complex_key');
      
      expect(retrieved).toEqual(complexObject);
    });
  });

  describe('removeItem', () => {
    it('should remove stored data', async () => {
      await storageService.setItem('test_key', 'test_value');
      await storageService.removeItem('test_key');
      
      const result = await storageService.getItem('test_key');
      
      expect(result).toBeNull();
    });

    it('should not throw error when removing non-existent key', async () => {
      await expect(storageService.removeItem('non_existent_key')).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all stored data', async () => {
      await storageService.setItem('key1', 'value1');
      await storageService.setItem('key2', 'value2');
      await storageService.setItem('key3', 'value3');
      
      await storageService.clear();
      
      const result1 = await storageService.getItem('key1');
      const result2 = await storageService.getItem('key2');
      const result3 = await storageService.getItem('key3');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });
  });

  describe('hasItem', () => {
    it('should return true for existing keys', async () => {
      await storageService.setItem('test_key', 'test_value');
      
      const exists = await storageService.hasItem('test_key');
      
      expect(exists).toBe(true);
    });

    it('should return false for non-existent keys', async () => {
      const exists = await storageService.hasItem('non_existent_key');
      
      expect(exists).toBe(false);
    });

    it('should return false after removing item', async () => {
      await storageService.setItem('test_key', 'test_value');
      await storageService.removeItem('test_key');
      
      const exists = await storageService.hasItem('test_key');
      
      expect(exists).toBe(false);
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have all required storage keys', () => {
      expect(STORAGE_KEYS.SCRAP_RATES).toBe('scrap_rates');
      expect(STORAGE_KEYS.USER_REQUESTS).toBe('user_requests');
      expect(STORAGE_KEYS.OFFLINE_REQUESTS).toBe('offline_requests');
      expect(STORAGE_KEYS.LAST_SYNC).toBe('last_sync');
    });

    it('should work with defined storage keys', async () => {
      const testData = [{ id: 1, type: 'test' }];
      
      await storageService.setItem(STORAGE_KEYS.SCRAP_RATES, testData);
      const retrieved = await storageService.getItem(STORAGE_KEYS.SCRAP_RATES);
      
      expect(retrieved).toEqual(testData);
    });
  });

  describe('Error handling', () => {
    it('should handle null values', async () => {
      await storageService.setItem('null_key', null);
      const result = await storageService.getItem('null_key');
      
      expect(result).toBeNull();
    });

    it('should handle undefined values', async () => {
      await storageService.setItem('undefined_key', undefined);
      const result = await storageService.getItem('undefined_key');
      
      // Storage returns null for undefined values
      expect(result).toBeNull();
    });

    it('should handle empty strings', async () => {
      await storageService.setItem('empty_key', '');
      const result = await storageService.getItem('empty_key');
      
      // Empty string is falsy, returns null
      expect(result).toBeNull();
    });

    it('should handle zero values', async () => {
      await storageService.setItem('zero_key', 0);
      const result = await storageService.getItem('zero_key');
      
      // Zero is falsy, returns null
      expect(result).toBeNull();
    });
  });
});
