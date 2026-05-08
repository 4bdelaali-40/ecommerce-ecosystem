import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Star, ShoppingCart, Sparkles, Check, X } from 'lucide-react';
import { productApi, aiApi, orderApi } from '../services/api';

interface Product {
    id: string; name: string; description: string;
    price: number; category: string; stockQuantity: number;
}

const mockProducts: Product[] = [
    { id: '1', name: 'Quantum Laptop Pro', description: 'Ultra-fast computing power for professionals', price: 1299.99, category: 'Electronics', stockQuantity: 15 },
    { id: '2', name: 'Neural Headphones X', description: 'AI-enhanced immersive audio experience', price: 299.99, category: 'Electronics', stockQuantity: 42 },
    { id: '3', name: 'HoloDesk Monitor', description: '4K holographic display technology', price: 899.99, category: 'Electronics', stockQuantity: 8 },
    { id: '4', name: 'CyberMouse Elite', description: 'Precision tracking at 25600 DPI', price: 79.99, category: 'Accessories', stockQuantity: 120 },
    { id: '5', name: 'Fusion Keyboard MX', description: 'Mechanical switches with RGB lighting', price: 149.99, category: 'Accessories', stockQuantity: 67 },
    { id: '6', name: 'CloudStorage Hub', description: '2TB portable NVMe storage solution', price: 199.99, category: 'Storage', stockQuantity: 34 },
];

const categories = ['All', 'Electronics', 'Accessories', 'Storage'];

