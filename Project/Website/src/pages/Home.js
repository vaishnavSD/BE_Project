import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [scrapRates, setScrapRates] = useState([]);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadScrapRates();
  }, []);

  const loadScrapRates = async () => {
    setIsLoadingRates(true);
    try {
      const rates = await dataService.getScrapRates();
      setScrapRates(rates);
      setIsOnline(dataService.getConnectionStatus());
    } catch (error) {
      console.log('Error loading scrap rates:', error);
      setIsOnline(false);
    } finally {
      setIsLoadingRates(false);
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
      default:
        return '♻️';
    }
  };

  const handleBookPickup = () => {
    navigate('/request');
  };

  const handleViewAllRates = () => {
    navigate('/rates');
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <nav className="navbar">
          <div className="logo">♻ ScrapWale</div>
          <div className="nav-buttons">
            <button className="btn btn-primary" onClick={handleBookPickup}>
              Book Pickup
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Turn Scrap into Cash Instantly!</h1>
        <p className="hero-subtitle">
          ScrapWale helps you recycle paper, plastic, and metal — and get paid at your doorstep.
        </p>
        <button className="btn btn-primary btn-large" onClick={handleBookPickup}>
          Schedule a Pickup
        </button>
      </section>

      {/* Current Market Rates */}
      <section className="rate-slider-section">
        <div className="rate-section-header">
          <h2 className="section-title">📈 Current Market Rates</h2>
          <div className={`live-indicator ${!isOnline ? 'offline' : ''}`}>
            <div className="live-dot"></div>
            <span className="live-text">{isOnline ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>
        <p className="section-subtitle">
          {isOnline ? 'Updated daily' : 'Showing cached rates'}
        </p>

        {isLoadingRates ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading current rates...</p>
          </div>
        ) : (
          <div className="rate-slider">
            <div className="rate-slider-track">
              {scrapRates.map((item, index) => (
                <div key={`rate-${item.id || index}`} className="rate-item">
                  <div className="rate-item-content">
                    <span className="rate-icon">{getCategoryIcon(item.category)}</span>
                    <div className="rate-details">
                      <h3 className="rate-type">{item.type}</h3>
                      <span className="rate-category">{item.category}</span>
                    </div>
                    <div className="rate-price-container">
                      <span className="rate-price">₹{item.price}</span>
                      <span className="rate-price-unit">/{item.unit || 'kg'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-primary view-all-btn" onClick={handleViewAllRates}>
          📊 View Calculator & All Rates
        </button>
      </section>

      {/* Services */}
      <section className="services">
        <h2 className="section-title">Our Services</h2>
        <div className="service-cards">
          <div className="card">
            <span className="icon">📄</span>
            <h3 className="card-title">Paper Scrap</h3>
            <p className="card-text">Recycle newspapers, books, and office waste easily.</p>
          </div>
          <div className="card">
            <span className="icon">⚙️</span>
            <h3 className="card-title">Metal Scrap</h3>
            <p className="card-text">Sell iron, steel, and other metals for fair rates.</p>
          </div>
          <div className="card">
            <span className="icon">🧴</span>
            <h3 className="card-title">Plastic Scrap</h3>
            <p className="card-text">We collect and recycle all kinds of plastics responsibly.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <h3 className="footer-title">ScrapWale</h3>
        <p className="footer-text">📍 Pune, Maharashtra</p>
        <p className="footer-text">📞 +91 98765 43210 | ✉ support@scrapwale.in</p>
        <p className="footer-text">© {new Date().getFullYear()} ScrapWale. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
