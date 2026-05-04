import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Star, ShoppingCart, Sparkles } from 'lucide-react';
import { productApi, aiApi } from '../services/api';

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

    useEffect(() => {
        productApi.getAll().then(r => { if (r.data?.length) setProducts(r.data); }).catch(() => {});
    }, []);

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

    const filtered = products.filter(p => {
        const cat = selectedCategory === 'All' || p.category === selectedCategory;
        const q = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return cat && q;
    });

    return (
        <div className="page-container">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Product Explorer</h1>
                    <p className="page-subtitle">Discover products with AI-powered natural language search</p>
                </div>

                {/* Search */}
                <div className="card card-glow-blue" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: aiSearchResult ? '16px' : '0' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="Try: 'I need a fast laptop for gaming' or 'wireless accessories'"
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
                                padding: '12px 20px',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                border: 'none', borderRadius: '12px',
                                color: 'white', fontSize: '14px', fontWeight: 600,
                                cursor: isAiSearching ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap', opacity: isAiSearching ? 0.7 : 1,
                            }}
                        >
                            <Sparkles size={15} />
                            {isAiSearching ? 'Searching...' : 'AI Search'}
                        </button>
                    </div>

                    {aiSearchResult && (
                        <div style={{
                            padding: '16px', marginTop: '16px',
                            background: 'rgba(59,130,246,0.08)',
                            border: '1px solid rgba(59,130,246,0.25)',
                            borderRadius: '12px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Sparkles size={14} style={{ color: '#60a5fa' }} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#60a5fa' }}>AI Analysis</span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>{aiSearchResult}</p>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '8px 18px',
                                background: selectedCategory === cat ? 'rgba(59,130,246,0.2)' : 'rgba(30,41,59,0.6)',
                                border: `1px solid ${selectedCategory === cat ? 'rgba(59,130,246,0.5)' : 'rgba(51,65,85,0.5)'}`,
                                borderRadius: '20px', color: selectedCategory === cat ? '#60a5fa' : '#94a3b8',
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {filtered.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            whileHover={{ y: -4 }}
                            style={{
                                background: 'rgba(15,23,42,0.85)',
                                border: '1px solid rgba(51,65,85,0.6)',
                                borderRadius: '20px', overflow: 'hidden',
                                cursor: 'pointer', transition: 'border-color 0.2s',
                            }}
                        >
                            {/* Image */}
                            <div style={{
                                height: '140px',
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                                borderBottom: '1px solid rgba(51,65,85,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Package size={44} style={{ color: 'rgba(99,102,241,0.5)' }} />
                            </div>

                            {/* Content */}
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'white', margin: 0 }}>{product.name}</h3>
                                    <span style={{
                                        padding: '3px 10px', background: 'rgba(99,102,241,0.15)',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                        borderRadius: '20px', fontSize: '11px', color: '#a5b4fc',
                                        whiteSpace: 'nowrap', flexShrink: 0,
                                    }}>
                    {product.category}
                  </span>
                                </div>

                                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.5' }}>
                                    {product.description}
                                </p>

                                <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={11} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                                    ))}
                                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>5.0</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: '#60a5fa' }}>
                    ${product.price.toFixed(2)}
                  </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        fontSize: '12px',
                        color: product.stockQuantity > 10 ? '#34d399' : '#fbbf24',
                    }}>
                      {product.stockQuantity} left
                    </span>
                                        <button
                                            style={{
                                                width: '36px', height: '36px',
                                                background: 'rgba(59,130,246,0.15)',
                                                border: '1px solid rgba(59,130,246,0.35)',
                                                borderRadius: '10px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            <ShoppingCart size={15} style={{ color: '#60a5fa' }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}