export default function ProductExplorer() {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [aiSearchResult, setAiSearchResult] = useState('');
    const [orderingProduct, setOrderingProduct] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        productApi.getAll()
            .then(r => { if (r.data?.length) setProducts(r.data); })
            .catch(() => {});
    }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleAiSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsAiSearching(true);
        setAiSearchResult('');
        try {
            const names = products.map(p => p.name).join(', ');
            const r = await aiApi.search(searchQuery, names);
            setAiSearchResult(r.data);
        } catch {
            setAiSearchResult('AI search unavailable. Showing filtered results.');
        } finally {
            setIsAiSearching(false);
        }
    };

    const handleBuyNow = async (product: Product) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            showToast('Please login to place an order', 'error');
            return;
        }

        setOrderingProduct(product.id);
        try {
            await orderApi.create({
                userId,
                items: [{
                    productId: product.id,
                    productName: product.name,
                    quantity: 1,
                    price: product.price,
                }]
            });
            showToast(` Order placed for ${product.name}!`);
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to place order', 'error');
        } finally {
            setOrderingProduct(null);
        }
    };

    const filtered = products.filter(p => {
        const cat = selectedCategory === 'All' || p.category === selectedCategory;
        const q = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return cat && q;
    });

    return (
        <div className="page-container">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                position: 'fixed', top: '84px', right: '24px', zIndex: 100,
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '12px 20px', borderRadius: '14px',
                                background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                color: toast.type === 'success' ? '#34d399' : '#f87171',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{toast.msg}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Product Explorer</h1>
                    <p className="page-subtitle">Discover and order products with AI-powered search</p>
                </div>

                {/* Search */}
                <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="Try: 'fast laptop for gaming' or 'wireless accessories under $200'"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                                style={{
                                    width: '100%', padding: '12px 16px 12px 44px',
                                    background: 'rgba(30,41,59,0.8)',
                                    border: '1px solid rgba(71,85,105,0.6)',
                                    borderRadius: '12px', color: 'white', fontSize: '14px',
                                    outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        <button
                            onClick={handleAiSearch}
                            disabled={isAiSearching}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 22px',
                                background: isAiSearching ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                border: 'none', borderRadius: '12px',
                                color: 'white', fontSize: '14px', fontWeight: 600,
                                cursor: isAiSearching ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Sparkles size={15} />
                            {isAiSearching ? 'Searching...' : 'AI Search'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {aiSearchResult && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    marginTop: '16px', padding: '16px',
                                    background: 'rgba(59,130,246,0.08)',
                                    border: '1px solid rgba(59,130,246,0.25)',
                                    borderRadius: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Sparkles size={14} style={{ color: '#60a5fa' }} />
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#60a5fa' }}>AI ANALYSIS</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>{aiSearchResult}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)}
                                style={{
                                    padding: '8px 18px',
                                    background: selectedCategory === cat ? 'rgba(59,130,246,0.2)' : 'rgba(30,41,59,0.6)',
                                    border: `1px solid ${selectedCategory === cat ? 'rgba(59,130,246,0.5)' : 'rgba(51,65,85,0.5)'}`,
                                    borderRadius: '20px',
                                    color: selectedCategory === cat ? '#60a5fa' : '#94a3b8',
                                    fontSize: '13px', fontWeight: selectedCategory === cat ? 600 : 400,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                        >
                            {cat}
                        </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </span>
                </div>

                {/* Products Grid */}
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                        <Package size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                        <p style={{ fontSize: '16px', fontWeight: 600 }}>No products found</p>
                        <p style={{ fontSize: '14px', marginTop: '4px' }}>Try a different search or category</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {filtered.map((product, i) => (
                            <motion.div key={product.id}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                        whileHover={{ y: -4 }}
                                        style={{
                                            background: 'rgba(15,23,42,0.85)',
                                            border: '1px solid rgba(51,65,85,0.6)',
                                            borderRadius: '20px', overflow: 'hidden',
                                        }}
                            >
                                {/* Product Image */}
                                <div style={{
                                    height: '140px',
                                    background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
                                    borderBottom: '1px solid rgba(51,65,85,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative',
                                }}>
                                    <Package size={48} style={{ color: 'rgba(99,102,241,0.4)' }} />
                                    {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                            background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)',
                                        }}>
                                            Only {product.stockQuantity} left!
                                        </div>
                                    )}
                                    {product.stockQuantity === 0 && (
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                            background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
                                        }}>
                                            Out of Stock
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'white', margin: 0, lineHeight: '1.3' }}>{product.name}</h3>
                                        <span style={{
                                            padding: '3px 10px', flexShrink: 0,
                                            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                                            borderRadius: '20px', fontSize: '11px', color: '#a5b4fc', fontWeight: 600,
                                        }}>
                      {product.category}
                    </span>
                                    </div>

                                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.5' }}>
                                        {product.description}
                                    </p>

                                    <div style={{ display: 'flex', gap: '2px', marginBottom: '16px', alignItems: 'center' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                                        ))}
                                        <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>5.0 (24 reviews)</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                        <div>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: '#60a5fa' }}>
                        ${product.price.toFixed(2)}
                      </span>
                                            <div style={{ fontSize: '11px', color: product.stockQuantity > 10 ? '#34d399' : product.stockQuantity > 0 ? '#fbbf24' : '#f87171', marginTop: '2px', fontWeight: 600 }}>
                                                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: product.stockQuantity > 0 ? 1.05 : 1 }}
                                            whileTap={{ scale: product.stockQuantity > 0 ? 0.95 : 1 }}
                                            onClick={() => product.stockQuantity > 0 && handleBuyNow(product)}
                                            disabled={product.stockQuantity === 0 || orderingProduct === product.id}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '10px 16px',
                                                background: product.stockQuantity === 0
                                                    ? 'rgba(51,65,85,0.3)'
                                                    : orderingProduct === product.id
                                                        ? 'rgba(59,130,246,0.3)'
                                                        : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                                border: 'none', borderRadius: '12px',
                                                color: product.stockQuantity === 0 ? '#475569' : 'white',
                                                fontSize: '13px', fontWeight: 700,
                                                cursor: product.stockQuantity === 0 || orderingProduct === product.id ? 'not-allowed' : 'pointer',
                                                boxShadow: product.stockQuantity > 0 && orderingProduct !== product.id ? '0 4px 15px rgba(59,130,246,0.3)' : 'none',
                                                whiteSpace: 'nowrap',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {orderingProduct === product.id ? (
                                                <>
                                                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                                    Ordering...
                                                </>
                                            ) : product.stockQuantity === 0 ? (
                                                'Out of Stock'
                                            ) : (
                                                <>
                                                    <ShoppingCart size={14} />
                                                    Buy Now
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}