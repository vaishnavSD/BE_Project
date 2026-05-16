import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testReportsEndpoints() {
  console.log('🧪 Testing Reports API Endpoints\n');
  
  try {
    // Test 1: Monthly Revenue
    console.log('1️⃣ Testing /api/reports/monthly?year=2024');
    const monthlyResponse = await axios.get(`${API_BASE}/reports/monthly?year=2024`);
    console.log('✅ Monthly Revenue Response:', JSON.stringify(monthlyResponse.data, null, 2));
    console.log('');
    
    // Test 2: Monthly Category Revenue
    console.log('2️⃣ Testing /api/reports/monthly-category?year=2024');
    const categoryResponse = await axios.get(`${API_BASE}/reports/monthly-category?year=2024`);
    console.log('✅ Monthly Category Revenue Response:', JSON.stringify(categoryResponse.data, null, 2));
    console.log('');
    
    // Test 3: Download PDF
    console.log('3️⃣ Testing /api/reports/download-pdf?year=2024');
    const pdfResponse = await axios.get(`${API_BASE}/reports/download-pdf?year=2024`);
    console.log('✅ PDF Download Response:', JSON.stringify(pdfResponse.data, null, 2));
    
    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testReportsEndpoints();
