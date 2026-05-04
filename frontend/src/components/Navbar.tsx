import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Package, ShoppingCart,
    Bot, Shield, LogOut, Zap
} from 'lucide-react';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Mission Control' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/ai', icon: Bot, label: 'AI Center' },
    { path: '/admin', icon: Shield, label: 'Admin' },
];

export default function Navbar() {
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
    };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50"
            style={{
                background: 'rgba(2, 8, 23, 0.97)',
                borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
                backdropFilter: 'blur(20px)',
                height: '68px',
            }}
        >
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 flex-shrink-0">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}
                    >
                        <Zap size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-lg text-white hidden sm:block">EcoSphere</span>
                </Link>

                {/* Nav Links - Center */}
                <div className="flex items-center gap-1 flex-1 justify-center">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                                    style={{
                                        background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                        color: isActive ? '#60a5fa' : '#94a3b8',
                                        border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                                    }}
                                >
                                    <item.icon size={16} />
                                    <span className="hidden lg:block whitespace-nowrap">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                {/* Logout */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0"
                    style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                    }}
                >
                    <LogOut size={15} />
                    <span className="hidden sm:block">Logout</span>
                </motion.button>
            </div>
        </nav>
    );
}