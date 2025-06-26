import React ,{ useState } from 'react';

import './App.css'
import './index.css';


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar';

import GearAnalysis from "./pages/GearAnalysis";
import DefectLogs from "./pages/DefectLogs";
import Settings from "./pages/Settings";
import Layout from './components/Layout';
import JsonUploader from "./components/CsvUploader.jsx";





function App() {
  return (
    <div className="min-h-screen w-full m-0 p-0 bg-gray-100">
      <Router>
        <Navbar />
        <Layout/>
       {/* Optional padding */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/analysis" element={<GearAnalysis />} />
            <Route path="/logs" element={<DefectLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        <JsonUploader />
      </Router>
    </div>
  );
}


export default App;
