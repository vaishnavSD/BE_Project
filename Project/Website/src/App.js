import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Rates from './pages/Rates';
import Request from './pages/Request';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/request" element={<Request />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
