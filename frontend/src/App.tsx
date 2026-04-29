import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MissionControl from './pages/MissionControl';
import ProductExplorer from './pages/ProductExplorer';
import OrderTracker from './pages/OrderTracker';
import AiCommandCenter from './pages/AiCommandCenter';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import ParticleBackground from './components/ParticleBackground';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
      !!localStorage.getItem('token')
  );

  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
      <BrowserRouter>
        <div className="min-h-screen relative">
          <ParticleBackground />
          {isAuthenticated && <Navbar />}
          <Routes>
            <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="/" element={
              <PrivateRoute><MissionControl /></PrivateRoute>
            } />
            <Route path="/products" element={
              <PrivateRoute><ProductExplorer /></PrivateRoute>
            } />
            <Route path="/orders" element={
              <PrivateRoute><OrderTracker /></PrivateRoute>
            } />
            <Route path="/ai" element={
              <PrivateRoute><AiCommandCenter /></PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute><AdminPanel /></PrivateRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
  );
}

export default App;