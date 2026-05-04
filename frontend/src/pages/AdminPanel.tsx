import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Plus, Trash2, Edit3, Package,
    AlertTriangle, Brain, X, Check,
    BarChart3, TrendingUp, DollarSign, Archive
} from 'lucide-react';
import { productApi, aiApi } from '../services/api';

interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stockQuantity: number;
}

const emptyProduct: Product = {
    name: '', description: '', price: 0, category: 'Electronics', stockQuantity: 0
};

const categories = ['Electronics', 'Accessories', 'Storage', 'Software', 'Gaming'];

export default function AdminPanel() {
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState<Product>(emptyProduct);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<{ productId: string; result: string } | null>(null);
    const [predLoading, setPredLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'products' | 'inventory'>('products');
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => { fetchProducts(); }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productApi.getAll();
            setProducts(response.data || []);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.name || !form.price) return;
        setLoading(true);
        try {
            if (editingProduct?.id) {
                await productApi.update(editingProduct.id, form);
                showToast('Product updated successfully!');
            } else {
                await productApi.create(form);
                showToast('Product created successfully!');
            }
            await fetchProducts();
            setShowForm(false);
            setEditingProduct(null);
            setForm(emptyProduct);
        } catch {
            showToast('Error saving product', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await productApi.delete(id);
            showToast('Product deleted successfully!');
            await fetchProducts();
        } catch {
            showToast('Error deleting product', 'error');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setForm({ ...product });
        setShowForm(true);
    };

    const predictInventory = async (product: Product) => {
        if (!product.id) return;
        setPredLoading(product.id);
        setPrediction(null);
        try {
            const response = await aiApi.predictInventory({
                productId: product.id,
                productName: product.name,
                currentStock: product.stockQuantity,
                salesHistory: [12, 15, 8, 20, 18, 14, 22],
                category: product.category,
            });
            setPrediction({ productId: product.id, result: response.data });
        } catch {
            setPrediction({ productId: product.id, result: 'Prediction unavailable at this time.' });
        } finally {
            setPredLoading(null);
        }
    };

    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
    const lowStockCount = products.filter(p => p.stockQuantity <= 10 && p.stockQuantity > 0).length;
    const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

    const inputStyle = {
        width: '100%', padding: '11px 14px',
        background: 'rgba(30,41,59,0.8)',
        border: '1px solid rgba(71,85,105,0.5)',
        borderRadius: '10px', color: 'white', fontSize: '14px',
        outline: 'none', boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        display: 'block', fontSize: '12px',
        fontWeight: 600, color: '#94a3b8',
        marginBottom: '6px', textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    };

    return (
        <div className="page-container">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, x: '50%' }}
                            animate={{ opacity: 1, y: 0, x: '50%' }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                position: 'fixed', top: '84px', right: '0',
                                transform: 'translateX(-50%)', zIndex: 100,
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '12px 20px', borderRadius: '14px',
                                background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                color: toast.type === 'success' ? '#34d399' : '#f87171',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <Check size={16} />
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{toast.msg}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '32px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Shield size={20} style={{ color: '#f87171' }} />
                                </div>
                                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'white', margin: 0 }}>Admin Panel</h1>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                                Manage products, monitor inventory, and get AI-powered insights
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setShowForm(true); setEditingProduct(null); setForm(emptyProduct); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 22px',
                                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                border: 'none', borderRadius: '14px',
                                color: 'white', fontSize: '14px', fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 6px 24px rgba(239,68,68,0.3)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Plus size={17} />
                            Add New Product
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
                    {[
                        { label: 'Total Products', value: products.length, icon: Package, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
                        { label: 'Inventory Value', value: `$${totalValue.toLocaleString('en', { maximumFractionDigits: 0 })}`, icon: DollarSign, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                        { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                        { label: 'Out of Stock', value: outOfStockCount, icon: Archive, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
                    ].map((s, i) => (
                        <motion.div key={s.label}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                    style={{
                                        padding: '18px 20px', borderRadius: '18px',
                                        background: s.bg, border: `1px solid ${s.color}22`,
                                    }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{s.label}</span>
                                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <s.icon size={15} style={{ color: s.color }} />
                                </div>
                            </div>
                            <div style={{ fontSize: '26px', fontWeight: 800, color: 'white' }}>{s.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {[
                        { id: 'products', label: 'Products', icon: BarChart3 },
                        { id: 'inventory', label: 'AI Inventory Prediction', icon: Brain },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 20px', borderRadius: '12px',
                                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                    background: activeTab === tab.id ? 'rgba(239,68,68,0.15)' : 'rgba(30,41,59,0.5)',
                                    border: `1px solid ${activeTab === tab.id ? 'rgba(239,68,68,0.4)' : 'rgba(51,65,85,0.5)'}`,
                                    color: activeTab === tab.id ? '#f87171' : '#94a3b8',
                                    transition: 'all 0.2s',
                                }}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '20px', overflow: 'hidden' }}
                    >
                        {loading ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <div style={{ width: '36px', height: '36px', border: '3px solid rgba(59,130,246,0.2)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                                <p style={{ color: '#64748b', fontSize: '14px' }}>Loading products...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div style={{ padding: '80px', textAlign: 'center' }}>
                                <Package size={52} style={{ color: '#1e293b', margin: '0 auto 16px', display: 'block' }} />
                                <p style={{ color: '#475569', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>No products yet</p>
                                <p style={{ color: '#334155', fontSize: '14px', margin: '0 0 24px' }}>Start by adding your first product</p>
                                <button
                                    onClick={() => { setShowForm(true); setEditingProduct(null); setForm(emptyProduct); }}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 20px',
                                        background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                        border: 'none', borderRadius: '12px', color: 'white',
                                        fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                                    }}
                                >
                                    <Plus size={15} /> Add First Product
                                </button>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
                                    {['Product', 'Category', 'Price', 'Stock Status', 'Actions'].map(h => (
                                        <th key={h} style={{
                                            textAlign: 'left', padding: '14px 20px',
                                            fontSize: '11px', fontWeight: 700, color: '#64748b',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                        }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {products.map((product, i) => (
                                    <motion.tr key={product.id || i}
                                               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                               style={{ borderBottom: '1px solid rgba(51,65,85,0.25)', cursor: 'default' }}
                                               onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,41,59,0.3)'}
                                               onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{
                                                    width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                                                    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Package size={16} style={{ color: '#60a5fa' }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: '0 0 3px' }}>{product.name}</p>
                                                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {product.description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                        <span style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                            background: 'rgba(99,102,241,0.12)', color: '#a5b4fc',
                            border: '1px solid rgba(99,102,241,0.25)',
                        }}>
                          {product.category}
                        </span>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#60a5fa' }}>
                          ${Number(product.price).toFixed(2)}
                        </span>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '8px', height: '8px', borderRadius: '50%',
                                                    background: product.stockQuantity > 20 ? '#10b981' : product.stockQuantity > 5 ? '#f59e0b' : '#ef4444',
                                                    boxShadow: `0 0 6px ${product.stockQuantity > 20 ? '#10b981' : product.stockQuantity > 5 ? '#f59e0b' : '#ef4444'}`,
                                                }} />
                                                <span style={{
                                                    fontSize: '14px', fontWeight: 600,
                                                    color: product.stockQuantity > 20 ? '#34d399' : product.stockQuantity > 5 ? '#fbbf24' : '#f87171',
                                                }}>
                            {product.stockQuantity} units
                          </span>
                                                {product.stockQuantity === 0 && (
                                                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontWeight: 600 }}>
                              OUT
                            </span>
                                                )}
                                                {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                                                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontWeight: 600 }}>
                              LOW
                            </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                                                        background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                                                        border: '1px solid rgba(59,130,246,0.25)', cursor: 'pointer', transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.45)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; }}
                                                >
                                                    <Edit3 size={12} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id!)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                                                        background: 'rgba(239,68,68,0.1)', color: '#f87171',
                                                        border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.45)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </motion.div>
                )}

                {/* AI Inventory Tab */}
                {activeTab === 'inventory' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '20px', padding: '28px' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Brain size={16} style={{ color: '#c084fc' }} />
                                    </div>
                                    AI Inventory Prediction
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                                    Select a product to receive AI-powered stock predictions and smart reorder recommendations
                                </p>
                            </div>

                            {products.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    <p>No products available. Add products first.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                                    {products.map(product => (
                                        <motion.div key={product.id} whileHover={{ scale: 1.02 }}
                                                    style={{
                                                        padding: '18px', borderRadius: '16px', cursor: 'pointer',
                                                        background: prediction?.productId === product.id ? 'rgba(168,85,247,0.1)' : 'rgba(30,41,59,0.5)',
                                                        border: `1px solid ${prediction?.productId === product.id ? 'rgba(168,85,247,0.4)' : 'rgba(51,65,85,0.4)'}`,
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onClick={() => predictInventory(product)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Package size={15} style={{ color: '#a5b4fc' }} />
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>{product.name}</p>
                                                        <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>{product.category}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px' }}>Current Stock</p>
                                                    <p style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: product.stockQuantity > 20 ? '#34d399' : product.stockQuantity > 5 ? '#fbbf24' : '#f87171' }}>
                                                        {product.stockQuantity} units
                                                    </p>
                                                </div>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                                                    background: predLoading === product.id ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.15)',
                                                    color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)',
                                                }}>
                                                    {predLoading === product.id ? (
                                                        <div style={{ width: '14px', height: '14px', border: '2px solid rgba(192,132,252,0.3)', borderTop: '2px solid #c084fc', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                                    ) : (
                                                        <Brain size={13} />
                                                    )}
                                                    {predLoading === product.id ? 'Analyzing...' : 'Predict'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {prediction && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: 'rgba(15,23,42,0.85)',
                                            border: '1px solid rgba(168,85,247,0.3)',
                                            borderRadius: '20px', padding: '28px',
                                        }}
                            >
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#c084fc', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Brain size={18} />
                                    AI Prediction Result
                                </h3>
                                <div style={{
                                    padding: '18px', borderRadius: '14px',
                                    background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)',
                                    fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap',
                                }}>
                                    {prediction.result}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed', inset: 0, zIndex: 50,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
                                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                            }}
                            onClick={e => e.target === e.currentTarget && setShowForm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.92, opacity: 0, y: 24 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.92, opacity: 0, y: 24 }}
                                style={{
                                    width: '100%', maxWidth: '480px',
                                    background: '#0d1829',
                                    border: '1px solid rgba(51,65,85,0.7)',
                                    borderRadius: '24px', padding: '32px',
                                    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                                }}
                            >
                                {/* Modal Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: '0 0 4px' }}>
                                            {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                                        </h2>
                                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                            {editingProduct ? 'Update the product information below' : 'Fill in the details for your new product'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowForm(false)}
                                        style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: 'rgba(51,65,85,0.5)', border: '1px solid rgba(71,85,105,0.4)',
                                            color: '#94a3b8', cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    <div>
                                        <label style={labelStyle}>Product Name *</label>
                                        <input type="text" placeholder="e.g. Wireless Headphones Pro"
                                               value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                               style={inputStyle} />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Description</label>
                                        <textarea
                                            placeholder="Describe the product features and benefits..."
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            rows={3}
                                            style={{ ...inputStyle, resize: 'none' as const }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                        <div>
                                            <label style={labelStyle}>Price (USD) *</label>
                                            <input type="number" placeholder="0.00" min="0" step="0.01"
                                                   value={form.price || ''}
                                                   onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                                   style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Stock Quantity *</label>
                                            <input type="number" placeholder="0" min="0"
                                                   value={form.stockQuantity || ''}
                                                   onChange={e => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })}
                                                   style={inputStyle} />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Category</label>
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                                style={{ ...inputStyle, cursor: 'pointer' }}>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat} style={{ background: '#0d1829' }}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                                    <button onClick={() => setShowForm(false)}
                                            style={{
                                                flex: 1, padding: '12px', borderRadius: '12px',
                                                background: 'rgba(51,65,85,0.4)', border: '1px solid rgba(71,85,105,0.4)',
                                                color: '#94a3b8', fontSize: '14px', fontWeight: 600,
                                                cursor: 'pointer', transition: 'all 0.2s',
                                            }}
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmit}
                                        disabled={loading || !form.name || !form.price}
                                        style={{
                                            flex: 2, padding: '12px',
                                            background: loading || !form.name || !form.price
                                                ? 'rgba(239,68,68,0.3)'
                                                : 'linear-gradient(135deg, #ef4444, #f97316)',
                                            border: 'none', borderRadius: '12px',
                                            color: 'white', fontSize: '14px', fontWeight: 700,
                                            cursor: loading || !form.name || !form.price ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            boxShadow: loading || !form.name || !form.price ? 'none' : '0 4px 20px rgba(239,68,68,0.3)',
                                        }}
                                    >
                                        {loading ? (
                                            <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                        ) : (
                                            <>
                                                <Check size={16} />
                                                {editingProduct ? 'Update Product' : 'Create Product'}
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}