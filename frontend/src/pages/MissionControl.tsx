import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Server, Package, ShoppingCart,
    Bell, Database, Zap, TrendingUp
} from 'lucide-react';

const services = [
    { id: 'api-gateway', name: 'API Gateway', port: 8080, color: '#3b82f6', icon: Zap },
    { id: 'identity', name: 'Identity', port: 8085, color: '#8b5cf6', icon: Server },
    { id: 'product', name: 'Products', port: 8081, color: '#06b6d4', icon: Package },
    { id: 'order', name: 'Orders', port: 8082, color: '#10b981', icon: ShoppingCart },
    { id: 'inventory', name: 'Inventory', port: 8083, color: '#f59e0b', icon: Database },
    { id: 'notification', name: 'Notifications', port: 8084, color: '#ef4444', icon: Bell },
    { id: 'ai', name: 'AI Service', port: 8086, color: '#a855f7', icon: Activity },
];

const liveEvents = [
    { id: 1, type: 'ORDER_PLACED', message: 'New order #1042 placed', time: '2s ago', color: '#10b981' },
    { id: 2, type: 'INVENTORY_RESERVED', message: 'Stock reserved for order #1042', time: '3s ago', color: '#f59e0b' },
    { id: 3, type: 'NOTIFICATION_SENT', message: 'Email sent to customer', time: '4s ago', color: '#3b82f6' },
    { id: 4, type: 'ORDER_PLACED', message: 'New order #1041 placed', time: '1m ago', color: '#10b981' },
    { id: 5, type: 'AI_RECOMMENDATION', message: 'AI generated recommendations', time: '2m ago', color: '#a855f7' },
];

const stats = [
    { label: 'Total Orders', value: '1,284', change: '+12%', icon: ShoppingCart, color: '#10b981' },
    { label: 'Active Products', value: '342', change: '+5%', icon: Package, color: '#3b82f6' },
    { label: 'Revenue Today', value: '$8,492', change: '+18%', icon: TrendingUp, color: '#8b5cf6' },
    { label: 'Services Online', value: '7/7', change: '100%', icon: Activity, color: '#06b6d4' },
];

export default function MissionControl() {
    const [serviceStatuses, setServiceStatuses] = useState<Record<string, boolean>>({});
    const [events, setEvents] = useState(liveEvents);

    useEffect(() => {
        const statuses: Record<string, boolean> = {};
        services.forEach(s => {
            statuses[s.id] = Math.random() > 0.1;
        });
        setServiceStatuses(statuses);

        const interval = setInterval(() => {
            const newEvent = {
                id: Date.now(),
                type: ['ORDER_PLACED', 'INVENTORY_RESERVED', 'NOTIFICATION_SENT'][Math.floor(Math.random() * 3)],
                message: `System event at ${new Date().toLocaleTimeString()}`,
                time: 'just now',
                color: ['#10b981', '#f59e0b', '#3b82f6'][Math.floor(Math.random() * 3)],
            };
            setEvents(prev => [newEvent, ...prev.slice(0, 7)]);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen pt-20 px-6 pb-6 relative z-10">
            <div className="max-w-7xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Mission Control
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Distributed E-Commerce Ecosystem — Real-time Overview
                    </p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glassmorphism rounded-xl p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">{stat.label}</span>
                                <stat.icon size={16} style={{ color: stat.color }} />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs mt-1" style={{ color: stat.color }}>
                                {stat.change} this week
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Services Constellation */}
                    <div className="lg:col-span-2 glassmorphism rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-blue-400" />
                            Service Constellation
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {services.map((service, i) => {
                                const isOnline = serviceStatuses[service.id];
                                return (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="relative p-4 rounded-xl border cursor-pointer transition-all"
                                        style={{
                                            borderColor: isOnline ? service.color + '40' : '#374151',
                                            background: isOnline ? service.color + '10' : 'rgba(17,24,39,0.5)',
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <service.icon size={16} style={{ color: service.color }} />
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                    backgroundColor: isOnline ? '#10b981' : '#ef4444',
                                                    boxShadow: isOnline ? '0 0 6px #10b981' : 'none',
                                                }}
                                            />
                                        </div>
                                        <div className="text-sm font-medium">{service.name}</div>
                                        <div className="text-xs text-slate-400 mt-1">:{service.port}</div>
                                        <div
                                            className="text-xs mt-1 font-medium"
                                            style={{ color: isOnline ? '#10b981' : '#ef4444' }}
                                        >
                                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Live Event Stream */}
                    <div className="glassmorphism rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Zap size={18} className="text-yellow-400" />
                            Live Event Stream
                        </h2>
                        <div className="space-y-3 overflow-hidden">
                            {events.map((event, i) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30"
                                >
                                    <div
                                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse-glow"
                                        style={{ backgroundColor: event.color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className="text-xs font-mono font-medium"
                                            style={{ color: event.color }}
                                        >
                                            {event.type}
                                        </div>
                                        <div className="text-xs text-slate-400 truncate">
                                            {event.message}
                                        </div>
                                        <div className="text-xs text-slate-600 mt-0.5">
                                            {event.time}
                                        </div>
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