import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Truck, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { orderApi } from '../services/api';

interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: OrderItem[];
}

const mockOrders: Order[] = [
    {
        id: 'ORD-1042',
        status: 'DELIVERED',
        totalAmount: 1299.99,
        createdAt: '2026-04-28T10:30:00',
        items: [{ productId: '1', productName: 'Quantum Laptop Pro', quantity: 1, price: 1299.99 }]
    },
    {
        id: 'ORD-1041',
        status: 'SHIPPED',
        totalAmount: 379.98,
        createdAt: '2026-04-30T14:20:00',
        items: [
            { productId: '2', productName: 'Neural Headphones X', quantity: 1, price: 299.99 },
            { productId: '4', productName: 'CyberMouse Elite', quantity: 1, price: 79.99 },
        ]
    },
    {
        id: 'ORD-1040',
        status: 'PROCESSING',
        totalAmount: 149.99,
        createdAt: '2026-05-01T09:15:00',
        items: [{ productId: '5', productName: 'Fusion Keyboard MX', quantity: 1, price: 149.99 }]
    },
];

const statusSteps = [
    { key: 'PLACED', label: 'Order Placed', icon: ShoppingCart },
    { key: 'PROCESSING', label: 'Processing', icon: Clock },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const statusColors: Record<string, string> = {
    PLACED: '#3b82f6',
    PROCESSING: '#f59e0b',
    SHIPPED: '#8b5cf6',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444',
};

function getStatusIndex(status: string): number {
    const idx = statusSteps.findIndex(s => s.key === status);
    return idx === -1 ? 0 : idx;
}

export default function OrderTracker() {
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [expandedOrder, setExpandedOrder] = useState<string | null>('ORD-1041');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        try {
            const response = await orderApi.getAll(userId);
            if (response.data && response.data.length > 0) {
                setOrders(response.data);
            }
        } catch {
            // use mock data
        }
    };

    return (
        <div className="min-h-screen pt-20 px-6 pb-6 relative z-10">
            <div className="max-w-4xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                        Order Tracker
                    </h1>
                    <p className="text-slate-400 mt-1">Track your orders in real-time</p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total Orders', value: orders.length, color: '#3b82f6' },
                        { label: 'In Transit', value: orders.filter(o => o.status === 'SHIPPED').length, color: '#8b5cf6' },
                        { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length, color: '#10b981' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glassmorphism rounded-xl p-4 text-center"
                        >
                            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {orders.map((order, i) => {
                            const statusIdx = getStatusIndex(order.status);
                            const isExpanded = expandedOrder === order.id;

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glassmorphism rounded-2xl overflow-hidden"
                                >
                                    {/* Order Header */}
                                    <div
                                        className="p-5 cursor-pointer flex items-center justify-between"
                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ background: statusColors[order.status] + '20', border: `1px solid ${statusColors[order.status]}40` }}
                                            >
                                                <ShoppingCart size={18} style={{ color: statusColors[order.status] }} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">{order.id}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                      <span
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{
                              background: statusColors[order.status] + '20',
                              color: statusColors[order.status],
                              border: `1px solid ${statusColors[order.status]}40`
                          }}
                      >
                        {order.status}
                      </span>
                                            <span className="font-bold text-blue-400">${order.totalAmount.toFixed(2)}</span>
                                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-t border-slate-800"
                                            >
                                                {/* Progress Timeline */}
                                                <div className="p-5">
                                                    <div className="flex items-center justify-between mb-6 relative">
                                                        <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-800" />
                                                        <div
                                                            className="absolute left-0 top-5 h-0.5 transition-all duration-500"
                                                            style={{
                                                                width: `${(statusIdx / (statusSteps.length - 1)) * 100}%`,
                                                                background: statusColors[order.status],
                                                            }}
                                                        />

                                                        {statusSteps.map((step, idx) => {
                                                            const isCompleted = idx <= statusIdx;
                                                            const isCurrent = idx === statusIdx;
                                                            return (
                                                                <div key={step.key} className="flex flex-col items-center relative z-10">
                                                                    <motion.div
                                                                        className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                                                                        style={{
                                                                            background: isCompleted ? statusColors[order.status] + '20' : '#0f172a',
                                                                            borderColor: isCompleted ? statusColors[order.status] : '#374151',
                                                                        }}
                                                                        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                                                                        transition={{ duration: 1, repeat: Infinity }}
                                                                    >
                                                                        <step.icon
                                                                            size={16}
                                                                            style={{ color: isCompleted ? statusColors[order.status] : '#4b5563' }}
                                                                        />
                                                                    </motion.div>
                                                                    <span className="text-xs mt-2 text-center w-16" style={{
                                                                        color: isCompleted ? statusColors[order.status] : '#4b5563'
                                                                    }}>
                                    {step.label}
                                  </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="space-y-2">
                                                        <div className="text-xs text-slate-400 font-medium mb-2">ORDER ITEMS</div>
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                                                                <div className="flex items-center gap-3">
                                                                    <Package size={14} className="text-blue-400" />
                                                                    <span className="text-sm">{item.productName}</span>
                                                                    <span className="text-xs text-slate-400">x{item.quantity}</span>
                                                                </div>
                                                                <span className="text-sm font-medium text-blue-400">
                                  ${item.price.toFixed(2)}
                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}