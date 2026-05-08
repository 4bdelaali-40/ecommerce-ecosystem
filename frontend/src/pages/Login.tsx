import { useState } from 'react';
import { motion } from 'framer-motion';
import { authApi } from '../services/api';
import { LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginProps { onLogin: () => void; }

export default function Login({ onLogin }: LoginProps) {
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = isRegister
                ? await authApi.register(form)
                : await authApi.login(form.email, form.password);

            console.log('Login response:', response.data); // ← AJOUTE ÇA

            const { token, userId } = response.data;
            localStorage.setItem('token', token);
            if (userId) localStorage.setItem('userId', userId);
            onLogin();
            window.location.href = '/';
        } catch (err: any) {
            console.log('Login error:', err.response); // ← ET ÇA
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const labelStyle = {
        display: 'block', fontSize: '13px',
        fontWeight: 600, color: '#cbd5e1', marginBottom: '6px',
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px', position: 'relative', zIndex: 10,
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '440px' }}
            >
                <div style={{
                    background: 'rgba(15, 23, 42, 0.97)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '28px', padding: '44px',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 80px rgba(99,102,241,0.06)',
                    backdropFilter: 'blur(20px)',
                }}>

                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                width: '68px', height: '68px',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                borderRadius: '22px', margin: '0 auto 16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 40px rgba(99,102,241,0.4)',
                            }}
                        >
                            <span style={{ fontSize: '30px', fontWeight: 800, color: 'white' }}>E</span>
                        </motion.div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: 0 }}>EcoSphere</h1>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
                            {isRegister ? 'Create your account to get started' : 'Sign in to Mission Control'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                            {isRegister && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={labelStyle}>First Name</label>
                                        <input type="text" placeholder="John" value={form.firstName}
                                               onChange={e => setForm({ ...form, firstName: e.target.value })}
                                               required style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Last Name</label>
                                        <input type="text" placeholder="Doe" value={form.lastName}
                                               onChange={e => setForm({ ...form, lastName: e.target.value })}
                                               required style={inputStyle} />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label style={labelStyle}>Email Address</label>
                                <input
                                    type="email" placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        required
                                        style={{ ...inputStyle, paddingRight: '48px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: '14px', top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: showPassword ? '#60a5fa' : '#475569',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '4px', borderRadius: '6px', transition: 'color 0.2s',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {!isRegister && (
                                    <div style={{ textAlign: 'right', marginTop: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#60a5fa', cursor: 'pointer' }}>
                      Forgot password?
                    </span>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '12px 16px',
                                        background: 'rgba(239,68,68,0.1)',
                                        border: '1px solid rgba(239,68,68,0.3)',
                                        borderRadius: '12px', color: '#f87171', fontSize: '13px',
                                    }}
                                >
                                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                    {error}
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    border: 'none', borderRadius: '14px',
                                    color: 'white', fontSize: '15px', fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: loading ? 'none' : '0 6px 24px rgba(99,102,241,0.35)',
                                    marginTop: '4px', transition: 'all 0.2s',
                                }}
                            >
                                {loading ? (
                                    <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                ) : (
                                    <>
                                        {isRegister ? <UserPlus size={17} /> : <LogIn size={17} />}
                                        {isRegister ? 'Create Account' : 'Sign In'}
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(51,65,85,0.5)' }} />
                        <span style={{ fontSize: '12px', color: '#475569' }}>or</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(51,65,85,0.5)' }} />
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', margin: 0 }}>
                        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(''); setShowPassword(false); }}
                            style={{ color: '#60a5fa', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >
                            {isRegister ? 'Sign In' : 'Create Account'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}