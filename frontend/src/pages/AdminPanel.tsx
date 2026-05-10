import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Edit3, Package, AlertTriangle, Brain, X, Check, DollarSign, Archive, BarChart3 } from 'lucide-react';
import { productApi, aiApi } from '../services/api';

interface Product { id?: string; name: string; description: string; price: number; category: string; stockQuantity: number; }
const emptyProduct: Product = { name: '', description: '', price: 0, category: 'Electronics', stockQuantity: 0 };
const categories = ['Electronics', 'Accessories', 'Storage', 'Software', 'Gaming'];

export default function AdminPanel() {
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState<Product>(emptyProduct);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<{ productId: string; result: string } | null>(null);
    const [predLoading, setPredLoading] = useState<string | null>(null);
    const [tab, setTab] = useState<'products' | 'inventory'>('products');
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    useEffect(() => { fetchProducts(); }, []);

    const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

    const fetchProducts = async () => {
        setLoading(true);
        try { const r = await productApi.getAll(); setProducts(r.data || []); }
        catch { setProducts([]); }
        finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!form.name || !form.price) return;
        setLoading(true);
        try {
            if (editing?.id) { await productApi.update(editing.id, form); showToast('Product updated!'); }
            else { await productApi.create(form); showToast('Product created!'); }
            await fetchProducts(); setShowForm(false); setEditing(null); setForm(emptyProduct);
        } catch { showToast('Error saving product', false); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try { await productApi.delete(id); showToast('Product deleted!'); await fetchProducts(); }
        catch { showToast('Error deleting product', false); }
    };

    const handleEdit = (p: Product) => { setEditing(p); setForm({ ...p }); setShowForm(true); };

    const predict = async (p: Product) => {
        if (!p.id) return;
        setPredLoading(p.id); setPrediction(null);
        try {
            const r = await aiApi.predictInventory({ productId: p.id, productName: p.name, currentStock: p.stockQuantity, salesHistory: [12, 15, 8, 20, 18, 14, 22], category: p.category });
            setPrediction({ productId: p.id, result: r.data });
        } catch { setPrediction({ productId: p.id, result: 'Prediction unavailable.' }); }
        finally { setPredLoading(null); }
    };

    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
    const lowStock = products.filter(p => p.stockQuantity <= 10 && p.stockQuantity > 0).length;
    const outOfStock = products.filter(p => p.stockQuantity === 0).length;

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '9px 12px',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
        fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    };

    return (
        <div style={{ padding: '80px 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '72px', right: '24px', zIndex: 200,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 16px', borderRadius: 'var(--radius-md)',
                    background: toast.ok ? 'var(--success-light)' : 'var(--danger-light)',
                    border: `1px solid ${toast.ok ? 'var(--success)' : 'var(--danger)'}`,
                    color: toast.ok ? 'var(--success)' : 'var(--danger)',
                    fontSize: '14px', fontWeight: 500, boxShadow: 'var(--shadow-md)',
                }}>
                    {toast.ok ? <Check size={15} /> : <X size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={20} style={{ color: 'var(--danger)' }} /> Admin Panel
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Manage products and inventory</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyProduct); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 16px', background: 'var(--accent)',
                            border: 'none', borderRadius: 'var(--radius-md)',
                            color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                        }}>
                    <Plus size={15} /> Add Product
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                    { label: 'Total Products', value: products.length, icon: Package },
                    { label: 'Inventory Value', value: `$${totalValue.toLocaleString('en', { maximumFractionDigits: 0 })}`, icon: DollarSign },
                    { label: 'Low Stock', value: lowStock, icon: AlertTriangle },
                    { label: 'Out of Stock', value: outOfStock, icon: Archive },
                ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.label}</span>
                            <s.icon size={15} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[{ id: 'products', label: 'Products', icon: BarChart3 }, { id: 'inventory', label: 'AI Inventory Prediction', icon: Brain }].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id as any)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 16px', borderRadius: 'var(--radius-md)',
                                border: `1px solid ${tab === t.id ? 'var(--accent)' : 'var(--border)'}`,
                                background: tab === t.id ? 'var(--accent-light)' : 'var(--bg-card)',
                                color: tab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                                fontSize: '13px', fontWeight: tab === t.id ? 500 : 400, cursor: 'pointer',
                            }}>
                        <t.icon size={14} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Products Tab */}
            {tab === 'products' && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto 12px' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <Package size={40} style={{ color: 'var(--border-strong)', margin: '0 auto 12px', display: 'block' }} />
                            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)', margin: '0 0 4px' }}>No products yet</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Click "Add Product" to get started</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '12px 18px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {products.map((p, i) => (
                                <tr key={p.id || i} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ padding: '14px 18px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Package size={14} style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 2px' }}>{p.name}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '3px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {p.category}
                      </span>
                                    </td>
                                    <td style={{ padding: '14px 18px' }}>
                                        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>${p.price}</span>
                                    </td>
                                    <td style={{ padding: '14px 18px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: p.stockQuantity > 20 ? 'var(--success)' : p.stockQuantity > 5 ? 'var(--warning)' : 'var(--danger)' }} />
                                            <span style={{ fontSize: '14px', fontWeight: 500, color: p.stockQuantity > 20 ? 'var(--success)' : p.stockQuantity > 5 ? 'var(--warning)' : 'var(--danger)' }}>
                          {p.stockQuantity}
                        </span>
                                            {p.stockQuantity === 0 && <span style={{ fontSize: '11px', padding: '1px 6px', background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '4px' }}>OUT</span>}
                                            {p.stockQuantity > 0 && p.stockQuantity <= 10 && <span style={{ fontSize: '11px', padding: '1px 6px', background: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid var(--warning)', borderRadius: '4px' }}>LOW</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 18px' }}>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => handleEdit(p)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
                                                <Edit3 size={12} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(p.id!)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', background: 'var(--danger-light)', color: 'var(--danger)', fontSize: '12px', cursor: 'pointer' }}>
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* AI Inventory Tab */}
            {tab === 'inventory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Brain size={16} style={{ color: 'var(--purple)' }} /> AI Inventory Prediction
                        </h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
                            Click a product to get AI-powered stock predictions
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                            {products.map(p => (
                                <button key={p.id} onClick={() => predict(p)} disabled={predLoading === p.id}
                                        style={{
                                            padding: '14px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                                            background: prediction?.productId === p.id ? 'var(--purple-light)' : 'var(--bg-secondary)',
                                            border: `1px solid ${prediction?.productId === p.id ? 'var(--purple)' : 'var(--border)'}`,
                                            cursor: predLoading === p.id ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.15s',
                                        }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px' }}>{p.name}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Stock: {p.stockQuantity}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--purple)' }}>
                                            {predLoading === p.id ? <div className="spinner" style={{ width: '12px', height: '12px' }} /> : <Brain size={12} />}
                                            Predict
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {prediction && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--purple)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--purple)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Brain size={15} /> AI Prediction Result
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>
                                {prediction.result}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                     onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                    <div style={{ width: '100%', maxWidth: '460px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-md)' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                                    {editing ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                                    {editing ? 'Update product details' : 'Fill in the product information'}
                                </p>
                            </div>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Name *</label>
                                <input type="text" placeholder="e.g. Wireless Headphones" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                                <textarea placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price ($) *</label>
                                    <input type="number" placeholder="0.00" min="0" step="0.01" value={form.price || ''} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock *</label>
                                    <input type="number" placeholder="0" min="0" value={form.stockQuantity || ''} onChange={e => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={handleSubmit} disabled={loading || !form.name || !form.price}
                                    style={{ flex: 2, padding: '10px', borderRadius: 'var(--radius-md)', border: 'none', background: loading || !form.name || !form.price ? 'var(--border-strong)' : 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: loading || !form.name || !form.price ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                {loading ? <div className="spinner" /> : <><Check size={15} /> {editing ? 'Update' : 'Create'}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}