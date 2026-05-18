import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import './Rates.css';

function Rates() {
  const navigate = useNavigate();
  const [scrapRates, setScrapRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCalculator, setShowCalculator] = useState(true);

  // Calculator state
  const [calculatorData, setCalculatorData] = useState({
    category: '',
    type: '',
    rate: 0,
    quantity: 0,
    totalAmount: 0
  });
  const [availableTypes, setAvailableTypes] = useState([]);

  useEffect(() => {
    fetchScrapRates();
  }, []);

  const fetchScrapRates = async () => {
    setLoading(true);
    try {
      const rates = await dataService.getScrapRates();
      setScrapRates(rates);
    } catch (error) {
      console.error('Error fetching scrap rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'paper':
        return '📄';
      case 'metal':
        return '⚙️';
      case 'plastic':
        return '🧴';
      case 'electronics':
        return '💻';
      case 'glass':
        return '🥃';
      default:
        return '♻️';
    }
  };

  const getCategories = () => {
    const categorySet = new Set();
    scrapRates.forEach(item => {
      if (item.category && typeof item.category === 'string') {
        categorySet.add(item.category.toLowerCase());
      }
    });
    return Array.from(categorySet).filter(cat => cat);
  };

  const getFilteredRates = () => {
    if (selectedCategory === 'all') return scrapRates;
    return scrapRates.filter(item => item.category?.toLowerCase() === selectedCategory);
  };

  const handleCategoryChange = (category) => {
    const types = scrapRates.filter(item => item.category?.toLowerCase() === category.toLowerCase());
    setAvailableTypes(types);
    setCalculatorData({
      ...calculatorData,
      category,
      type: '',
      rate: 0,
      totalAmount: 0
    });
  };

  const handleTypeChange = (type) => {
    const selectedItem = scrapRates.find(item => item.type === type);
    const rate = selectedItem ? selectedItem.price : 0;
    const totalAmount = rate * calculatorData.quantity;

    setCalculatorData({
      ...calculatorData,
      type,
      rate,
      totalAmount
    });
  };

  const handleQuantityChange = (quantity) => {
    const totalAmount = calculatorData.rate * quantity;
    setCalculatorData({
      ...calculatorData,
      quantity,
      totalAmount
    });
  };

  const resetCalculator = () => {
    setCalculatorData({
      category: '',
      type: '',
      rate: 0,
      quantity: 0,
      totalAmount: 0
    });
    setAvailableTypes([]);
  };

  const handleRateItemClick = (item) => {
    handleCategoryChange(item.category);
    handleTypeChange(item.type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="rates-container">
      <header className="header">
        <nav className="navbar">
          <div className="logo">♻ ScrapWale</div>
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </nav>
      </header>

      <div className="content">
        <h1 className="title">Scrap Value Calculator</h1>
        <p className="subtitle">Calculate the value of your scrap materials instantly</p>

        {/* Calculator Toggle Button */}
        <button
          className="toggle-button"
          onClick={() => setShowCalculator(!showCalculator)}
        >
          <span className="toggle-icon">{showCalculator ? '📱' : '🧮'}</span>
          <span className="toggle-text">
            {showCalculator ? 'Hide Calculator' : 'Show Calculator'}
          </span>
          <span className="toggle-arrow">{showCalculator ? '▲' : '▼'}</span>
        </button>

        {/* Calculator Section */}
        {showCalculator && (
          <div className="calculator-container">
            <div className="calculator-header">
              <span className="calculator-icon">🧮</span>
              <h2 className="calculator-title">Scrap Calculator</h2>
            </div>
            <p className="calculator-subtitle">
              Select your scrap category and type to calculate the total amount
            </p>

            {loading ? (
              <div className="loading-container">
                <p className="loading-text">Loading calculator...</p>
              </div>
            ) : (
              <div className="calculator-form">
                {/* Category Dropdown */}
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    className="dropdown-select"
                    value={calculatorData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {getCategories().map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Dropdown */}
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select
                    className="dropdown-select"
                    value={calculatorData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    disabled={!calculatorData.category}
                  >
                    <option value="">Select Type</option>
                    {availableTypes.map((item, index) => (
                      <option key={`${item.type}-${index}`} value={item.type}>
                        {item.type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rate Display */}
                <div className="input-group">
                  <label className="input-label">Rate (₹/kg)</label>
                  <div className="rate-display">
                    <span className="rate-value">₹{calculatorData.rate}</span>
                  </div>
                </div>

                {/* Quantity Input */}
                <div className="input-group">
                  <label className="input-label">Quantity (kg)</label>
                  <input
                    type="number"
                    className="quantity-input"
                    value={calculatorData.quantity}
                    onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
                    placeholder="Enter quantity"
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Total Amount Display */}
                <div className="total-container">
                  <p className="total-label">Total Amount</p>
                  <p className="total-amount">₹{calculatorData.totalAmount.toFixed(2)}</p>
                  <p className="calculation-breakdown">
                    {calculatorData.quantity} kg × ₹{calculatorData.rate}/kg
                  </p>
                </div>

                {/* Reset Button */}
                <button className="reset-button" onClick={resetCalculator}>
                  Reset Calculator
                </button>
              </div>
            )}
          </div>
        )}

        {/* Current Rates Section */}
        <div className="rates-section">
          <h2 className="rates-title">Current Scrap Rates</h2>
          <p className="rates-subtitle">Get the best prices for your recyclable materials</p>

          {/* Category Filter */}
          <div className="category-filter">
            <button
              className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            {getCategories().map((category) => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          <div className="rates-grid">
            {getFilteredRates().length > 0 ? (
              getFilteredRates().map((item, index) => (
                <div
                  key={`${item.category}-${item.type}-${index}`}
                  className="rate-card"
                  onClick={() => handleRateItemClick(item)}
                >
                  <div className="rate-header">
                    <span className="rate-icon">{getCategoryIcon(item.category)}</span>
                    <div className="rate-info">
                      <h3 className="rate-type">{item.type}</h3>
                      <span className="rate-category">{item.category}</span>
                    </div>
                  </div>
                  <div className="rate-price">
                    <span className="price-amount">₹{item.price}</span>
                    <span className="price-unit">per kg</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p className="no-data-text">No rates available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rates;
