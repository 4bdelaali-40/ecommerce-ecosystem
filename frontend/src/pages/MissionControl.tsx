import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Server, Package, ShoppingCart,
    Bell, Database, Zap, TrendingUp, ArrowUpRight,
    RefreshCw
} from 'lucide-react';
import { productApi, orderApi, healthApi } from '../services/api';

const SERVICES = [
    { id: 'api-gateway', name: 'API Gateway', port: 8080, color: '#3b82f6', icon: Zap, desc: 'Route & Auth' },
    { id: 'identity', name: 'Identity', port: 8085, color: '#8b5cf6', icon: Server, desc: 'JWT & Users' },
    { id: 'product', name: 'Products', port: 8081, color: '#06b6d4', icon: Package, desc: 'Catalog & Cache' },
    { id: 'order', name: 'Orders', port: 8082, color: '#10b981', icon: ShoppingCart, desc: 'Orders & Kafka' },
    { id: 'inventory', name: 'Inventory', port: 8083, color: '#f59e0b', icon: Database, desc: 'Stock & Events' },
    { id: 'notification', name: 'Notifications', port: 8084, color: '#ef4444', icon: Bell, desc: 'Email & Push' },
    { id: 'ai', name: 'AI Service', port: 8086, color: '#a855f7', icon: Activity, desc: 'Groq × Llama 3' },
];

const EVENT_TYPES = [
    { type: 'ORDER_PLACED', color: '#10b981', messages: ['New order received', 'Customer checkout completed'] },
    { type: 'INVENTORY_RESERVED', color: '#f59e0b', messages: ['Stock updated', 'Inventory check passed'] },
    { type: 'NOTIFICATION_SENT', color: '#3b82f6', messages: ['Email delivered', 'Push notification sent'] },
    { type: 'AI_RECOMMENDATION', color: '#a855f7', messages: ['AI analysis complete', 'Recommendations generated'] },
];

interface Stats {
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
    servicesOnline: number;
}

interface ServiceStatus {
    id: string;
    online: boolean;
    checking: boolean;
}

