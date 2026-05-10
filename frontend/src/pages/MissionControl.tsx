import { useState, useEffect, useCallback } from 'react';
import { Activity, Server, Package, ShoppingCart, Bell, Database, Zap, TrendingUp, RefreshCw, ArrowUpRight, Lock } from 'lucide-react';
import { productApi, orderApi, healthApi } from '../services/api';

const SERVICES = [
    { id: 'api-gateway', name: 'API Gateway', port: 8080, icon: Zap, desc: 'Routing & Auth' },
    { id: 'identity', name: 'Identity', port: 8085, icon: Server, desc: 'JWT & Users' },
    { id: 'product', name: 'Products', port: 8081, icon: Package, desc: 'Catalog' },
    { id: 'order', name: 'Orders', port: 8082, icon: ShoppingCart, desc: 'Orders & Kafka' },
    { id: 'inventory', name: 'Inventory', port: 8083, icon: Database, desc: 'Stock' },
    { id: 'notification', name: 'Notifications', port: 8084, icon: Bell, desc: 'Email & Push' },
    { id: 'ai', name: 'AI Service', port: 8086, icon: Activity, desc: 'Groq × Llama 3' },
];

const EVENT_TYPES = [
    { type: 'ORDER_PLACED', color: 'var(--success)', messages: ['New order received', 'Customer checkout completed'] },
    { type: 'INVENTORY_RESERVED', color: 'var(--warning)', messages: ['Stock updated', 'Inventory check passed'] },
    { type: 'NOTIFICATION_SENT', color: 'var(--accent)', messages: ['Email delivered', 'Push notification sent'] },
    { type: 'AI_RECOMMENDATION', color: 'var(--purple)', messages: ['AI analysis complete', 'Recommendations generated'] },
];

