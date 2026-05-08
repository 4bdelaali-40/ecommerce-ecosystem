import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Package, Truck, CheckCircle,
    Clock, ChevronDown, ChevronUp, RefreshCw,
    AlertCircle, Plus
} from 'lucide-react';
import { orderApi } from '../services/api';

interface OrderItem {
    id?: number;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    userId: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    updatedAt?: string;
    items: OrderItem[];
}

const steps = [
    { key: 'PENDING', label: 'Placed', icon: ShoppingCart },
    { key: 'PROCESSING', label: 'Processing', icon: Clock },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const statusColors: Record<string, string> = {
    PENDING: '#3b82f6',
    PROCESSING: '#f59e0b',
    CONFIRMED: '#06b6d4',
    SHIPPED: '#8b5cf6',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444',
};

const statusToStep: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 1,
    CONFIRMED: 1,
    SHIPPED: 2,
    DELIVERED: 3,
    CANCELLED: 0,
};

export default function OrderTracker() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError('User not identified. Please login again.');
            setLoading(false);
            return;
        }
        try {
            const response = await orderApi.getAll(userId);
            const data = response.data || [];
            setOrders(data);
            if (data.length > 0) setExpanded(String(data[0].id));
            setError('');
        } catch (err: any) {
            if (err.response?.status === 404) {
                setOrders([]);
            } else {
                setError('Unable to load orders. Make sure the order service is running.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
    };

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return (
        <div className="page-container">
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'white', margin: 0 }}>Order Tracker</h1>
                            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
                                Track all your orders in real-time
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRefresh}
                            disabled={refreshing}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '10px 18px',
                                background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(51,65,85,0.5)',
                                borderRadius: '12px', color: '#94a3b8', fontSize: '13px',
                                fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
                    {[
                        { label: 'Total Orders', value: orders.length, color: '#3b82f6' },
                        { label: 'In Transit', value: orders.filter(o => o.status === 'SHIPPED').length, color: '#8b5cf6' },
                        { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length, color: '#10b981' },
                        { label: 'Total Spent', value: `$${totalRevenue.toFixed(2)}`, color: '#f59e0b' },
                    ].map((s, i) => (
                        <motion.div key={s.label}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                    style={{
                                        padding: '18px 20px', borderRadius: '18px',
                                        background: s.color + '10', border: `1px solid ${s.color}25`,
                                        textAlign: 'center',
                                    }}
                        >
                            <div style={{ fontSize: '26px', fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '14px 18px', marginBottom: '20px',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '14px', color: '#f87171', fontSize: '14px',
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.2)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading your orders...</p>
                    </div>
                ) : orders.length === 0 && !error ? (
                    /* Empty State */
                    <div style={{
                        textAlign: 'center', padding: '80px 20px',
                        background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)',
                        borderRadius: '24px',
                    }}>
                        <ShoppingCart size={52} style={{ color: '#1e293b', margin: '0 auto 16px', display: 'block' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#475569', margin: '0 0 8px' }}>No orders yet</h3>
                        <p style={{ color: '#334155', fontSize: '14px', margin: '0 0 24px' }}>
                            Start shopping to see your orders here
                        </p>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px',
                            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                            borderRadius: '12px', color: '#60a5fa', fontSize: '14px', fontWeight: 600,
                        }}>
                            <Plus size={15} />
                            Browse Products to Order
                        </div>
                    </div>
                ) : (
                    /* Orders List */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {orders.map((order, i) => {
                            const statusIdx = statusToStep[order.status] ?? 0;
                            const color = statusColors[order.status] || '#3b82f6';
                            const isOpen = expanded === String(order.id);

                            return (
                                <motion.div key={order.id}
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                            style={{
                                                background: 'rgba(15,23,42,0.85)',
                                                border: `1px solid ${isOpen ? color + '40' : 'rgba(51,65,85,0.5)'}`,
                                                borderRadius: '20px', overflow: 'hidden',
                                                transition: 'border-color 0.3s',
                                            }}
                                >
                                    {/* Order Header */}
                                    <div
                                        onClick={() => setExpanded(isOpen ? null : String(order.id))}
                                        style={{
                                            padding: '20px 24px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                                                background: color + '15', border: `1px solid ${color}35`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <ShoppingCart size={19} style={{ color }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>
                                                    Order #{order.id}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                                                    {order.createdAt
                                                        ? new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                        : 'Date unknown'
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                      <span style={{
                          padding: '5px 14px', borderRadius: '20px',
                          fontSize: '12px', fontWeight: 700,
                          background: color + '15', color,
                          border: `1px solid ${color}35`,
                      }}>
                        {order.status}
                      </span>
                                            <span style={{ fontSize: '18px', fontWeight: 800, color: '#60a5fa' }}>
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                                            <div style={{ color: '#475569' }}>
                                                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ borderTop: '1px solid rgba(51,65,85,0.4)', overflow: 'hidden' }}
                                            >
                                                <div style={{ padding: '24px' }}>

                                                    {/* Progress Timeline */}
                                                    <div style={{ marginBottom: '28px' }}>
                                                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', margin: '0 0 20px' }}>
                                                            ORDER PROGRESS
                                                        </p>
                                                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                                                            {/* Background line */}
                                                            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', height: '2px', background: 'rgba(51,65,85,0.6)' }} />
                                                            {/* Progress line */}
                                                            <div style={{
                                                                position: 'absolute', top: '20px', left: '20px', height: '2px',
                                                                width: `${(statusIdx / (steps.length - 1)) * (100 - (40 / steps.length))}%`,
                                                                background: order.status === 'CANCELLED' ? '#ef4444' : color,
                                                                transition: 'width 0.6s ease',
                                                            }} />

                                                            {steps.map((step, si) => {
                                                                const done = si <= statusIdx && order.status !== 'CANCELLED';
                                                                const curr = si === statusIdx;
                                                                return (
                                                                    <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                                                                        <motion.div
                                                                            animate={curr && order.status !== 'CANCELLED' ? { scale: [1, 1.12, 1] } : {}}
                                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                                            style={{
                                                                                width: '40px', height: '40px', borderRadius: '50%',
                                                                                background: done ? color + '20' : 'rgba(15,23,42,0.9)',
                                                                                border: `2px solid ${done ? color : 'rgba(51,65,85,0.5)'}`,
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                transition: 'all 0.3s',
                                                                            }}
                                                                        >
                                                                            <step.icon size={16} style={{ color: done ? color : '#374151' }} />
                                                                        </motion.div>
                                                                        <span style={{
                                                                            fontSize: '11px', fontWeight: 600, marginTop: '8px',
                                                                            color: done ? color : '#374151', textAlign: 'center',
                                                                        }}>
                                      {step.label}
                                    </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Items */}
                                                    <div>
                                                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                                                            ORDER ITEMS ({order.items?.length || 0})
                                                        </p>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {(order.items || []).map((item, idx) => (
                                                                <div key={idx} style={{
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                    padding: '12px 16px',
                                                                    background: 'rgba(30,41,59,0.5)', borderRadius: '12px',
                                                                    border: '1px solid rgba(51,65,85,0.4)',
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <Package size={14} style={{ color: '#60a5fa' }} />
                                                                        </div>
                                                                        <div>
                                                                            <p style={{ fontSize: '14px', color: 'white', fontWeight: 600, margin: 0 }}>{item.productName}</p>
                                                                            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Qty: {item.quantity}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#60a5fa', margin: 0 }}>
                                                                            ${(item.price * item.quantity).toFixed(2)}
                                                                        </p>
                                                                        <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
                                                                            ${item.price.toFixed(2)} each
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Total */}
                                                        <div style={{
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            marginTop: '16px', padding: '14px 16px',
                                                            background: color + '10', borderRadius: '12px',
                                                            border: `1px solid ${color}25`,
                                                        }}>
                                                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Order Total</span>
                                                            <span style={{ fontSize: '20px', fontWeight: 800, color }}>
                                ${order.totalAmount?.toFixed(2) || '0.00'}
                              </span>
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
                )}
            </div>
        </div>
    );
}