import { useState } from 'react'
import {Navigate , Route , Routes } from 'react-router-dom';


import ScrapDetails from "./components/scrapDetails.jsx";
import Request from "./components/Request.jsx";
import Admin from './components/admin.jsx';

export default function App() {
  return (
    <div>

      <Routes>
        <Route path="/" element={<ScrapDetails />} />
        <Route path="/request" element={<Request />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
    
  );
}
