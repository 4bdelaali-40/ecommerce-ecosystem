import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Plus, Trash2, Edit3, Package,
    TrendingUp, AlertTriangle, Brain, X, Check
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
    const [predLoading, setPredLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'products' | 'inventory'>('products');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

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
                setSuccessMsg('Product updated successfully!');
            } else {
                await productApi.create(form);
                setSuccessMsg('Product created successfully!');
            }
            await fetchProducts();
            setShowForm(false);
            setEditingProduct(null);
            setForm(emptyProduct);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
            setSuccessMsg('Error saving product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            await productApi.delete(id);
            setSuccessMsg('Product deleted!');
            await fetchProducts();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
            setSuccessMsg('Error deleting product');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setForm(product);
        setShowForm(true);
    };

    const predictInventory = async (product: Product) => {
        if (!product.id) return;
        setPredLoading(true);
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
            setPrediction({ productId: product.id, result: 'Prediction unavailable.' });
        } finally {
            setPredLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 px-6 pb-6 relative z-10">
            <div className="max-w-6xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                            <Shield size={28} className="text-red-400" />
                            Admin Panel
                        </h1>
                        <p className="text-slate-400 mt-1">Manage products and inventory</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowForm(true); setEditingProduct(null); setForm(emptyProduct); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add Product
                    </motion.button>
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm"
                        >
                            <Check size={16} />
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'products', label: 'Products', icon: Package },
                        { id: 'inventory', label: 'AI Inventory Prediction', icon: Brain },
                    ].map(tab => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                                activeTab === tab.id
                                    ? 'bg-red-600/30 text-red-400 border border-red-500/30'
                                    : 'glassmorphism text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="glassmorphism rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <span className="text-sm font-medium">{products.length} Products</span>
                            <TrendingUp size={16} className="text-green-400" />
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-400">Loading...</div>
                        ) : products.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Package size={40} className="mx-auto mb-3 opacity-30" />
                                <p>No products yet. Add your first product!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="text-xs text-slate-400 border-b border-slate-800">
                                        <th className="text-left p-4">Product</th>
                                        <th className="text-left p-4">Category</th>
                                        <th className="text-left p-4">Price</th>
                                        <th className="text-left p-4">Stock</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {products.map((product, i) => (
                                        <motion.tr
                                            key={product.id || i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="font-medium text-sm">{product.name}</div>
                                                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-48">{product.description}</div>
                                            </td>
                                            <td className="p-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">
                            {product.category}
                          </span>
                                            </td>
                                            <td className="p-4 text-blue-400 font-medium">${product.price}</td>
                                            <td className="p-4">
                          <span className={`text-sm font-medium ${
                              product.stockQuantity > 10 ? 'text-green-400' :
                                  product.stockQuantity > 0 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {product.stockQuantity}
                              {product.stockQuantity <= 10 && product.stockQuantity > 0 && (
                                  <AlertTriangle size={12} className="inline ml-1 text-yellow-400" />
                              )}
                          </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        onClick={() => handleEdit(product)}
                                                        className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg transition-all"
                                                    >
                                                        <Edit3 size={12} className="text-blue-400" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        onClick={() => handleDelete(product.id!)}
                                                        className="p-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={12} className="text-red-400" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* AI Inventory Prediction Tab */}
                {activeTab === 'inventory' && (
                    <div className="glassmorphism rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Brain size={20} className="text-purple-400" />
                            AI Inventory Prediction
                        </h2>
                        <p className="text-sm text-slate-400 mb-6">
                            Select a product to get AI-powered inventory predictions and reorder recommendations.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            {products.map(product => (
                                <motion.div
                                    key={product.id}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 rounded-xl border cursor-pointer transition-all"
                                    style={{
                                        borderColor: prediction?.productId === product.id ? '#a855f7' : '#374151',
                                        background: prediction?.productId === product.id ? '#a855f720' : 'rgba(15,23,42,0.5)'
                                    }}
                                    onClick={() => predictInventory(product)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium">{product.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">Stock: {product.stockQuantity}</div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            disabled={predLoading}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 rounded-lg text-xs text-purple-400"
                                        >
                                            <Brain size={12} className={predLoading && prediction?.productId === product.id ? 'animate-spin' : ''} />
                                            Predict
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {prediction && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain size={16} className="text-purple-400" />
                                    <span className="text-sm text-purple-400 font-medium">AI Prediction Result</span>
                                </div>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap">{prediction.result}</p>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Product Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={e => e.target === e.currentTarget && setShowForm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="glassmorphism rounded-2xl p-6 w-full max-w-md"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold">
                                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                                    </h2>
                                    <button onClick={() => setShowForm(false)}>
                                        <X size={20} className="text-slate-400 hover:text-slate-200" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                                    />
                                    <textarea
                                        placeholder="Description"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        rows={2}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 resize-none"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={form.price || ''}
                                            onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
                                            className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            value={form.stockQuantity || ''}
                                            onChange={e => setForm({ ...form, stockQuantity: parseInt(e.target.value) })}
                                            className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 py-3 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-sm font-medium disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
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