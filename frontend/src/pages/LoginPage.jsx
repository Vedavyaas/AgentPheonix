import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight } from 'lucide-react';
import { login } from '../api';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await login(credentials);
            if (response && response.token) {
                localStorage.setItem('token', response.token);
                window.location.href = '/';
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || 'Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="glass-panel p-8 w-full max-w-md mx-auto relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600"></div>

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4 border border-blue-500/20 shadow-inner shadow-blue-500/10">
                    <User className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    Welcome Back
                </h2>
                <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6 text-center text-sm backdrop-blur-sm"
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-blue-400/80 ml-1 tracking-wide">USERNAME</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Enter your username"
                            value={credentials.username}
                            onChange={handleChange}
                            className="input-field pl-12 bg-gray-900/50 border-gray-700/50 focus:border-blue-500/50 focus:bg-gray-900/80"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-blue-400/80 ml-1 tracking-wide">PASSWORD</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={credentials.password}
                            onChange={handleChange}
                            className="input-field pl-12 bg-gray-900/50 border-gray-700/50 focus:border-blue-500/50 focus:bg-gray-900/80"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-1">
                    <Link
                        to="/forgot-password"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors hover:underline decoration-blue-400/30 underline-offset-4"
                    >
                        Forgot Password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Sign In
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-800">
                <p className="text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline decoration-blue-400/30 underline-offset-4">
                        Create Account
                    </Link>
                </p>
            </div>
        </motion.div>
    );
};

export default LoginPage;
