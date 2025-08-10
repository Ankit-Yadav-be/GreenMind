import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from './pages/MapPage.jsx';

import Home from './pages/Home';
import ReportWaste from './pages/ReportWaste';
import WasteList from './pages/WasteList';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import MyReports from './pages/MyReports'

import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportWaste />} />
        <Route path="/myreports" element={<MyReports />} />
        <Route path="/wastelist" element={<WasteList />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
