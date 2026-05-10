import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Bot, Shield, LogOut } from 'lucide-react';

export default function Navbar() {
    const location = useLocation();
    const isAdmin = localStorage.getItem('role') === 'ADMIN';

    const navItems = [
        ...(isAdmin ? [{ path: '/', icon: LayoutDashboard, label: 'Dashboard' }] : []),
        { path: '/products', icon: Package, label: 'Products' },
        { path: '/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/ai', icon: Bot, label: 'AI Center' },
        ...(isAdmin ? [{ path: '/admin', icon: Shield, label: 'Admin' }] : []),
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            height: 'var(--nav-height)',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center',
            padding: '0 24px', gap: '24px',
        }}>
            <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
          EcoSphere
        </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                {navItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '6px 12px', borderRadius: 'var(--radius-md)',
                                fontSize: '14px', fontWeight: isActive ? 500 : 400,
                                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                background: isActive ? 'var(--accent-light)' : 'transparent',
                                transition: 'all 0.15s', cursor: 'pointer',
                            }}>
                                <item.icon size={16} />
                                {item.label}
                            </div>
                        </Link>
                    );
                })}
            </div>

            <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--danger)', fontSize: '14px', cursor: 'pointer', flexShrink: 0,
            }}>
                <LogOut size={15} />
                Logout
            </button>
        </nav>
    );
}