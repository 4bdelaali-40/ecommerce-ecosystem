import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { orderApi } from '../services/api';

interface OrderItem { productId: string; productName: string; quantity: number; price: number; }
interface Order { id: string; status: string; totalAmount: number; createdAt: string; items: OrderItem[]; }

const mockOrders: Order[] = [
    { id: 'ORD-1042', status: 'DELIVERED', totalAmount: 1299.99, createdAt: '2026-04-28T10:30:00', items: [{ productId: '1', productName: 'Quantum Laptop Pro', quantity: 1, price: 1299.99 }] },
    { id: 'ORD-1041', status: 'SHIPPED', totalAmount: 379.98, createdAt: '2026-04-30T14:20:00', items: [{ productId: '2', productName: 'Neural Headphones X', quantity: 1, price: 299.99 }, { productId: '4', productName: 'CyberMouse Elite', quantity: 1, price: 79.99 }] },
    { id: 'ORD-1040', status: 'PROCESSING', totalAmount: 149.99, createdAt: '2026-05-01T09:15:00', items: [{ productId: '5', productName: 'Fusion Keyboard MX', quantity: 1, price: 149.99 }] },
];

const steps = [
    { key: 'PLACED', label: 'Placed', icon: ShoppingCart },
    { key: 'PROCESSING', label: 'Processing', icon: Clock },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const statusColors: Record<string, string> = {
    PLACED: '#3b82f6', PROCESSING: '#f59e0b', SHIPPED: '#8b5cf6', DELIVERED: '#10b981', CANCELLED: '#ef4444',
};

export default function OrderTracker() {
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [expanded, setExpanded] = useState<string | null>('ORD-1041');

    useEffect(() => {
        const uid = localStorage.getItem('userId');
        if (uid) orderApi.getAll(uid).then(r => { if (r.data?.length) setOrders(r.data); }).catch(() => {});
    }, []);

    return (
        <div className="page-container">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Order Tracker</h1>
                    <p className="page-subtitle">Track all your orders in real-time</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { label: 'Total Orders', value: orders.length, color: '#3b82f6' },
                        { label: 'In Transit', value: orders.filter(o => o.status === 'SHIPPED').length, color: '#8b5cf6' },
                        { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length, color: '#10b981' },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    style={{
                                        background: 'rgba(15,23,42,0.85)', border: `1px solid ${s.color}25`,
                                        borderRadius: '16px', padding: '20px 24px', textAlign: 'center',
                                    }}>
                            <div style={{ fontSize: '36px', fontWeight: 700, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Orders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.map((order, i) => {
                        const idx = steps.findIndex(s => s.key === order.status);
                        const statusIdx = idx === -1 ? 0 : idx;
                        const color = statusColors[order.status] || '#3b82f6';
                        const isOpen = expanded === order.id;

                        return (
                            <motion.div key={order.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '20px', overflow: 'hidden' }}>

                                {/* Header */}
                                <div
                                    onClick={() => setExpanded(isOpen ? null : order.id)}
                                    style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                                            background: color + '15', border: `1px solid ${color}35`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <ShoppingCart size={18} style={{ color }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>{order.id}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{
                        padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                        background: color + '15', color, border: `1px solid ${color}35`,
                    }}>
                      {order.status}
                    </span>
                                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa' }}>
                      ${order.totalAmount.toFixed(2)}
                    </span>
                                        <div style={{ color: '#64748b' }}>
                                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ borderTop: '1px solid rgba(51,65,85,0.4)', overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: '24px' }}>
                                                {/* Progress */}
                                                <div style={{ marginBottom: '24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                                                        {/* Line */}
                                                        <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', height: '2px', background: 'rgba(51,65,85,0.6)' }} />
                                                        <div style={{
                                                            position: 'absolute', top: '20px', left: '20px', height: '2px',
                                                            width: `${(statusIdx / (steps.length - 1)) * 100}%`,
                                                            background: color, transition: 'width 0.5s ease',
                                                        }} />

                                                        {steps.map((step, si) => {
                                                            const done = si <= statusIdx;
                                                            const curr = si === statusIdx;
                                                            return (
                                                                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                                                                    <motion.div
                                                                        animate={curr ? { scale: [1, 1.15, 1] } : {}}
                                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                                        style={{
                                                                            width: '40px', height: '40px', borderRadius: '50%',
                                                                            background: done ? color + '20' : 'rgba(15,23,42,0.9)',
                                                                            border: `2px solid ${done ? color : 'rgba(71,85,105,0.5)'}`,
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        }}
                                                                    >
                                                                        <step.icon size={16} style={{ color: done ? color : '#4b5563' }} />
                                                                    </motion.div>
                                                                    <span style={{ fontSize: '11px', fontWeight: 600, marginTop: '8px', color: done ? color : '#4b5563' }}>
                                    {step.label}
                                  </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Items */}
                                                <div>
                                                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: '12px' }}>
                                                        ORDER ITEMS
                                                    </p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} style={{
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                padding: '12px 16px',
                                                                background: 'rgba(30,41,59,0.5)', borderRadius: '12px',
                                                                border: '1px solid rgba(51,65,85,0.4)',
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                    <Package size={15} style={{ color: '#60a5fa' }} />
                                                                    <span style={{ fontSize: '14px', color: 'white', fontWeight: 500 }}>{item.productName}</span>
                                                                    <span style={{ fontSize: '12px', color: '#64748b' }}>×{item.quantity}</span>
                                                                </div>
                                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#60a5fa' }}>${item.price.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}