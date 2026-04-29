import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Package, ShoppingCart,
    Bot, Shield, LogOut
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
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 glassmorphism px-6 py-3"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-xs font-bold">E</span>
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            EcoSphere
          </span>
                </motion.div>

                <div className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                        isActive
                                            ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <item.icon size={16} />
                                    <span className="hidden md:block">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-all"
                >
                    <LogOut size={16} />
                    <span className="hidden md:block">Logout</span>
                </motion.button>
            </div>
        </motion.nav>
    );
}