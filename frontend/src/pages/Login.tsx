import { useState } from 'react';
import { motion } from 'framer-motion';
import { authApi } from '../services/api';

interface LoginProps {
    onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        email: '', password: '', firstName: '', lastName: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let response;
            if (isRegister) {
                response = await authApi.register(form);
            } else {
                response = await authApi.login(form.email, form.password);
            }

            const { token, userId } = response.data;
            localStorage.setItem('token', token);
            if (userId) localStorage.setItem('userId', userId);
            onLogin();
            window.location.href = '/';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glassmorphism rounded-2xl p-8 w-full max-w-md glow-blue"
            >
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-float">
                        <span className="text-2xl font-bold">E</span>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        EcoSphere
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {isRegister ? 'Create your account' : 'Mission Control Access'}
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={form.firstName}
                                onChange={e => setForm({ ...form, firstName: e.target.value })}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={form.lastName}
                                onChange={e => setForm({ ...form, lastName: e.target.value })}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        required
                    />

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-400 text-sm text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg py-3 font-medium transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Access System'}
                    </motion.button>
                </form>

                <p className="text-center text-sm text-slate-400 mt-4">
                    {isRegister ? 'Already have access?' : "Don't have access?"}{' '}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        {isRegister ? 'Sign In' : 'Request Access'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}