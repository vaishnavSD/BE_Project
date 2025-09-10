import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../utils/utils";

function ScrapDetails() {
  const [scrapDetails, setScrapDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchScrapDetails = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/scrapDetails/get`);
        setScrapDetails(response.data);
      } catch (error) {
        console.error("Error fetching scrap details:", error);
        setError("Failed to load scrap details");
      } finally {
        setLoading(false);
      }
    };
    fetchScrapDetails();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading scrap details...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Get unique categories
  const categories = Array.from(new Set(scrapDetails.map(detail => detail.category)));

  // Filter details by selected category
  const filteredDetails = selectedCategory
    ? scrapDetails.filter(detail => detail.category === selectedCategory)
    : scrapDetails;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Sidebar */}
      <div
        style={{
          transition: 'all 0.3s',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          borderRight: '1px solid #e5e7eb',
          width: sidebarOpen ? '20vw' : '0',
          minWidth: sidebarOpen ? '180px' : '0',
          maxWidth: '20vw',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Categories</h2>
          <button
            style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setSidebarOpen(false)}
          >
            Hide
          </button>
        </div>
        <nav style={{ padding: '16px', height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {categories.map(category => (
                <li key={category}>
                  <button
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      fontWeight: selectedCategory === category ? 'bold' : 'normal',
                      background: selectedCategory === category ? '#dbeafe' : '#fff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
              <li>
                <button
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    marginTop: '16px',
                    color: '#6b7280',
                    background: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedCategory(null)}
                >
                  Show All
                </button>
              </li>
            </ul>
          </div>
          <button
            style={{
              width: '100%',
              padding: '12px 0',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '24px',
              boxShadow: '0 2px 8px rgba(59,130,246,0.12)'
            }}
            onClick={() => window.location.href = '/request'}
          >
            Book a Pickup
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px', transition: 'all 0.3s', width: sidebarOpen ? undefined : '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>Scrap Details</h2>
          {!sidebarOpen && (
            <button
              style={{ marginLeft: '16px', padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: 'none', cursor: 'pointer' }}
              onClick={() => setSidebarOpen(true)}
            >
              Show Categories
            </button>
          )}
        </div>
  <div style={{ width: '50%', minWidth: '320px', maxWidth: '700px', overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', padding: '16px', margin: '0 auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', margin: '0 auto' }}>
            <thead>
              <tr style={{ background: '#e0e7ff' }}>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Price(per KG)</th>
              </tr>
            </thead>
            <tbody>
              {filteredDetails.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px' }}>No scrap details found.</td></tr>
              ) : (
                filteredDetails.map(detail => (
                  <tr key={detail._id} style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={tdStyle}>{detail.category}</td>
                    <td style={tdStyle}>{detail.type}</td>
                    <td style={tdStyle}>₹{detail.price}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Table header and cell styles
const thStyle = {
  padding: '12px 8px',
  fontWeight: 600,
  color: '#374151',
  borderBottom: '2px solid #c7d2fe',
  textAlign: 'left',
};

const tdStyle = {
  padding: '10px 8px',
  color: '#374151',
  textAlign: 'left',
};

export default ScrapDetails;

