import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, Star, User, Search, TrendingDown } from 'lucide-react';
import { aiApi } from '../services/api';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }

const quickActions = [
    { label: 'Track my order', icon: Search },
    { label: 'Product recommendations', icon: Star },
    { label: 'Return policy', icon: TrendingDown },
];

export default function AiCommandCenter() {
    const [messages, setMessages] = useState<Message[]>([{
        id: '1', role: 'assistant',
        content: "Hello! I'm your EcoSphere AI assistant powered by Llama 3. I can help you with product recommendations, order tracking, and any questions. How can I assist you today?",
        timestamp: new Date(),
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'recommendations'>('chat');
    const [recommendations, setRecommendations] = useState('');
    const [recLoading, setRecLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const userId = localStorage.getItem('userId') || 'user-1';

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;

        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }]);
        setInput('');
        setLoading(true);

        try {
            const r = await aiApi.chat(userId, msg);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: r.data, timestamp: new Date() }]);
        } catch {
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I am temporarily unavailable. Please try again.', timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    const getRecommendations = async () => {
        setRecLoading(true);
        try {
            const r = await aiApi.recommendations({ userId, previousOrderedProducts: ['Laptop Pro'], availableCategories: ['Electronics', 'Accessories', 'Storage'], preferredPriceRange: '$50-$1500' });
            setRecommendations(r.data);
        } catch {
            setRecommendations('Unable to load recommendations. Please try again.');
        } finally {
            setRecLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 96px)' }}>

                {/* Header */}
                <div style={{ marginBottom: '20px', flexShrink: 0 }}>
                    <h1 className="page-title">AI Command Center</h1>
                    <p className="page-subtitle">Powered by Groq × Llama 3.1</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexShrink: 0 }}>
                    {[
                        { id: 'chat', label: 'AI Chatbot', icon: Bot },
                        { id: 'recommendations', label: 'Recommendations', icon: Star },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '9px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                                    background: activeTab === tab.id ? 'rgba(168,85,247,0.15)' : 'rgba(30,41,59,0.5)',
                                    border: `1px solid ${activeTab === tab.id ? 'rgba(168,85,247,0.4)' : 'rgba(51,65,85,0.5)'}`,
                                    color: activeTab === tab.id ? '#c084fc' : '#94a3b8',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}>
                            <tab.icon size={15} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)',
                        borderRadius: '20px', overflow: 'hidden', minHeight: 0,
                    }}>
                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {messages.map(msg => (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                        background: msg.role === 'assistant' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {msg.role === 'assistant' ? <Bot size={16} style={{ color: 'white' }} /> : <User size={16} style={{ color: 'white' }} />}
                                    </div>
                                    <div style={{
                                        maxWidth: '70%', padding: '12px 16px', borderRadius: '16px',
                                        background: msg.role === 'assistant' ? 'rgba(30,41,59,0.8)' : 'rgba(59,130,246,0.15)',
                                        border: msg.role === 'assistant' ? '1px solid rgba(51,65,85,0.5)' : '1px solid rgba(59,130,246,0.3)',
                                    }}>
                                        <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: '1.6', margin: 0 }}>{msg.content}</p>
                                        <span style={{ fontSize: '11px', color: '#475569', marginTop: '6px', display: 'block' }}>
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Bot size={16} style={{ color: 'white' }} />
                                    </div>
                                    <div style={{ padding: '14px 18px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        {[0, 1, 2].map(i => (
                                            <motion.div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#8b5cf6' }}
                                                        animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, delay: i * 0.12, repeat: Infinity }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Quick Actions */}
                        <div style={{ padding: '12px 24px 0', display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(51,65,85,0.3)' }}>
                            {quickActions.map(a => (
                                <button key={a.label} onClick={() => sendMessage(a.label)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                                            background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)',
                                            color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s',
                                        }}>
                                    <a.icon size={12} />
                                    {a.label}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '16px 24px', display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask anything about products, orders, or get recommendations..."
                                style={{
                                    flex: 1, padding: '12px 16px',
                                    background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(71,85,105,0.6)',
                                    borderRadius: '12px', color: 'white', fontSize: '14px', outline: 'none',
                                }}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={loading || !input.trim()}
                                style={{
                                    width: '44px', height: '44px',
                                    background: loading || !input.trim() ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                    border: 'none', borderRadius: '12px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                <Send size={16} style={{ color: 'white' }} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && (
                    <div style={{ flex: 1, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '20px', padding: '28px', overflow: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: 0 }}>Personalized Recommendations</h2>
                                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Based on your purchase history and preferences</p>
                            </div>
                            <button
                                onClick={getRecommendations}
                                disabled={recLoading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 20px',
                                    background: recLoading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                    border: 'none', borderRadius: '12px', color: 'white',
                                    fontSize: '14px', fontWeight: 600, cursor: recLoading ? 'not-allowed' : 'pointer',
                                }}>
                                <Sparkles size={15} />
                                {recLoading ? 'Analyzing...' : 'Get Recommendations'}
                            </button>
                        </div>

                        {recommendations ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        style={{ padding: '20px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <Sparkles size={16} style={{ color: '#c084fc' }} />
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#c084fc' }}>AI Recommendations</span>
                                </div>
                                <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{recommendations}</p>
                            </motion.div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <Star size={48} style={{ color: '#334155', margin: '0 auto 16px' }} />
                                <p style={{ color: '#64748b', fontSize: '15px' }}>Click "Get Recommendations" to see personalized suggestions</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}