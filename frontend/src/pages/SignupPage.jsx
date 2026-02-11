import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Key, ArrowRight, Loader2 } from 'lucide-react';
import { createAccount, generateOtp } from '../api';

const SignupPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '', email: '', otp: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerateOtp = async () => {
        if (!formData.email) {
            setError('Please enter your email first');
            return;
        }
        setIsLoading(true);
        try {
            const response = await generateOtp(formData.email);
            if (response.success) {
                setOtpSent(true);
                setError('');
                alert(response.message);
            } else {
                setError(response.message || 'Failed to send OTP');
            }
        } catch (err) {
            console.error("OTP Error:", err);
            setError('Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.otp) {
            setError('Please enter the OTP');
            return;
        }
        try {
            await createAccount({
                username: formData.username,
                password: formData.password,
                email: formData.email
            }, formData.otp);
            navigate('/login');
        } catch (err) {
            setError('Failed to create account. Invalid OTP or User exists.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-8"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Create Account
                </h2>
                <p className="text-gray-400 mt-2">Join us today</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-6 text-center text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        className="input-field pl-12"
                        required
                    />
                </div>

                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field pl-12"
                        required
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input-field pl-12"
                        required
                    />
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Key className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            value={formData.otp}
                            onChange={handleChange}
                            className="input-field pl-12"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerateOtp}
                        disabled={isLoading || !formData.email}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-sm font-medium text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : otpSent ? 'Resend OTP' : 'Get OTP'}
                    </button>
                </div>

                <button type="submit" className="btn-primary flex items-center justify-center gap-2 group mt-6">
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-8 text-center text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    Sign In
                </Link>
            </div>
        </motion.div>
    );
};

export default SignupPage;