export default function MissionControl() {
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0, totalProducts: 0, totalRevenue: 0, servicesOnline: 0
    });
    const [serviceStatuses, setServiceStatuses] = useState<Record<string, ServiceStatus>>(
        Object.fromEntries(SERVICES.map(s => [s.id, { id: s.id, online: false, checking: true }]))
    );
    const [events, setEvents] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const checkServicesHealth = useCallback(async () => {
        const results = await Promise.all(
            SERVICES.map(async svc => {
                const online = await healthApi.checkService(svc.port);
                return { id: svc.id, online, checking: false };
            })
        );
        const statusMap: Record<string, ServiceStatus> = {};
        results.forEach(r => { statusMap[r.id] = r; });
        setServiceStatuses(statusMap);
        return results.filter(r => r.online).length;
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const [productsRes, ordersRes] = await Promise.allSettled([
                productApi.getAll(),
                orderApi.getAllOrders(),
            ]);

            const products = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
            const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];

            const revenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

            setStats(prev => ({
                ...prev,
                totalProducts: products.length,
                totalOrders: orders.length,
                totalRevenue: revenue,
            }));

            // Add real events from orders
            if (orders.length > 0) {
                const orderEvents = orders.slice(0, 3).map((o: any, i: number) => ({
                    id: `order-${o.id}-${i}`,
                    type: 'ORDER_PLACED',
                    message: `Order #${o.id?.slice(-6) || i + 1} — $${o.totalAmount?.toFixed(2) || '0.00'}`,
                    time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString() : 'recently',
                    color: '#10b981',
                }));
                setEvents(prev => {
                    const existing = prev.filter(e => !e.id.startsWith('order-'));
                    return [...orderEvents, ...existing].slice(0, 8);
                });
            }
        } catch {
            // Keep existing stats
        }
    }, []);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        const onlineCount = await checkServicesHealth();
        await fetchStats();
        setStats(prev => ({ ...prev, servicesOnline: onlineCount }));
        setLastUpdated(new Date());
        setRefreshing(false);
    }, [checkServicesHealth, fetchStats]);

    useEffect(() => {
        refresh();
        // Auto-refresh every 30 seconds
        const interval = setInterval(refresh, 30000);
        return () => clearInterval(interval);
    }, [refresh]);

    // Simulated live events
    useEffect(() => {
        const interval = setInterval(() => {
            const t = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
            const msg = t.messages[Math.floor(Math.random() * t.messages.length)];
            setEvents(prev => [
                { id: `live-${Date.now()}`, type: t.type, message: msg, time: 'just now', color: t.color },
                ...prev.slice(0, 7)
            ]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const onlineCount = Object.values(serviceStatuses).filter(s => s.online).length;
    const totalServices = SERVICES.length;

    const statsCards = [
        { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), change: 'live data', icon: ShoppingCart, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
        { label: 'Active Products', value: stats.totalProducts.toLocaleString(), change: 'live data', icon: Package, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
        { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString('en', { maximumFractionDigits: 0 })}`, change: 'live data', icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
        { label: 'Services Online', value: `${onlineCount}/${totalServices}`, change: onlineCount === totalServices ? '100% healthy' : `${totalServices - onlineCount} down`, icon: Activity, color: onlineCount === totalServices ? '#06b6d4' : '#f59e0b', bg: 'rgba(6,182,212,0.08)' },
    ];

    return (
        <div className="page-container">
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'white', margin: 0 }}>Mission Control</h1>
                            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
                                Live system overview — Updated {lastUpdated.toLocaleTimeString()}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px',
                                background: onlineCount === totalServices ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                border: `1px solid ${onlineCount === totalServices ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                                borderRadius: '20px',
                            }}>
                                <motion.div
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: onlineCount === totalServices ? '#10b981' : '#f59e0b',
                                        boxShadow: `0 0 8px ${onlineCount === totalServices ? '#10b981' : '#f59e0b'}`,
                                    }}
                                />
                                <span style={{ fontSize: '13px', fontWeight: 600, color: onlineCount === totalServices ? '#34d399' : '#fbbf24' }}>
                  {onlineCount === totalServices ? 'All Systems Operational' : `${totalServices - onlineCount} Service(s) Down`}
                </span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={refresh}
                                disabled={refreshing}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 16px',
                                    background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(51,65,85,0.5)',
                                    borderRadius: '12px', color: '#94a3b8', fontSize: '13px',
                                    fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {statsCards.map((s, i) => (
                        <motion.div key={s.label}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                    whileHover={{ y: -3 }}
                                    style={{ padding: '22px', borderRadius: '20px', background: s.bg, border: `1px solid ${s.color}25` }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <div>
                                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>{s.label}</p>
                                    <h3 style={{ fontSize: '30px', fontWeight: 800, color: 'white', margin: '6px 0 0' }}>{s.value}</h3>
                                </div>
                                <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: s.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <s.icon size={18} style={{ color: s.color }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ArrowUpRight size={13} style={{ color: s.color }} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: s.color }}>{s.change}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Services + Events */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

                    {/* Services */}
                    <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '24px', padding: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Activity size={16} style={{ color: '#60a5fa' }} />
                                </div>
                                Service Constellation
                            </h2>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                {onlineCount}/{totalServices} online
              </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                            {SERVICES.map((svc, i) => {
                                const status = serviceStatuses[svc.id];
                                const isOnline = status?.online ?? false;
                                const isChecking = status?.checking ?? true;

                                return (
                                    <motion.div key={svc.id}
                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                style={{
                                                    padding: '18px', borderRadius: '16px',
                                                    background: isOnline ? svc.color + '0d' : 'rgba(15,23,42,0.6)',
                                                    border: `1px solid ${isOnline ? svc.color + '35' : 'rgba(51,65,85,0.4)'}`,
                                                    cursor: 'default', transition: 'all 0.3s',
                                                }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: isOnline ? svc.color + '20' : 'rgba(51,65,85,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svc.icon size={16} style={{ color: isOnline ? svc.color : '#475569' }} />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                {isChecking ? (
                                                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#475569' }} />
                                                ) : (
                                                    <motion.div
                                                        animate={isOnline ? { opacity: [1, 0.4, 1] } : {}}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOnline ? '#10b981' : '#ef4444', boxShadow: isOnline ? '0 0 6px #10b981' : 'none' }}
                                                    />
                                                )}
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: isChecking ? '#475569' : isOnline ? '#34d399' : '#f87171' }}>
                          {isChecking ? 'CHECK' : isOnline ? 'LIVE' : 'DOWN'}
                        </span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '14px', fontWeight: 700, color: isOnline ? 'white' : '#475569', margin: '0 0 4px' }}>{svc.name}</p>
                                        <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>{svc.desc}</p>
                                        <span style={{ fontSize: '11px', color: isOnline ? svc.color : '#374151', fontWeight: 500 }}>:{svc.port}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Live Events */}
                    <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={16} style={{ color: '#facc15' }} />
                                </div>
                                Live Events
                            </h2>
                            <motion.div
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }} />
                                <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>LIVE</span>
                            </motion.div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '420px' }}>
                            {events.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569' }}>
                                    <Zap size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                                    <p style={{ fontSize: '13px' }}>Waiting for events...</p>
                                </div>
                            ) : events.map((ev) => (
                                <motion.div key={ev.id}
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                            style={{
                                                display: 'flex', gap: '12px', padding: '12px 14px',
                                                background: 'rgba(30,41,59,0.5)', borderRadius: '12px',
                                                border: '1px solid rgba(51,65,85,0.4)',
                                            }}
                                >
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ev.color, boxShadow: `0 0 8px ${ev.color}`, flexShrink: 0, marginTop: '5px' }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '11px', fontWeight: 700, color: ev.color, margin: '0 0 3px', fontFamily: 'monospace', letterSpacing: '0.03em' }}>{ev.type}</p>
                                        <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.message}</p>
                                        <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>{ev.time}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}