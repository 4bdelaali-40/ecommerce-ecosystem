import { useState, useEffect } from 'react';
import { Search, Package, Star, ShoppingCart, Sparkles, Check, X } from 'lucide-react';
import { productApi, aiApi, orderApi } from '../services/api';

interface Product {
    id: string; name: string; description: string;
    price: number; category: string; stockQuantity: number;
}

const mockProducts: Product[] = [
    { id: '1', name: 'Quantum Laptop Pro', description: 'Ultra-fast computing for professionals', price: 1299.99, category: 'Electronics', stockQuantity: 15 },
    { id: '2', name: 'Neural Headphones X', description: 'AI-enhanced immersive audio', price: 299.99, category: 'Electronics', stockQuantity: 42 },
    { id: '3', name: 'HoloDesk Monitor', description: '4K display technology', price: 899.99, category: 'Electronics', stockQuantity: 8 },
    { id: '4', name: 'CyberMouse Elite', description: 'Precision tracking at 25600 DPI', price: 79.99, category: 'Accessories', stockQuantity: 120 },
    { id: '5', name: 'Fusion Keyboard MX', description: 'Mechanical switches with RGB', price: 149.99, category: 'Accessories', stockQuantity: 67 },
    { id: '6', name: 'CloudStorage Hub', description: '2TB portable NVMe storage', price: 199.99, category: 'Storage', stockQuantity: 34 },
];

const categories = ['All', 'Electronics', 'Accessories', 'Storage'];

export default function ProductExplorer() {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [aiSearching, setAiSearching] = useState(false);
    const [aiResult, setAiResult] = useState('');
    const [ordering, setOrdering] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    useEffect(() => {
        productApi.getAll().then(r => { if (r.data?.length) setProducts(r.data); }).catch(() => {});
    }, []);

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAiSearch = async () => {
        if (!search.trim()) return;
        setAiSearching(true); setAiResult('');
        try {
            const r = await aiApi.search(search, products.map(p => p.name).join(', '));
            setAiResult(r.data);
        } catch { setAiResult('AI search unavailable.'); }
        finally { setAiSearching(false); }
    };

    const handleBuy = async (product: Product) => {
        const userId = localStorage.getItem('userId');
        if (!userId) return showToast('Please login first', false);
        setOrdering(product.id);
        try {
            await orderApi.create({ userId, items: [{ productId: product.id, productName: product.name, quantity: 1, price: product.price }] });
            showToast(`Order placed for ${product.name}!`);
        } catch { showToast('Failed to place order', false); }
        finally { setOrdering(null); }
    };

    const filtered = products.filter(p => {
        const matchCat = category === 'All' || p.category === category;
        const matchQ = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchQ;
    });

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
                    fontSize: '14px', fontWeight: 500,
                    boxShadow: 'var(--shadow-md)',
                }}>
                    {toast.ok ? <Check size={15} /> : <X size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Products</h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Browse and order with AI-powered search</p>
            </div>

            {/* Search */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text" placeholder="Search products or try 'fast laptop for gaming'..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                            style={{
                                width: '100%', padding: '9px 12px 9px 36px',
                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <button onClick={handleAiSearch} disabled={aiSearching}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '9px 16px', background: 'var(--accent)',
                                border: 'none', borderRadius: 'var(--radius-md)',
                                color: '#fff', fontSize: '13px', fontWeight: 500,
                                cursor: aiSearching ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                                opacity: aiSearching ? 0.7 : 1,
                            }}>
                        <Sparkles size={14} />
                        {aiSearching ? 'Searching...' : 'AI Search'}
                    </button>
                </div>

                {aiResult && (
                    <div style={{
                        marginTop: '12px', padding: '12px 14px',
                        background: 'var(--accent-light)', border: '1px solid var(--accent)',
                        borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-primary)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <Sparkles size={13} style={{ color: 'var(--accent)' }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>AI Result</span>
                        </div>
                        {aiResult}
                    </div>
                )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                            style={{
                                padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
                                background: category === cat ? 'var(--accent)' : 'var(--bg-card)',
                                border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
                                color: category === cat ? '#fff' : 'var(--text-secondary)',
                                cursor: 'pointer', fontWeight: category === cat ? 500 : 400,
                                transition: 'all 0.15s',
                            }}>
                        {cat}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </span>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    <p style={{ fontSize: '15px' }}>No products found</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {filtered.map(product => (
                        <div key={product.id} style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                            transition: 'box-shadow 0.15s',
                        }}
                             onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                             onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                        >
                            {/* Image */}
                            <div style={{
                                height: '120px', background: 'var(--bg-secondary)',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                            }}>
                                <Package size={36} style={{ color: 'var(--border-strong)' }} />
                                {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
                                        background: 'var(--warning-light)', color: 'var(--warning)',
                                        border: '1px solid var(--warning)',
                                    }}>Low stock</span>
                                )}
                                {product.stockQuantity === 0 && (
                                    <span style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
                                        background: 'var(--danger-light)', color: 'var(--danger)',
                                        border: '1px solid var(--danger)',
                                    }}>Out of stock</span>
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{product.name}</h3>
                                    <span style={{
                                        padding: '2px 8px', flexShrink: 0,
                                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                        borderRadius: '20px', fontSize: '11px', color: 'var(--text-secondary)',
                                    }}>{product.category}</span>
                                </div>

                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: '1.5' }}>
                                    {product.description}
                                </p>

                                <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={11} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                                    ))}
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>5.0</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            ${product.price.toFixed(2)}
                                        </div>
                                        <div style={{
                                            fontSize: '11px', marginTop: '2px',
                                            color: product.stockQuantity > 10 ? 'var(--success)' : product.stockQuantity > 0 ? 'var(--warning)' : 'var(--danger)',
                                        }}>
                                            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => product.stockQuantity > 0 && handleBuy(product)}
                                        disabled={product.stockQuantity === 0 || ordering === product.id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 14px', borderRadius: 'var(--radius-md)',
                                            background: product.stockQuantity === 0 ? 'var(--bg-secondary)' : 'var(--accent)',
                                            border: `1px solid ${product.stockQuantity === 0 ? 'var(--border)' : 'var(--accent)'}`,
                                            color: product.stockQuantity === 0 ? 'var(--text-muted)' : '#fff',
                                            fontSize: '13px', fontWeight: 500,
                                            cursor: product.stockQuantity === 0 || ordering === product.id ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.15s',
                                            opacity: ordering === product.id ? 0.7 : 1,
                                        }}>
                                        {ordering === product.id ? (
                                            <div className="spinner" style={{ width: '14px', height: '14px' }} />
                                        ) : (
                                            <>
                                                <ShoppingCart size={13} />
                                                Buy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}