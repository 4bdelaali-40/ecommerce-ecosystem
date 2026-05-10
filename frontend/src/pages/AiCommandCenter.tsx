import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Star, User } from 'lucide-react';
import { aiApi } from '../services/api';

interface Message { id: string; role: 'user' | 'assistant'; content: string; time: Date; }

const quickActions = ['Track my order', 'Product recommendations', 'Return policy'];

export default function AiCommandCenter() {
    const [messages, setMessages] = useState<Message[]>([{
        id: '1', role: 'assistant', time: new Date(),
        content: "Hi! I'm EcoSphere's AI assistant powered by Llama 3. I can help with products, orders, and recommendations. How can I help?",
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<'chat' | 'recommendations'>('chat');
    const [recs, setRecs] = useState('');
    const [recLoading, setRecLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const userId = localStorage.getItem('userId') || 'user-1';

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg, time: new Date() }]);
        setInput(''); setLoading(true);
        try {
            const r = await aiApi.chat(userId, msg);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: r.data, time: new Date() }]);
        } catch {
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I am temporarily unavailable.', time: new Date() }]);
        } finally { setLoading(false); }
    };

    const getRecs = async () => {
        setRecLoading(true);
        try {
            const r = await aiApi.recommendations({ userId, previousOrderedProducts: ['Laptop Pro'], availableCategories: ['Electronics', 'Accessories'], preferredPriceRange: '$50-$1500' });
            setRecs(r.data);
        } catch { setRecs('Unable to load recommendations.'); }
        finally { setRecLoading(false); }
    };

    return (
        <div style={{ padding: '80px 24px 0', maxWidth: '900px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ marginBottom: '16px', flexShrink: 0 }}>
                <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>AI Center</h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Powered by Groq × Llama 3.1</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexShrink: 0 }}>
                {[{ id: 'chat', label: 'Chatbot', icon: Bot }, { id: 'recommendations', label: 'Recommendations', icon: Star }].map(t => (
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

            {/* Chat Tab */}
            {tab === 'chat' && (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: 0,
                    marginBottom: '24px',
                }}>
                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                    background: msg.role === 'assistant' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                                    border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {msg.role === 'assistant'
                                        ? <Bot size={15} style={{ color: 'var(--accent)' }} />
                                        : <User size={15} style={{ color: 'var(--text-secondary)' }} />}
                                </div>
                                <div style={{
                                    maxWidth: '72%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                    background: msg.role === 'assistant' ? 'var(--bg-secondary)' : 'var(--accent)',
                                    border: '1px solid var(--border)',
                                }}>
                                    <p style={{ fontSize: '14px', color: msg.role === 'assistant' ? 'var(--text-primary)' : '#fff', lineHeight: '1.6', margin: 0 }}>
                                        {msg.content}
                                    </p>
                                    <span style={{ fontSize: '11px', color: msg.role === 'assistant' ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)', marginTop: '4px', display: 'block' }}>
                    {msg.time.toLocaleTimeString()}
                  </span>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-light)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={15} style={{ color: 'var(--accent)' }} />
                                </div>
                                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', animation: `spin 1s ease-in-out ${i * 0.2}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick Actions */}
                    <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {quickActions.map(a => (
                            <button key={a} onClick={() => send(a)}
                                    style={{
                                        padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                        color: 'var(--text-secondary)', cursor: 'pointer',
                                    }}>
                                {a}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
                        <input
                            type="text" value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()}
                            placeholder="Ask about products, orders, or get recommendations..."
                            style={{
                                flex: 1, padding: '10px 14px',
                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                                fontSize: '14px', outline: 'none',
                            }}
                        />
                        <button onClick={() => send()} disabled={loading || !input.trim()}
                                style={{
                                    width: '40px', height: '40px',
                                    background: loading || !input.trim() ? 'var(--bg-secondary)' : 'var(--accent)',
                                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                                    cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                            <Send size={15} style={{ color: loading || !input.trim() ? 'var(--text-muted)' : '#fff' }} />
                        </button>
                    </div>
                </div>
            )}

            {/* Recommendations Tab */}
            {tab === 'recommendations' && (
                <div style={{
                    flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '24px',
                    overflowY: 'auto', marginBottom: '24px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Personalized Recommendations</h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Based on your purchase history</p>
                        </div>
                        <button onClick={getRecs} disabled={recLoading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '9px 16px', background: 'var(--accent)',
                                    border: 'none', borderRadius: 'var(--radius-md)',
                                    color: '#fff', fontSize: '13px', fontWeight: 500,
                                    cursor: recLoading ? 'not-allowed' : 'pointer', opacity: recLoading ? 0.7 : 1,
                                }}>
                            <Sparkles size={14} />
                            {recLoading ? 'Analyzing...' : 'Get Recommendations'}
                        </button>
                    </div>

                    {recs ? (
                        <div style={{ padding: '16px', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7' }}>
                            {recs}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <Star size={40} style={{ color: 'var(--border-strong)', margin: '0 auto 12px', display: 'block' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Click "Get Recommendations" to start</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}