// Simple utility tests for calculator logic
describe('Scrap Calculator Logic', () => {
  const mockScrapRates = [
    { id: 1, type: 'Paper', category: 'paper', price: 12, unit: 'kg' },
    { id: 2, type: 'Iron', category: 'metal', price: 25, unit: 'kg' },
    { id: 3, type: 'Plastic', category: 'plastic', price: 8, unit: 'kg' }
  ];

  const calculateTotal = (selectedRate: any, quantity: number) => {
    if (!selectedRate || !quantity || quantity <= 0) {
      return 0;
    }
    return selectedRate.price * quantity;
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'paper':
        return '📄';
      case 'metal':
        return '⚙️';
      case 'plastic':
        return '🧴';
      default:
        return '♻️';
    }
  };

  it('should calculate total price correctly', () => {
    const paperRate = mockScrapRates[0];
    const quantity = 10;
    const total = calculateTotal(paperRate, quantity);
    
    expect(total).toBe(120); // 12 * 10 = 120
  });

  it('should return 0 for invalid inputs', () => {
    expect(calculateTotal(null, 10)).toBe(0);
    expect(calculateTotal(mockScrapRates[0], 0)).toBe(0);
    expect(calculateTotal(mockScrapRates[0], -5)).toBe(0);
  });

  it('should return correct category icons', () => {
    expect(getCategoryIcon('paper')).toBe('📄');
    expect(getCategoryIcon('metal')).toBe('⚙️');
    expect(getCategoryIcon('plastic')).toBe('🧴');
    expect(getCategoryIcon('unknown')).toBe('♻️');
  });

  it('should handle different rate calculations', () => {
    const ironRate = mockScrapRates[1];
    const plasticRate = mockScrapRates[2];
    
    expect(calculateTotal(ironRate, 5)).toBe(125); // 25 * 5 = 125
    expect(calculateTotal(plasticRate, 12.5)).toBe(100); // 8 * 12.5 = 100
  });

  it('should validate scrap rates structure', () => {
    mockScrapRates.forEach(rate => {
      expect(rate).toHaveProperty('id');
      expect(rate).toHaveProperty('type');
      expect(rate).toHaveProperty('category');
      expect(rate).toHaveProperty('price');
      expect(rate).toHaveProperty('unit');
      expect(typeof rate.price).toBe('number');
      expect(rate.price).toBeGreaterThan(0);
    });
  });
});