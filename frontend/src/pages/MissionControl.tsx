import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Server, Package, ShoppingCart,
    Bell, Database, Zap, TrendingUp, ArrowUpRight
} from 'lucide-react';

const services = [
    { id: 'api-gateway', name: 'API Gateway', port: 8080, color: '#3b82f6', icon: Zap, desc: 'Route & Auth' },
    { id: 'identity', name: 'Identity', port: 8085, color: '#8b5cf6', icon: Server, desc: 'JWT & Users' },
    { id: 'product', name: 'Products', port: 8081, color: '#06b6d4', icon: Package, desc: 'Catalog & Cache' },
    { id: 'order', name: 'Orders', port: 8082, color: '#10b981', icon: ShoppingCart, desc: 'Orders & Kafka' },
    { id: 'inventory', name: 'Inventory', port: 8083, color: '#f59e0b', icon: Database, desc: 'Stock & Events' },
    { id: 'notification', name: 'Notifications', port: 8084, color: '#ef4444', icon: Bell, desc: 'Email & Push' },
    { id: 'ai', name: 'AI Service', port: 8086, color: '#a855f7', icon: Activity, desc: 'Groq × Llama 3' },
];

const initialEvents = [
    { id: 1, type: 'ORDER_PLACED', message: 'New order #1042 placed', time: '2s ago', color: '#10b981' },
    { id: 2, type: 'INVENTORY_RESERVED', message: 'Stock reserved for #1042', time: '3s ago', color: '#f59e0b' },
    { id: 3, type: 'NOTIFICATION_SENT', message: 'Email sent to customer', time: '4s ago', color: '#3b82f6' },
    { id: 4, type: 'AI_RECOMMENDATION', message: 'AI generated 5 recommendations', time: '1m ago', color: '#a855f7' },
    { id: 5, type: 'ORDER_PLACED', message: 'New order #1041 placed', time: '2m ago', color: '#10b981' },
];

const stats = [
    { label: 'Total Orders', value: '1,284', change: '+12%', icon: ShoppingCart, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'Active Products', value: '342', change: '+5%', icon: Package, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
    { label: 'Revenue Today', value: '$8,492', change: '+18%', icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
    { label: 'Services Online', value: '7/7', change: '100%', icon: Activity, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
];

export default function MissionControl() {
    const [events, setEvents] = useState(initialEvents);

    useEffect(() => {
        const types = [
            { type: 'ORDER_PLACED', color: '#10b981', messages: ['New order received', 'Customer checkout completed'] },
            { type: 'INVENTORY_RESERVED', color: '#f59e0b', messages: ['Stock updated', 'Inventory check passed'] },
            { type: 'NOTIFICATION_SENT', color: '#3b82f6', messages: ['Email delivered', 'Push notification sent'] },
            { type: 'AI_RECOMMENDATION', color: '#a855f7', messages: ['AI analysis complete', 'Recommendations generated'] },
        ];
        const interval = setInterval(() => {
            const t = types[Math.floor(Math.random() * types.length)];
            const msg = t.messages[Math.floor(Math.random() * t.messages.length)];
            setEvents(prev => [{ id: Date.now(), type: t.type, message: msg, time: 'just now', color: t.color }, ...prev.slice(0, 7)]);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="page-container">
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'white', margin: 0 }}>Mission Control</h1>
                            <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
                                Distributed E-Commerce Ecosystem — Real-time System Overview
                            </p>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px',
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                            borderRadius: '20px',
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>All Systems Operational</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {stats.map((s, i) => (
                        <motion.div key={s.label}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                    whileHover={{ y: -3 }}
                                    style={{
                                        padding: '22px', borderRadius: '20px',
                                        background: s.bg, border: `1px solid ${s.color}25`,
                                        cursor: 'default',
                                    }}
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
                                <span style={{ fontSize: '12px', fontWeight: 600, color: s.color }}>{s.change} this week</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Grid */}
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
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>7 microservices</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                            {services.map((svc, i) => (
                                <motion.div key={svc.id}
                                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            style={{
                                                padding: '18px', borderRadius: '16px',
                                                background: svc.color + '0d', border: `1px solid ${svc.color}35`,
                                                cursor: 'pointer', transition: 'all 0.2s',
                                            }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: svc.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svc.icon size={16} style={{ color: svc.color }} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#34d399' }}>LIVE</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>{svc.name}</p>
                                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>{svc.desc}</p>
                                    <span style={{ fontSize: '11px', color: svc.color, fontWeight: 500 }}>:{svc.port}</span>
                                </motion.div>
                            ))}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <motion.div
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }}
                                />
                                <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>LIVE</span>
                            </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                            {events.map((ev, i) => (
                                <motion.div key={ev.id}
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                            style={{
                                                display: 'flex', gap: '12px', padding: '12px 14px',
                                                background: 'rgba(30,41,59,0.5)', borderRadius: '14px',
                                                border: '1px solid rgba(51,65,85,0.4)',
                                            }}
                                >
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ev.color, boxShadow: `0 0 8px ${ev.color}`, flexShrink: 0, marginTop: '4px' }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '11px', fontWeight: 700, color: ev.color, margin: '0 0 3px', fontFamily: 'monospace' }}>{ev.type}</p>
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