import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, LogOut } from 'lucide-react';

const Dashboard = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 text-center"
        >
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
            </div>

            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                Login Successful!
            </h1>

            <p className="text-gray-400 mb-8 text-lg">
                Welcome to your dashboard. You have successfully authenticated.
            </p>

            <button
                onClick={handleLogout}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors flex items-center gap-2 mx-auto"
            >
                <LogOut className="w-4 h-4" />
                Logout
            </button>
        </motion.div>
    );
};

export default Dashboard;
