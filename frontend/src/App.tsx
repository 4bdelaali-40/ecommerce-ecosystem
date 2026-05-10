import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import MissionControl from './pages/MissionControl';
import ProductExplorer from './pages/ProductExplorer';
import OrderTracker from './pages/OrderTracker';
import AiCommandCenter from './pages/AiCommandCenter';
import AdminPanel from './pages/AdminPanel';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    return localStorage.getItem('token') ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) return <Navigate to="/login" />;
    if (role !== 'ADMIN') return <Navigate to="/" />;
    return <>{children}</>;
}

function HomeRoute() {
    const role = localStorage.getItem('role');
    if (role === 'ADMIN') return <MissionControl />;
    return <Navigate to="/products" />;
}

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    return (
        <BrowserRouter>
            {isAuthenticated && <Navbar />}
            <Routes>
                <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
                <Route path="/" element={<PrivateRoute><MissionControl /></PrivateRoute>} />
                <Route path="/products" element={<PrivateRoute><ProductExplorer /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><OrderTracker /></PrivateRoute>} />
                <Route path="/ai" element={<PrivateRoute><AiCommandCenter /></PrivateRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                <Route path="/" element={<PrivateRoute><HomeRoute /></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    );
}