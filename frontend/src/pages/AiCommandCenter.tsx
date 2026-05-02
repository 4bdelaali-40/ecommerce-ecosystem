import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, TrendingDown, Search, Star, User } from 'lucide-react';
import { aiApi } from '../services/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const quickActions = [
    { label: 'Track my order', icon: Search },
    { label: 'Product recommendations', icon: Star },
    { label: 'Return policy', icon: TrendingDown },
];

export default function AiCommandCenter() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your EcoSphere AI assistant. I can help you with product recommendations, order tracking, and any questions about our platform. How can I help you today?",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'recommendations' | 'search'>('chat');
    const [recommendations, setRecommendations] = useState('');
    const [recLoading, setRecLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const userId = localStorage.getItem('userId') || 'user-1';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await aiApi.chat(userId, messageText);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I am currently unavailable. Please try again later.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const getRecommendations = async () => {
        setRecLoading(true);
        try {
            const response = await aiApi.recommendations({
                userId,
                previousOrderedProducts: ['Laptop Pro'],
                availableCategories: ['Electronics', 'Accessories', 'Storage'],
                preferredPriceRange: '$50-$1500',
            });
            setRecommendations(response.data);
        } catch {
            setRecommendations('Unable to load recommendations at this time.');
        } finally {
            setRecLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 px-6 pb-6 relative z-10">
            <div className="max-w-6xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        AI Command Center
                    </h1>
                    <p className="text-slate-400 mt-1">Powered by Claude AI</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'chat', label: 'AI Chatbot', icon: Bot },
                        { id: 'recommendations', label: 'Recommendations', icon: Star },
                    ].map(tab => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                                activeTab === tab.id
                                    ? 'bg-purple-600/30 text-purple-400 border border-purple-500/30'
                                    : 'glassmorphism text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="glassmorphism rounded-2xl overflow-hidden" style={{ height: '65vh' }}>
                        {/* Messages */}
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                <AnimatePresence>
                                    {messages.map(msg => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                msg.role === 'assistant'
                                                    ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                                                    : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                                            }`}>
                                                {msg.role === 'assistant'
                                                    ? <Bot size={16} />
                                                    : <User size={16} />
                                                }
                                            </div>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                                                msg.role === 'assistant'
                                                    ? 'bg-slate-800/70 text-slate-200'
                                                    : 'bg-blue-600/30 border border-blue-500/30 text-slate-200'
                                            }`}>
                                                {msg.content}
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {msg.timestamp.toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {loading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-slate-800/70 rounded-2xl px-4 py-3">
                                            <div className="flex gap-1">
                                                {[0, 1, 2].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-2 h-2 bg-purple-400 rounded-full"
                                                        animate={{ y: [0, -6, 0] }}
                                                        transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Actions */}
                            <div className="px-6 pb-2 flex gap-2 flex-wrap">
                                {quickActions.map(action => (
                                    <motion.button
                                        key={action.label}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => sendMessage(action.label)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-purple-500/30 transition-all"
                                    >
                                        <action.icon size={12} />
                                        {action.label}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-slate-800">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                        placeholder="Ask anything about products, orders, or get recommendations..."
                                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => sendMessage()}
                                        disabled={loading || !input.trim()}
                                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl disabled:opacity-50 transition-all"
                                    >
                                        <Send size={18} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glassmorphism rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold">Personalized Recommendations</h2>
                                <p className="text-sm text-slate-400 mt-1">Based on your purchase history</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={getRecommendations}
                                disabled={recLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm disabled:opacity-50"
                            >
                                <Sparkles size={16} className={recLoading ? 'animate-spin' : ''} />
                                {recLoading ? 'Analyzing...' : 'Get Recommendations'}
                            </motion.button>
                        </div>

                        {recommendations ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={16} className="text-purple-400" />
                                    <span className="text-sm text-purple-400 font-medium">AI Recommendations</span>
                                </div>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap">{recommendations}</p>
                            </motion.div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <Star size={40} className="mx-auto mb-3 opacity-30" />
                                <p>Click "Get Recommendations" to get personalized product suggestions powered by AI</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}