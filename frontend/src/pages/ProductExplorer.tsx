import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Star, ShoppingCart, Sparkles, Filter } from 'lucide-react';
import { productApi, aiApi } from '../services/api';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stockQuantity: number;
    imageUrl?: string;
}

const mockProducts: Product[] = [
    { id: '1', name: 'Quantum Laptop Pro', description: 'Ultra-fast computing power', price: 1299.99, category: 'Electronics', stockQuantity: 15 },
    { id: '2', name: 'Neural Headphones X', description: 'AI-enhanced audio experience', price: 299.99, category: 'Electronics', stockQuantity: 42 },
    { id: '3', name: 'HoloDesk Monitor', description: '4K holographic display technology', price: 899.99, category: 'Electronics', stockQuantity: 8 },
    { id: '4', name: 'CyberMouse Elite', description: 'Precision tracking at 25600 DPI', price: 79.99, category: 'Accessories', stockQuantity: 120 },
    { id: '5', name: 'Fusion Keyboard MX', description: 'Mechanical switches with RGB', price: 149.99, category: 'Accessories', stockQuantity: 67 },
    { id: '6', name: 'CloudStorage Hub', description: '2TB portable NVMe storage', price: 199.99, category: 'Storage', stockQuantity: 34 },
];

const categories = ['All', 'Electronics', 'Accessories', 'Storage'];

export default function ProductExplorer() {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [aiSearchResult, setAiSearchResult] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productApi.getAll();
            if (response.data && response.data.length > 0) {
                setProducts(response.data);
            }
        } catch {
            // use mock data
        }
    };

    const handleAiSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsAiSearching(true);
        setAiSearchResult('');
        try {
            const productNames = products.map(p => p.name).join(', ');
            const response = await aiApi.search(searchQuery, productNames);
            setAiSearchResult(response.data);
        } catch {
            setAiSearchResult('AI search unavailable. Showing filtered results.');
        } finally {
            setIsAiSearching(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen pt-20 px-6 pb-6 relative z-10">
            <div className="max-w-7xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Product Explorer
                    </h1>
                    <p className="text-slate-400 mt-1">Discover products with AI-powered search</p>
                </motion.div>

                {/* AI Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glassmorphism rounded-2xl p-6 mb-6"
                >
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search naturally... e.g. 'I need a fast laptop for gaming'"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAiSearch}
                            disabled={isAiSearching}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-medium disabled:opacity-50"
                        >
                            <Sparkles size={16} className={isAiSearching ? 'animate-spin' : ''} />
                            {isAiSearching ? 'Searching...' : 'AI Search'}
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {aiSearchResult && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={14} className="text-blue-400" />
                                    <span className="text-xs text-blue-400 font-medium">AI Analysis</span>
                                </div>
                                <p className="text-sm text-slate-300">{aiSearchResult}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Category Filter */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {categories.map(cat => (
                        <motion.button
                            key={cat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                                selectedCategory === cat
                                    ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                                    : 'glassmorphism text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <Filter size={14} />
                            {cat}
                        </motion.button>
                    ))}
                    <span className="ml-auto text-sm text-slate-400 self-center">
            {filteredProducts.length} products
          </span>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filteredProducts.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -4 }}
                                className="glassmorphism rounded-2xl p-5 cursor-pointer group"
                            >
                                {/* Product Icon */}
                                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-slate-700/50 flex items-center justify-center mb-4 group-hover:border-blue-500/30 transition-all">
                                    <Package size={40} className="text-blue-400/60 group-hover:text-blue-400 transition-colors" />
                                </div>

                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-sm">{product.name}</h3>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {product.category}
                  </span>
                                </div>

                                <p className="text-xs text-slate-400 mb-3">{product.description}</p>

                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                    <span className="text-xs text-slate-400 ml-1">5.0</span>
                                </div>

                                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-400">
                    ${product.price.toFixed(2)}
                  </span>
                                    <div className="flex items-center gap-2">
                    <span className={`text-xs ${product.stockQuantity > 10 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                    </span>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg transition-all"
                                        >
                                            <ShoppingCart size={14} className="text-blue-400" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}