export default function MissionControl() {
    const isAdmin = localStorage.getItem('role') === 'ADMIN';
    const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0 });
    const [statuses, setStatuses] = useState<Record<string, boolean | null>>(
        Object.fromEntries(SERVICES.map(s => [s.id, null]))
    );
    const [events, setEvents] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Si pas admin → accès refusé
    if (!isAdmin) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '16px', padding: '24px',
            }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'var(--danger-light)', border: '1px solid var(--danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Lock size={24} style={{ color: 'var(--danger)' }} />
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Access Restricted</h1>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
                    This page is only accessible to administrators.
                </p>
            </div>
        );
    }

    const refresh = useCallback(async () => {
        setRefreshing(true);

        // Fetch stats
        const [productsRes, ordersRes] = await Promise.allSettled([
            productApi.getAll(),
            orderApi.getAllOrders(),
        ]);
        const products = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
        const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];
        const revenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
        setStats({ orders: orders.length, products: products.length, revenue });

        // Real events from orders
        if (orders.length > 0) {
            const orderEvents = orders.slice(0, 3).map((o: any) => ({
                id: `real-${o.id}`,
                type: 'ORDER_PLACED',
                message: `Order #${o.id} — $${o.totalAmount?.toFixed(2) || '0.00'}`,
                time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString() : 'recently',
                color: 'var(--success)',
            }));
            setEvents(prev => {
                const filtered = prev.filter((e: any) => !String(e.id).startsWith('real-'));
                return [...orderEvents, ...filtered].slice(0, 10);
            });
        }

        // Health check via api-gateway
        try {
            const r = await healthApi.checkAllServices();
            if (r && Object.keys(r).length > 0) {
                setStatuses(r as Record<string, boolean>);
            }
        } catch {
            // Keep existing statuses
        }

        setLastUpdated(new Date());
        setRefreshing(false);
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 30000);
        return () => clearInterval(interval);
    }, [refresh]);

    // Simulated live events
    useEffect(() => {
        const interval = setInterval(() => {
            const t = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
            setEvents(prev => [{
                id: `live-${Date.now()}`,
                type: t.type,
                message: t.messages[Math.floor(Math.random() * t.messages.length)],
                time: 'just now',
                color: t.color,
            }, ...prev.slice(0, 9)]);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const onlineCount = Object.values(statuses).filter(v => v === true).length;

    const statsCards = [
        { label: 'Total Orders', value: stats.orders.toLocaleString(), icon: ShoppingCart, color: 'var(--accent)' },
        { label: 'Products', value: stats.products.toLocaleString(), icon: Package, color: 'var(--success)' },
        { label: 'Revenue', value: `$${stats.revenue.toLocaleString('en', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'var(--purple)' },
        { label: 'Services Online', value: `${onlineCount}/${SERVICES.length}`, icon: Activity, color: onlineCount === SERVICES.length ? 'var(--success)' : 'var(--warning)' },
    ];

    return (
        <div style={{ padding: '80px 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Mission Control</h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                        Updated {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* System status badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                        background: onlineCount === SERVICES.length ? 'var(--success-light)' : 'var(--warning-light)',
                        border: `1px solid ${onlineCount === SERVICES.length ? 'var(--success)' : 'var(--warning)'}`,
                        color: onlineCount === SERVICES.length ? 'var(--success)' : 'var(--warning)',
                    }}>
                        <div style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            background: onlineCount === SERVICES.length ? 'var(--success)' : 'var(--warning)',
                        }} />
                        {onlineCount === SERVICES.length ? 'All Systems Operational' : `${SERVICES.length - onlineCount} Service(s) Down`}
                    </div>

                    <button onClick={refresh} disabled={refreshing}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 14px', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)', background: 'var(--bg-card)',
                                color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
                            }}>
                        <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                {statsCards.map(s => (
                    <div key={s.label} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '18px 20px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</span>
                            <s.icon size={16} style={{ color: s.color }} />
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{s.value}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: s.color }}>
                            <ArrowUpRight size={12} /> live data
                        </div>
                    </div>
                ))}
            </div>

            {/* Services + Events */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

                {/* Services */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Services</h2>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{onlineCount}/{SERVICES.length} online</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {SERVICES.map(svc => {
                            const online = statuses[svc.id];
                            const checking = online === null;
                            return (
                                <div key={svc.id} style={{
                                    padding: '14px', borderRadius: 'var(--radius-md)',
                                    background: checking ? 'var(--bg-secondary)' : online ? 'var(--success-light)' : 'var(--danger-light)',
                                    border: `1px solid ${checking ? 'var(--border)' : online ? 'var(--success)' : 'var(--danger)'}`,
                                    transition: 'all 0.3s',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <svc.icon size={16} style={{ color: checking ? 'var(--text-muted)' : online ? 'var(--success)' : 'var(--danger)' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <div style={{
                                                width: '7px', height: '7px', borderRadius: '50%',
                                                background: checking ? 'var(--text-muted)' : online ? 'var(--success)' : 'var(--danger)',
                                            }} />
                                            <span style={{
                                                fontSize: '10px', fontWeight: 700,
                                                color: checking ? 'var(--text-muted)' : online ? 'var(--success)' : 'var(--danger)',
                                            }}>
                        {checking ? '...' : online ? 'UP' : 'DOWN'}
                      </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>{svc.name}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>:{svc.port}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Events */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Live Events</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)' }} />
                            <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>LIVE</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '340px' }}>
                        {events.length === 0 ? (
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '40px' }}>
                                Waiting for events...
                            </p>
                        ) : events.map(ev => (
                            <div key={ev.id} style={{
                                padding: '10px 12px', background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                                display: 'flex', gap: '10px',
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ev.color, flexShrink: 0, marginTop: '5px' }} />
                                <div>
                                    <p style={{ fontSize: '11px', fontWeight: 600, color: ev.color, margin: '0 0 2px', fontFamily: 'monospace' }}>{ev.type}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: '0 0 2px' }}>{ev.message}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{ev.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}