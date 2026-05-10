import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react';
import { orderApi } from '../services/api';

interface OrderItem { productId: string; productName: string; quantity: number; price: number; }
interface Order { id: number; userId: string; status: string; totalAmount: number; createdAt: string; items: OrderItem[]; }

const steps = [
    { key: 'PENDING', label: 'Placed', icon: ShoppingCart },
    { key: 'PROCESSING', label: 'Processing', icon: Clock },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const statusConfig: Record<string, { color: string; bg: string; border: string; step: number }> = {
    PENDING:    { color: 'var(--accent)',   bg: 'var(--accent-light)',   border: 'var(--accent)',   step: 0 },
    PROCESSING: { color: 'var(--warning)',  bg: 'var(--warning-light)',  border: 'var(--warning)',  step: 1 },
    CONFIRMED:  { color: 'var(--accent)',   bg: 'var(--accent-light)',   border: 'var(--accent)',   step: 1 },
    SHIPPED:    { color: 'var(--purple)',   bg: 'var(--purple-light)',   border: 'var(--purple)',   step: 2 },
    DELIVERED:  { color: 'var(--success)',  bg: 'var(--success-light)',  border: 'var(--success)',  step: 3 },
    CANCELLED:  { color: 'var(--danger)',   bg: 'var(--danger-light)',   border: 'var(--danger)',   step: 0 },
};

export default function OrderTracker() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) { setError('User not identified. Please login again.'); setLoading(false); return; }
        try {
            const res = await orderApi.getAll(userId);
            const data = res.data || [];
            setOrders(data);
            if (data.length > 0) setExpanded(data[0].id);
            setError('');
        } catch (err: any) {
            if (err.response?.status !== 404) setError('Unable to load orders. Make sure the order service is running.');
        } finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchOrders(); };

    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return (
        <div style={{ padding: '80px 24px 40px', maxWidth: '860px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Orders</h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Track your order history</p>
                </div>
                <button onClick={handleRefresh} disabled={refreshing}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)', background: 'var(--bg-card)',
                            color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
                        }}>
                    <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                    { label: 'Total', value: orders.length },
                    { label: 'In Transit', value: orders.filter(o => o.status === 'SHIPPED').length },
                    { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length },
                    { label: 'Spent', value: `$${totalSpent.toFixed(2)}` },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '16px', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.value}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
                    padding: '12px 16px', background: 'var(--danger-light)',
                    border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)',
                    color: 'var(--danger)', fontSize: '13px',
                }}>
                    <AlertCircle size={15} /> {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading orders...</p>
                </div>
            ) : orders.length === 0 && !error ? (
                <div style={{
                    textAlign: 'center', padding: '60px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                }}>
                    <ShoppingCart size={40} style={{ color: 'var(--border-strong)', margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)', margin: '0 0 4px' }}>No orders yet</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Browse products to place your first order</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orders.map(order => {
                        const cfg = statusConfig[order.status] || statusConfig['PENDING'];
                        const isOpen = expanded === order.id;
                        return (
                            <div key={order.id} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                            }}>
                                {/* Header */}
                                <div onClick={() => setExpanded(isOpen ? null : order.id)}
                                     style={{
                                         padding: '16px 20px', cursor: 'pointer',
                                         display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                                     }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: 'var(--radius-md)', flexShrink: 0,
                                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <ShoppingCart size={16} style={{ color: cfg.color }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Order #{order.id}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                    }}>{order.status}</span>
                                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${order.totalAmount?.toFixed(2)}
                    </span>
                                        {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                                    </div>
                                </div>

                                {/* Details */}
                                {isOpen && (
                                    <div style={{ borderTop: '1px solid var(--border)', padding: '20px' }}>

                                        {/* Progress */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', margin: '0 0 16px' }}>PROGRESS</p>
                                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                                                <div style={{ position: 'absolute', top: '18px', left: '18px', right: '18px', height: '1px', background: 'var(--border)' }} />
                                                <div style={{
                                                    position: 'absolute', top: '18px', left: '18px', height: '1px',
                                                    width: `${(cfg.step / (steps.length - 1)) * 100}%`,
                                                    background: cfg.color, transition: 'width 0.5s',
                                                }} />
                                                {steps.map((step, si) => {
                                                    const done = si <= cfg.step;
                                                    return (
                                                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                                                            <div style={{
                                                                width: '36px', height: '36px', borderRadius: '50%',
                                                                background: done ? cfg.bg : 'var(--bg-secondary)',
                                                                border: `1.5px solid ${done ? cfg.color : 'var(--border)'}`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}>
                                                                <step.icon size={14} style={{ color: done ? cfg.color : 'var(--text-muted)' }} />
                                                            </div>
                                                            <span style={{ fontSize: '11px', marginTop: '6px', fontWeight: done ? 500 : 400, color: done ? cfg.color : 'var(--text-muted)' }}>
                                {step.label}
                              </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                                            ITEMS ({order.items?.length || 0})
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                                            {(order.items || []).map((item, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '10px 14px',
                                                    background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--border)',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <Package size={14} style={{ color: 'var(--text-muted)' }} />
                                                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{item.productName}</span>
                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>×{item.quantity}</span>
                                                    </div>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Total */}
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            padding: '12px 14px',
                                            background: cfg.bg, borderRadius: 'var(--radius-md)',
                                            border: `1px solid ${cfg.border}`,
                                        }}>
                                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Total</span>
                                            <span style={{ fontSize: '16px', fontWeight: 600, color: cfg.color }}>${order.totalAmount?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}