import { useState } from 'react';
import { authApi } from '../services/api';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps { onLogin: () => void; }

export default function Login({ onLogin }: LoginProps) {
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = isRegister
                ? await authApi.register(form)
                : await authApi.login(form.email, form.password);

            const { token, userId, role } = res.data;
            localStorage.setItem('token', token);
            if (userId) localStorage.setItem('userId', userId);
            if (role) localStorage.setItem('role', role);  // ← AJOUTER

            onLogin();
            window.location.href = '/';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)', fontSize: '14px',
        outline: 'none', transition: 'border-color 0.15s',
        boxSizing: 'border-box',
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px', background: 'var(--bg-tertiary)',
        }}>
            <div style={{
                width: '100%', maxWidth: '400px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px',
                boxShadow: 'var(--shadow-md)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                        background: 'var(--accent)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px', fontSize: '20px', fontWeight: 700, color: '#fff',
                    }}>E</div>
                    <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                        EcoSphere
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                        {isRegister ? 'Create your account' : 'Sign in to your account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                        {isRegister && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>First name</label>
                                    <input type="text" placeholder="John" value={form.firstName}
                                           onChange={e => setForm({ ...form, firstName: e.target.value })}
                                           required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Last name</label>
                                    <input type="text" placeholder="Doe" value={form.lastName}
                                           onChange={e => setForm({ ...form, lastName: e.target.value })}
                                           required style={inputStyle} />
                                </div>
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Email</label>
                            <input type="email" placeholder="you@example.com" value={form.email}
                                   onChange={e => setForm({ ...form, email: e.target.value })}
                                   required style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••" value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required style={{ ...inputStyle, paddingRight: '42px' }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                                            padding: '2px',
                                        }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 14px', background: 'var(--danger-light)',
                                border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)',
                                color: 'var(--danger)', fontSize: '13px',
                            }}>
                                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '11px',
                            background: loading ? 'var(--border-strong)' : 'var(--accent)',
                            border: 'none', borderRadius: 'var(--radius-md)',
                            color: '#fff', fontSize: '14px', fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            marginTop: '4px', transition: 'background 0.15s',
                        }}>
                            {loading ? <div className="spinner" /> : isRegister ? 'Create Account' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '20px' }}>
                    {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                    <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            style={{ color: 'var(--accent)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                        {isRegister ? 'Sign in' : 'Create account'}
                    </button>
                </p>
            </div>
        </div>
    );
}